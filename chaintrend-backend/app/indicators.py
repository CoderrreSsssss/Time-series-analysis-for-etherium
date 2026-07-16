"""
Technical indicator calculations — real, standard formulas (not mocked),
vectorised with pandas so they run efficiently over the full history.
"""
import numpy as np
import pandas as pd


def add_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """Takes an OHLCV dataframe and appends indicator columns in place-safe fashion."""
    df = df.copy()
    close = df["close"]

    df["sma20"] = close.rolling(20).mean()
    df["sma50"] = close.rolling(50).mean()
    df["ema12"] = close.ewm(span=12, adjust=False).mean()
    df["ema26"] = close.ewm(span=26, adjust=False).mean()

    df["rsi14"] = _rsi(close, 14)

    macd_line = df["ema12"] - df["ema26"]
    signal_line = macd_line.ewm(span=9, adjust=False).mean()
    df["macd"] = macd_line
    df["macd_signal"] = signal_line
    df["macd_histogram"] = macd_line - signal_line

    bb_mid = close.rolling(20).mean()
    bb_std = close.rolling(20).std()
    df["bb_upper"] = bb_mid + 2 * bb_std
    df["bb_middle"] = bb_mid
    df["bb_lower"] = bb_mid - 2 * bb_std

    df["atr14"] = _atr(df, 14)
    df["daily_return"] = close.pct_change() * 100
    df["volatility20"] = df["daily_return"].rolling(20).std() * np.sqrt(365)

    return df


def _rsi(close: pd.Series, period: int = 14) -> pd.Series:
    delta = close.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.ewm(alpha=1 / period, min_periods=period, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1 / period, min_periods=period, adjust=False).mean()
    rs = avg_gain / avg_loss.replace(0, np.nan)
    rsi = 100 - (100 / (1 + rs))
    return rsi.fillna(50)


def _atr(df: pd.DataFrame, period: int = 14) -> pd.Series:
    high, low, close = df["high"], df["low"], df["close"]
    prev_close = close.shift(1)
    tr = pd.concat([
        high - low,
        (high - prev_close).abs(),
        (low - prev_close).abs(),
    ], axis=1).max(axis=1)
    return tr.ewm(span=period, adjust=False).mean()


def risk_metrics(df: pd.DataFrame) -> dict:
    """Volatility, drawdown, Sharpe/Sortino, and Value-at-Risk from a price history."""
    returns = df["close"].pct_change().dropna() * 100
    closes = df["close"]

    running_peak = closes.cummax()
    drawdown_series = (closes - running_peak) / running_peak * 100
    max_dd = float(drawdown_series.min())

    mean_r, std_r = returns.mean(), returns.std()
    sharpe = float((mean_r / std_r) * np.sqrt(365)) if std_r else 0.0

    downside = returns[returns < 0]
    downside_std = downside.std() if len(downside) else 0
    sortino = float((mean_r / downside_std) * np.sqrt(365)) if downside_std else 0.0

    var95 = float(np.percentile(returns, 5)) if len(returns) else 0.0
    volatility = float(returns.rolling(20).std().iloc[-1] * np.sqrt(365)) if len(returns) >= 20 else float(std_r)

    risk_level = "Moderate"
    if volatility > 65:
        risk_level = "High"
    elif volatility < 35:
        risk_level = "Low"

    volatility_series = returns.rolling(20).std() * np.sqrt(365)

    return {
        "volatility": volatility,
        "maxDrawdown": max_dd,
        "sharpeRatio": sharpe,
        "sortinoRatio": sortino,
        "valueAtRisk95": var95,
        "riskLevel": risk_level,
        "drawdownSeries": [
            {"date": d, "drawdown": float(v)} for d, v in zip(df["date"], drawdown_series)
        ],
        "volatilityHistory": [
            {"date": d, "volatility": (float(v) if pd.notna(v) else None)}
            for d, v in zip(df["date"].iloc[1:], volatility_series)
        ],
        "returnDistribution": [float(v) for v in returns],
    }
