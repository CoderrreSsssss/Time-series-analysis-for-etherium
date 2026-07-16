export default function NetworkBadge({ network, standard }) {
  return (
    <span className="badge border-border bg-white/[0.04] text-slate-300">
      <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
      {network}
      {standard && <span className="text-slate-500">· {standard}</span>}
    </span>
  )
}
