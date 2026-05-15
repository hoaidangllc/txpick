// SH Life AI logo mark + wordmark. The "Tx" doubles as a checkmark; the gold dot
// represents money / a coin.

export default function Logo({ size = 36, withWord = true, className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <defs>
          <linearGradient id="txpick-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#10b981" />
            <stop offset="1" stopColor="#047857" />
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="56" height="56" rx="14" fill="url(#txpick-g)" />
        <path
          d="M18 24 H46 M32 24 V46"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <circle cx="46" cy="44" r="6" fill="#f59e0b" />
      </svg>
      {withWord && (
        <span className="font-display font-extrabold text-xl tracking-tight text-ink-900">
          Tx<span className="text-brand-600">Pick</span>
        </span>
      )}
    </div>
  )
}
