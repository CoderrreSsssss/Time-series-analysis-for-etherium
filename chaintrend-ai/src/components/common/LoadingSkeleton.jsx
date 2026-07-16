export function SkeletonBlock({ className = '', style }) {
  return <div className={`animate-pulse rounded-lg bg-white/[0.06] ${className}`} style={style} />
}

export function CardSkeleton() {
  return (
    <div className="card p-5">
      <SkeletonBlock className="h-3 w-24" />
      <SkeletonBlock className="mt-3 h-7 w-32" />
      <SkeletonBlock className="mt-2 h-3 w-16" />
    </div>
  )
}

export function ChartSkeleton({ height = 320 }) {
  return (
    <div className="card p-5">
      <SkeletonBlock className="h-4 w-40" />
      <SkeletonBlock className="mt-4 w-full" style={{ height }} />
    </div>
  )
}

export function TableSkeleton({ rows = 6 }) {
  return (
    <div className="card p-5 space-y-3">
      <SkeletonBlock className="h-4 w-48" />
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonBlock key={i} className="h-9 w-full" />
      ))}
    </div>
  )
}

export default SkeletonBlock
