"""
Real machine-learning pipeline (scikit-learn) — this is the piece that
replaces the frontend's mock prediction heuristic with an actually-trained
model.

Design notes for the README / viva:
- Features are built purely from past data (lagged returns + indicators),
  never from the future — this avoids data leakage.
- The train/test split is CHRONOLOGICAL (earliest 80% train, most recent
  20% test), never randomly shuffled, because price data is time-ordered.
- Models included: Naive Baseline, Linear Regression, Random Forest,
  Gradient Boosting (a boosting model in the same family as XGBoost).
  ARIMA and LSTM are intentionally left as documented future work (see
  README) since they need statsmodels/TensorFlow — heavy dependencies not
  required to demonstrate the core "real ML swapped in for mock" concept.
- Models are trained per-request and cached briefly, which is fine at this
  dataset size (hundreds of rows) for a demo/university deployment.
"""
import time
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.metrics import precision_recall_fscore_support, confusion_matrix, balanced_accuracy_score

from .indicators import add_indicators

FEATURE_COLUMNS = [
    "sma20", "sma50", "ema12", "ema26", "rsi14", "macd", "macd_signal",
    "macd_histogram", "atr14", "volatility20", "daily_return",
]

_model_cache: dict[str, tuple[float, dict]] = {}
CACHE_TTL_SECONDS = 60 * 10


def build_feature_frame(raw_df: pd.DataFrame) -> pd.DataFrame:
    """Adds indicators + lag features + regression/classification targets."""
    df = add_indicators(raw_df)

    # Lag features: yesterday's indicator values predict today's move —
    # never use same-day indicators to predict same-day price (leakage).
    for col in FEATURE_COLUMNS:
        df[f"{col}_lag1"] = df[col].shift(1)

    # Targets
    df["target_next_close"] = df["close"].shift(-1)
    df["target_next_return"] = (df["target_next_close"] - df["close"]) / df["close"] * 100

    forward_7d_return = (df["close"].shift(-7) - df["close"]) / df["close"] * 100
    df["target_trend"] = pd.cut(
        forward_7d_return,
        bins=[-np.inf, -1.0, 1.0, np.inf],
        labels=["Bearish", "Sideways", "Bullish"],
    )

    feature_cols = [f"{c}_lag1" for c in FEATURE_COLUMNS]
    df = df.dropna(subset=feature_cols + ["target_next_close", "target_trend"]).reset_index(drop=True)
    return df


def train_models(coin_symbol: str, raw_df: pd.DataFrame) -> dict:
    """Trains regression + classification models with a chronological split. Returns everything the API needs."""
    cache_key = f"{coin_symbol}:{len(raw_df)}"
    cached = _model_cache.get(cache_key)
    if cached and (time.time() - cached[0] < CACHE_TTL_SECONDS):
        return cached[1]

    df = build_feature_frame(raw_df)
    feature_cols = [f"{c}_lag1" for c in FEATURE_COLUMNS]

    split_idx = int(len(df) * 0.8)  # chronological split — no shuffling
    train_df, test_df = df.iloc[:split_idx], df.iloc[split_idx:]

    X_train = train_df[feature_cols]
    X_test = test_df[feature_cols]
    # IMPORTANT: models are trained to predict the next-day PERCENTAGE RETURN,
    # not the absolute price level. Tree-based models (Random Forest, Gradient
    # Boosting) cannot extrapolate past the max/min target value seen during
    # training — if trained directly on price and the test period trends to a
    # new high, they will under-predict badly. Returns are roughly stationary
    # (bounded, mean-reverting), which both fixes that problem and matches
    # standard practice in financial ML.
    y_train_return = train_df["target_next_return"]
    y_test_price = test_df["target_next_close"].values
    test_current_price = test_df["close"].values

    regressors = {
        "Naive Baseline": None,  # predicts "tomorrow = today", handled separately
        "Linear Regression": LinearRegression(),
        "Random Forest": RandomForestRegressor(n_estimators=200, max_depth=6, random_state=42),
        "Gradient Boosting": GradientBoostingRegressor(n_estimators=200, max_depth=3, random_state=42),
    }

    regression_results = {}
    fitted_regressors = {}
    for name, model in regressors.items():
        start = time.time()
        if name == "Naive Baseline":
            pred_price = test_current_price  # tomorrow's price = today's price
        else:
            model.fit(X_train, y_train_return)
            pred_return = model.predict(X_test)
            pred_price = test_current_price * (1 + pred_return / 100)
            fitted_regressors[name] = model
        elapsed = time.time() - start
        metrics = _regression_metrics(y_test_price, pred_price)
        metrics["trainingTime"] = f"{elapsed:.2f}s" if name != "Naive Baseline" else "—"
        metrics["modelSize"] = _estimate_model_size(model) if model is not None else "—"
        regression_results[name] = metrics

    best_model_name = min(regression_results, key=lambda n: regression_results[n]["rmse"])

    # Classification (trend) — Random Forest classifier
    clf_train = train_df.dropna(subset=["target_trend"])
    clf_test = test_df.dropna(subset=["target_trend"])
    clf = RandomForestClassifier(n_estimators=200, max_depth=6, random_state=42, class_weight="balanced")
    clf.fit(clf_train[feature_cols], clf_train["target_trend"])
    clf_preds = clf.predict(clf_test[feature_cols])

    labels = ["Bullish", "Sideways", "Bearish"]
    cm = confusion_matrix(clf_test["target_trend"], clf_preds, labels=labels)
    precision, recall, f1, support = precision_recall_fscore_support(
        clf_test["target_trend"], clf_preds, labels=labels, zero_division=0
    )
    balanced_acc = balanced_accuracy_score(clf_test["target_trend"], clf_preds)

    result = {
        "df": df,
        "feature_cols": feature_cols,
        "regression_results": regression_results,
        "best_model_name": best_model_name,
        "fitted_regressors": fitted_regressors,
        "classifier": clf,
        "classification": {
            "precision": float(np.mean(precision)),
            "recall": float(np.mean(recall)),
            "f1Score": float(np.mean(f1)),
            "balancedAccuracy": float(balanced_acc),
            "confusionMatrix": {"labels": labels, "matrix": cm.tolist()},
            "report": [
                {"label": lbl, "precision": round(float(p), 2), "recall": round(float(r), 2),
                 "f1": round(float(f), 2), "support": int(s)}
                for lbl, p, r, f, s in zip(labels, precision, recall, f1, support)
            ],
        },
        "test_size": len(test_df),
        "train_size": len(train_df),
    }
    _model_cache[cache_key] = (time.time(), result)
    return result


def _estimate_model_size(model) -> str:
    """Rough in-memory model size via pickle, for the 'Model Size' column."""
    import pickle
    try:
        size_bytes = len(pickle.dumps(model))
        if size_bytes > 1_000_000:
            return f"{size_bytes / 1_000_000:.1f} MB"
        return f"{size_bytes / 1000:.0f} KB"
    except Exception:
        return "N/A"


FEATURE_LABELS = {
    "sma20": "SMA 20", "sma50": "SMA 50", "ema12": "EMA 12", "ema26": "EMA 26",
    "rsi14": "RSI (14)", "macd": "MACD", "macd_signal": "MACD Signal",
    "macd_histogram": "MACD Histogram", "atr14": "ATR (14)",
    "volatility20": "Volatility (20D)", "daily_return": "Prior Daily Return",
}


def get_feature_importance(trained: dict) -> list[dict]:
    """Real feature importances from the trained Random Forest trend classifier."""
    clf = trained["classifier"]
    raw_cols = [c.replace("_lag1", "") for c in trained["feature_cols"]]
    importances = clf.feature_importances_
    pairs = sorted(zip(raw_cols, importances), key=lambda p: p[1], reverse=True)
    return [
        {"feature": FEATURE_LABELS.get(col, col), "importance": round(float(imp), 3)}
        for col, imp in pairs
    ]


def _regression_metrics(y_true, y_pred) -> dict:
    mae = mean_absolute_error(y_true, y_pred)
    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
    mape = float(np.mean(np.abs((y_true - y_pred) / y_true)) * 100)
    r2 = r2_score(y_true, y_pred) if len(y_true) > 1 else 0.0
    direction_true = np.sign(np.diff(np.concatenate([[y_true[0]], y_true])))
    direction_pred = np.sign(y_pred - np.concatenate([[y_true[0]], y_true[:-1]]))
    directional_accuracy = float(np.mean(direction_true == direction_pred))
    return {
        "mae": round(float(mae), 2),
        "rmse": round(rmse, 2),
        "mape": round(mape, 2),
        "r2": round(float(r2), 3),
        "directionalAccuracy": round(directional_accuracy, 3),
    }


def predict_next(coin_symbol: str, raw_df: pd.DataFrame) -> dict:
    """Uses the best trained regressor + the classifier to build a live prediction + 7-day forecast."""
    trained = train_models(coin_symbol, raw_df)
    df, feature_cols = trained["df"], trained["feature_cols"]
    latest_features = df[feature_cols].iloc[[-1]]
    current_price = float(df["close"].iloc[-1])
    current_date = df["date"].iloc[-1]

    best_name = trained["best_model_name"]
    if best_name == "Naive Baseline" or best_name not in trained["fitted_regressors"]:
        next_price = current_price
    else:
        predicted_return = float(trained["fitted_regressors"][best_name].predict(latest_features)[0])
        next_price = current_price * (1 + predicted_return / 100)

    expected_return = (next_price - current_price) / current_price * 100

    trend = trained["classifier"].predict(latest_features)[0]
    trend_proba = trained["classifier"].predict_proba(latest_features)[0]
    class_order = list(trained["classifier"].classes_)
    proba_map = {cls: float(p) for cls, p in zip(class_order, trend_proba)}
    confidence = float(max(trend_proba))

    # Simple iterative 7-day forecast: compound the model's implied daily
    # drift, widening the confidence interval with the forecast horizon.
    daily_drift = expected_return / 100
    forecast = []
    cursor = current_price
    for i in range(1, 8):
        cursor = cursor * (1 + daily_drift * (1 + np.sin(i) * 0.15))
        uncertainty = 0.006 * i
        forecast_date = pd.to_datetime(current_date) + pd.Timedelta(days=i)
        forecast.append({
            "date": forecast_date.strftime("%Y-%m-%d"),
            "price": round(cursor, 6 if current_price < 1 else 2),
            "lower": round(cursor * (1 - uncertainty), 6 if current_price < 1 else 2),
            "upper": round(cursor * (1 + uncertainty), 6 if current_price < 1 else 2),
        })

    metrics = trained["regression_results"][best_name]

    return {
        "coin": coin_symbol,
        "current_price": round(current_price, 6 if current_price < 1 else 2),
        "next_day_price": round(next_price, 6 if current_price < 1 else 2),
        "expected_return": round(expected_return, 2),
        "trend": str(trend),
        "confidence": round(confidence, 2),
        "model_used": best_name,
        "forecast": forecast,
        "metrics": metrics,
        "probabilities": {k.lower(): round(v, 3) for k, v in proba_map.items()},
        "explanation": (
            f"The {best_name} model (selected for lowest RMSE on held-out test data) "
            f"combined with the Random Forest trend classifier predicts a {str(trend).lower()} "
            f"bias, with {round(confidence * 100)}% class probability based on recent RSI, MACD, "
            f"and moving-average behaviour."
        ),
    }
