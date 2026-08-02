"""
ChainTrend AI backend — FastAPI server.

Every endpoint here matches a function in the frontend's src/services/api.js.
Run this locally, set VITE_API_BASE_URL to point at it, flip
VITE_USE_MOCK_DATA=false, and the existing frontend will call these real
endpoints with zero UI code changes.
"""
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

from .config import ALLOWED_ORIGINS, SUPPORTED_COINS, COIN_META
from .data_fetch import get_daily_ohlcv
from .indicators import add_indicators, risk_metrics
from .model import train_models, predict_next, FEATURE_COLUMNS, get_feature_importance
from .chains import get_network_metrics, get_usdt_cross_chain, recommend_usdt_network

app = FastAPI(title="ChainTrend AI API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _validate_coin(coin: str) -> str:
    coin = coin.upper()
    if coin not in SUPPORTED_COINS:
        raise HTTPException(status_code=400, detail=f"Unsupported coin '{coin}'. Use one of {SUPPORTED_COINS}.")
    return coin


_CANDLE_RENAME = {
    "macd_signal": "macdSignal",
    "macd_histogram": "macdHistogram",
    "bb_upper": "bbUpper",
    "bb_middle": "bbMiddle",
    "bb_lower": "bbLower",
    "daily_return": "dailyReturn",
}


def _candles_to_camel_case(df):
    """Renames pandas' snake_case indicator columns to the camelCase shape the frontend charts expect."""
    records = df.rename(columns=_CANDLE_RENAME).to_dict(orient="records")
    # Replace any NaN (from rolling-window warmup) with None so it serialises as JSON null, not NaN.
    for row in records:
        for k, v in row.items():
            if isinstance(v, float) and pd.isna(v):
                row[k] = None
    return records


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/market/overview")
def market_overview():
    results = []
    for coin in SUPPORTED_COINS:
        df, source = get_daily_ohlcv(coin, days=30)
        last, prev = df.iloc[-1], df.iloc[-2]
        change_pct = (last["close"] - prev["close"]) / prev["close"] * 100
        results.append({
            "id": coin, "symbol": coin, **COIN_META[coin],
            "price": round(float(last["close"]), 6 if last["close"] < 1 else 2),
            "change24h": round(float(last["close"] - prev["close"]), 4),
            "changePct24h": round(float(change_pct), 2),
            "volume24h": round(float(last["volume"]), 2),
            "high24h": round(float(last["high"]), 4),
            "low24h": round(float(last["low"]), 4),
            "dataSource": source,
        })
    return results


@app.get("/market/history")
def market_history(coin: str = Query(...), days: int = Query(365, ge=7, le=1460)):
    coin = _validate_coin(coin)
    df, source = get_daily_ohlcv(coin, days=days)
    df = add_indicators(df).tail(days)
    return _candles_to_camel_case(df)


@app.get("/indicators")
def indicators(coin: str = Query(...)):
    coin = _validate_coin(coin)
    df, source = get_daily_ohlcv(coin, days=180)
    df = add_indicators(df)
    return _candles_to_camel_case(df)


@app.get("/predict")
def predict(coin: str = Query(...), horizon: str = Query("7d")):
    coin = _validate_coin(coin)
    df, source = get_daily_ohlcv(coin, days=90)
    if len(df) < 40:
        raise HTTPException(status_code=422, detail="Not enough history to train a model for this coin yet.")
    result = predict_next(coin, df)
    result["dataSource"] = source
    # Normalise to the snake_case metrics contract documented in the frontend README.
    m = result.pop("metrics")
    result["metrics"] = {
        "mae": m["mae"], "rmse": m["rmse"], "mape": m["mape"],
        "r2": m["r2"], "directional_accuracy": m["directionalAccuracy"],
    }
    return result


@app.get("/models/metrics")
def models_metrics(coin: str = Query("ETH")):
    coin = _validate_coin(coin)
    df, source = get_daily_ohlcv(coin, days=90)
    trained = train_models(coin, df)

    regression_table = [
        {"model": name, **metrics, "status": "selected" if name == trained["best_model_name"] else "trained"}
        for name, metrics in trained["regression_results"].items()
    ]
    return {
        "coin": coin,
        "dataSource": source,
        "trainSize": trained["train_size"],
        "testSize": trained["test_size"],
        "regression": regression_table,
        "classification": trained["classification"],
        "featureImportance": get_feature_importance(trained),
        "trainingHistory": None,
        "note": (
            "Regression models trained live via scikit-learn with a chronological "
            "80/20 split. Feature importance is real, extracted from the trained "
            "Random Forest classifier. 'trainingHistory' (epoch loss curves) is "
            "null because it only applies to the planned LSTM model, which is not "
            "yet trained — see the Methodology page."
        ),
    }


@app.get("/risk")
def risk(coin: str = Query(...)):
    coin = _validate_coin(coin)
    df, source = get_daily_ohlcv(coin, days=365)
    metrics = risk_metrics(df)
    metrics["coin"] = coin
    metrics["dataSource"] = source
    metrics["liquidityScore"] = {"BTC": 92, "ETH": 92, "BNB": 84, "TRX": 78}.get(coin, 80)
    return metrics


@app.get("/chains/metrics")
def chains_metrics():
    return {"networks": get_network_metrics(), "usdt": get_usdt_cross_chain()}


@app.get("/chains/usdt/recommend")
def usdt_recommend(amount: float = Query(500, gt=0), priority: str = Query("lowest_cost")):
    return recommend_usdt_network(amount, priority)
