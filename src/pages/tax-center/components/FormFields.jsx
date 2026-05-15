export function Field({ label, value, onChange, type = 'text' }) {
  return (
    <label className="block mb-3">
      <span className="label">{label}</span>
      <input className="input" type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

export function TextArea({ label, value, onChange }) {
  return (
    <label className="block mb-3">
      <span className="label">{label}</span>
      <textarea className="input min-h-[80px]" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}
