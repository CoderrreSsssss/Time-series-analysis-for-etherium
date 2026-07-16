/**
 * Mock model-performance data used on the Model Performance and
 * Trend Classification pages. These numbers are illustrative placeholders
 * for a university demonstration and will be replaced by real evaluation
 * metrics once the models are trained.
 */

export const regressionMetrics = [
  { model: 'Naive Baseline', mae: 210.4, rmse: 268.9, mape: 6.8, r2: 0.52, directionalAccuracy: 0.51, trainingTime: '—', modelSize: '—', status: 'baseline' },
  { model: 'Linear Regression', mae: 158.2, rmse: 201.6, mape: 5.1, r2: 0.67, directionalAccuracy: 0.55, trainingTime: '4s', modelSize: '12 KB', status: 'trained' },
  { model: 'Random Forest', mae: 121.7, rmse: 162.3, mape: 3.9, r2: 0.78, directionalAccuracy: 0.60, trainingTime: '48s', modelSize: '18 MB', status: 'trained' },
  { model: 'XGBoost', mae: 104.9, rmse: 138.5, mape: 3.3, r2: 0.83, directionalAccuracy: 0.63, trainingTime: '36s', modelSize: '6 MB', status: 'trained' },
  { model: 'ARIMA', mae: 132.6, rmse: 175.8, mape: 4.3, r2: 0.71, directionalAccuracy: 0.57, trainingTime: '11s', modelSize: '2 MB', status: 'trained' },
  { model: 'LSTM', mae: 96.3, rmse: 124.1, mape: 2.9, r2: 0.87, directionalAccuracy: 0.66, trainingTime: '6m 40s', modelSize: '42 MB', status: 'trained' },
  { model: 'Hybrid Ensemble', mae: 82.4, rmse: 106.7, mape: 2.4, r2: 0.91, directionalAccuracy: 0.68, trainingTime: '7m 55s', modelSize: '58 MB', status: 'selected' },
]

export const classificationMetrics = {
  precision: 0.71,
  recall: 0.69,
  f1Score: 0.70,
  balancedAccuracy: 0.68,
  confusionMatrix: {
    labels: ['Bullish', 'Sideways', 'Bearish'],
    matrix: [
      [142, 21, 9],
      [18, 96, 17],
      [11, 24, 128],
    ],
  },
  report: [
    { label: 'Bullish', precision: 0.83, recall: 0.83, f1: 0.83, support: 172 },
    { label: 'Sideways', precision: 0.68, recall: 0.73, f1: 0.70, support: 131 },
    { label: 'Bearish', precision: 0.83, recall: 0.79, f1: 0.81, support: 163 },
  ],
}

export const featureImportance = [
  { feature: 'RSI (14)', importance: 0.16 },
  { feature: 'MACD Histogram', importance: 0.14 },
  { feature: 'Volume Momentum', importance: 0.12 },
  { feature: 'SMA 20 / SMA 50 Spread', importance: 0.11 },
  { feature: 'Bollinger Band Position', importance: 0.10 },
  { feature: 'Rolling Volatility (20D)', importance: 0.09 },
  { feature: 'ATR (14)', importance: 0.08 },
  { feature: 'Prior 7D Return', importance: 0.08 },
  { feature: 'EMA 12 / EMA 26 Spread', importance: 0.07 },
  { feature: 'BTC Correlation', importance: 0.05 },
]

/** Deterministic training/validation loss curve for a chart demo. */
export function getTrainingHistory(epochs = 40) {
  const history = []
  for (let i = 0; i < epochs; i++) {
    const trainLoss = 0.85 * Math.exp(-i / 12) + 0.04 + Math.sin(i / 3) * 0.006
    const valLoss = 0.9 * Math.exp(-i / 13) + 0.06 + Math.cos(i / 4) * 0.008
    history.push({ epoch: i + 1, trainLoss: Number(trainLoss.toFixed(4)), valLoss: Number(valLoss.toFixed(4)) })
  }
  return history
}

export const modelExplanations = {
  mae: 'MAE (Mean Absolute Error) shows the average difference between the actual and predicted price, in dollars.',
  rmse: 'RMSE (Root Mean Squared Error) is similar to MAE but penalises larger errors more heavily.',
  mape: 'MAPE (Mean Absolute Percentage Error) expresses the average prediction error as a percentage of the actual price.',
  r2: 'R² (R-squared) measures how much of the price variation the model explains — closer to 1 is better.',
  directionalAccuracy: 'Directional Accuracy is the percentage of times the model correctly predicted whether price would go up or down.',
  confidenceInterval: 'A confidence interval shows the likely upper and lower range around a prediction, reflecting model uncertainty.',
  precision: 'Precision measures how many of the predicted "positive" trend labels were actually correct.',
  recall: 'Recall measures how many of the actual trend occurrences the model successfully identified.',
  f1: 'F1 Score is the harmonic mean of precision and recall — a single balanced accuracy measure.',
}
