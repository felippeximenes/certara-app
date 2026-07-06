const G: Record<string, { from: string; to: string; edge: string }> = {
  saa: { from: '#60A5FA', to: '#2563EB', edge: '#1E3A8A' },
  clf: { from: '#FBBF24', to: '#D97706', edge: '#7C2D12' },
  dva: { from: '#34D399', to: '#15803D', edge: '#14532D' },
}

const HEX = 'M50 2 95 28 95 80 50 106 5 80 5 28Z'

export function HeroHex({
  cls, variant, label, id,
}: {
  cls: 'h1' | 'h2' | 'h3'
  variant: keyof typeof G
  label?: string
  id: string
}) {
  const g = G[variant]
  return (
    <div className={`hfhex ${cls}`}>
      <svg className="edge" viewBox="0 0 100 108">
        <path d={HEX} fill={g.edge} />
      </svg>
      <svg viewBox="0 0 100 108">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={g.from} />
            <stop offset="1" stopColor={g.to} />
          </linearGradient>
        </defs>
        <path d={HEX} fill={`url(#${id})`} />
        <path d={HEX} fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="2" />
      </svg>
      {label && <span className="lbl">{label}</span>}
    </div>
  )
}
