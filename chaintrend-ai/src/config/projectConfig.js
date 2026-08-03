/**
 * ============================================================================
 * PROJECT CONFIGURATION
 * ============================================================================
 * This is the single source of truth for branding, academic details,
 * supported assets/networks, navigation, and API configuration.
 *
 * Edit the values below to personalise the project — you should not need
 * to touch any component code to update your name, university, or coins.
 * ============================================================================
 */

export const projectConfig = {
  brand: {
    name: 'ChainTrend AI',
    shortName: 'ChainTrend',
    tagline: 'Multi-Chain Crypto Intelligence and Forecasting',
    logoText: 'CT',
  },

  // Update these with your real academic details.
  academic: {
    studentName: 'Dhruv Khurana',
    university: 'Akal University',
    course: 'BCA-AI-ML',
    mentor: 'Ms Nancy Mittal',
    session: '2025 – 2026',
    projectType: 'Internship Project',
  },

  disclaimer:
    'This platform is an educational university project. Predictions, signals, and analytics are generated for academic demonstration and must not be considered financial or investment advice.',

  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
    useMockData: (import.meta.env.VITE_USE_MOCK_DATA ?? 'true') === 'true',
  },

  modelMeta: {
    activeModel: 'Hybrid Ensemble (LSTM + XGBoost)',
    version: 'v0.9.1-mock',
    lastTrained: '2026-06-30',
    trainingPeriod: '2019-01-01 → 2026-05-31',
    testingPeriod: '2026-06-01 → 2026-06-30',
    status: 'Live', 
  },

  coins: [
    {
      id: 'ETH',
      symbol: 'ETH',
      name: 'Ethereum',
      network: 'Ethereum',
      tokenStandard: 'ERC-20',
      color: '#818cf8',
      basePrice: 3200,
      volatility: 0.032,
      icon: 'Diamond',
    },
    {
      id: 'BNB',
      symbol: 'BNB',
      name: 'BNB',
      network: 'BNB Smart Chain',
      tokenStandard: 'BEP-20',
      color: '#f0b90b',
      basePrice: 590,
      volatility: 0.028,
      icon: 'Hexagon',
    },
    {
      id: 'TRX',
      symbol: 'TRX',
      name: 'TRON',
      network: 'TRON',
      tokenStandard: 'TRC-20',
      color: '#ef4444',
      basePrice: 0.128,
      volatility: 0.026,
      icon: 'Triangle',
    },
    {
      id: 'BTC',
      symbol: 'BTC',
      name: 'Bitcoin',
      network: 'Bitcoin',
      tokenStandard: 'Native (benchmark)',
      color: '#f59e0b',
      basePrice: 61500,
      volatility: 0.024,
      icon: 'Bitcoin',
    },
  ],

  networks: [
    {
      id: 'ethereum',
      name: 'Ethereum',
      nativeCoin: 'ETH',
      tokenStandard: 'ERC-20',
      color: '#818cf8',
    },
    {
      id: 'bsc',
      name: 'BNB Smart Chain',
      nativeCoin: 'BNB',
      tokenStandard: 'BEP-20',
      color: '#f0b90b',
    },
    {
      id: 'tron',
      name: 'TRON',
      nativeCoin: 'TRX',
      tokenStandard: 'TRC-20',
      color: '#ef4444',
    },
  ],

  models: [
    { id: 'naive', name: 'Naive Baseline', category: 'baseline' },
    { id: 'linreg', name: 'Linear Regression', category: 'regression' },
    { id: 'rf', name: 'Random Forest', category: 'regression' },
    { id: 'xgboost', name: 'XGBoost', category: 'regression' },
    { id: 'arima', name: 'ARIMA', category: 'timeseries' },
    { id: 'lstm', name: 'LSTM', category: 'deep-learning' },
    { id: 'hybrid', name: 'Hybrid Ensemble', category: 'ensemble' },
  ],

  navigation: [
    { label: 'Overview', path: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'Time-Series Analysis', path: '/time-series', icon: 'LineChart' },
    { label: 'Price Forecasting', path: '/forecast', icon: 'TrendingUp' },
    { label: 'Actual vs Predicted', path: '/actual-vs-predicted', icon: 'GitCompareArrows' },
    { label: 'Trend Classification', path: '/trend-analysis', icon: 'Waypoints' },
    { label: 'Technical Analysis', path: '/technical-analysis', icon: 'CandlestickChart' },
    { label: 'Model Performance', path: '/model-performance', icon: 'BrainCircuit' },
    { label: 'Multi-Chain Comparison', path: '/chain-comparison', icon: 'Network' },
    { label: 'USDT Cross-Chain', path: '/cross-chain-usdt', icon: 'ArrowLeftRight' },
    { label: 'Risk Analysis', path: '/risk-analysis', icon: 'ShieldAlert' },
    { label: 'Data Explorer', path: '/data-explorer', icon: 'Table2' },
    { label: 'Methodology', path: '/methodology', icon: 'FlaskConical' },
    { label: 'About Project', path: '/about', icon: 'Info' },
  ],

  topNavigation: [
    { label: 'Home', path: '/' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Analysis', path: '/time-series' },
    { label: 'Model Performance', path: '/model-performance' },
    { label: 'Chain Comparison', path: '/chain-comparison' },
    { label: 'About', path: '/about' },
  ],

  timeRanges: [
    { id: '7D', label: '7D', days: 7 },
    { id: '1M', label: '1M', days: 30 },
    { id: '3M', label: '3M', days: 90 },
    { id: '6M', label: '6M', days: 180 },
    { id: '1Y', label: '1Y', days: 365 },
    { id: 'ALL', label: 'All', days: 1460 },
  ],
}

export default projectConfig
