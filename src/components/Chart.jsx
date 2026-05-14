// Tiny zero-dependency SVG charts. Two flavors:
//   <BarChart data={[{label, value}]} />     — vertical bars for trends
//   <DonutChart slices={[{label,value,color}]} /> — donut for share/breakdown
//
// Tailwind classes are used for color via currentColor; brand-600 is the default.

export function BarChart({ data = [], height = 140, color = '#10b981', emptyLabel = 'No data yet' }) {
  if (!data.length) {
    return <p className="text-sm text-ink-400 py-10 text-center">{emptyLabel}</p>
  }
  const max = Math.max(...data.map((d) => d.value), 1)
  const W = 600
  const H = height
  const pad = 24
  const barW = (W - pad * 2) / data.length
  return (
    <svg viewBox={`0 0 ${W} ${H + 28}`} className="w-full" preserveAspectRatio="none">
      {data.map((d, i) => {
        const h = (d.value / max) * (H - pad)
        const x = pad + i * barW + barW * 0.15
        const w = barW * 0.7
        const y = H - h
        return (
          <g key={i}>
            <rect x={x} y={y} width={w} height={Math.max(h, 2)} rx="4" fill={color} opacity={d.muted ? 0.35 : 0.95} />
            <text x={x + w / 2} y={H + 18} textAnchor="middle" fontSize="11" fill="#64748b">
              {d.label}
            </text>
            {d.value > 0 && (
              <text x={x + w / 2} y={y - 6} textAnchor="middle" fontSize="10" fill="#0f172a" fontWeight="600">
                ${Math.round(d.value)}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export function DonutChart({ slices = [], size = 160, thickness = 24, centerLabel, centerSub }) {
  const total = slices.reduce((s, x) => s + Math.max(x.value, 0), 0) || 1
  const R = size / 2
  const inner = R - thickness
  const cx = R
  const cy = R
  let acc = 0
  const arcs = slices.map((s, i) => {
    const start = (acc / total) * Math.PI * 2 - Math.PI / 2
    acc += Math.max(s.value, 0)
    const end = (acc / total) * Math.PI * 2 - Math.PI / 2
    const large = end - start > Math.PI ? 1 : 0
    const x1 = cx + R * Math.cos(start)
    const y1 = cy + R * Math.sin(start)
    const x2 = cx + R * Math.cos(end)
    const y2 = cy + R * Math.sin(end)
    const x3 = cx + inner * Math.cos(end)
    const y3 = cy + inner * Math.sin(end)
    const x4 = cx + inner * Math.cos(start)
    const y4 = cy + inner * Math.sin(start)
    const d = [
      `M ${x1} ${y1}`,
      `A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${inner} ${inner} 0 ${large} 0 ${x4} ${y4}`,
      'Z',
    ].join(' ')
    return <path key={i} d={d} fill={s.color} />
  })
  return (
    <div className="flex items-center gap-5">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        {total === 1 && slices.every((s) => !s.value) ? (
          <circle cx={cx} cy={cy} r={R} fill="#f1f5f9" />
        ) : (
          arcs
        )}
        {(centerLabel || centerSub) && (
          <>
            <text x={cx} y={cy - 2} textAnchor="middle" fontSize="16" fontWeight="700" fill="#0f172a">
              {centerLabel}
            </text>
            <text x={cx} y={cy + 16} textAnchor="middle" fontSize="11" fill="#64748b">
              {centerSub}
            </text>
          </>
        )}
      </svg>
      <ul className="text-xs space-y-1.5 flex-1 min-w-0">
        {slices.map((s, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: s.color }} />
            <span className="text-ink-700 flex-1 truncate">{s.label}</span>
            <span className="text-ink-500">${Math.round(s.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
