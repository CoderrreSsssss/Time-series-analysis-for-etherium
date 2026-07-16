import { projectConfig } from '../../config/projectConfig'

export default function ModelStatusBadge() {
  const isLive = projectConfig.modelMeta.status === 'live'
  return (
    <span className={`badge ${isLive ? 'border-bullish/30 bg-bullish-soft text-bullish' : 'border-sideways/30 bg-sideways-soft text-sideways'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${isLive ? 'bg-bullish' : 'bg-sideways'} animate-pulseSoft`} />
      {isLive ? 'Live Model' : 'Mock Prediction Mode'}
    </span>
  )
}
