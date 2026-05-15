// App display brand. Keep the project/package name as TXPick, but present the
// life-management product as TX Life in the UI.

export default function Logo({ size = 36, withWord = true, className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <defs>
          <linearGradient id="txlife-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#10b981" />
            <stop offset="1" stopColor="#047857" />
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#txlife-g)" />
        <path
          d="M18 34 L28 44 L47 22"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="47" cy="45" r="5.5" fill="#f59e0b" />
      </svg>
      {withWord && (
        <span className="font-display font-extrabold text-xl tracking-tight text-ink-900">
          TX<span className="text-brand-600">Life</span>
        </span>
      )}
    </div>
  )
}
