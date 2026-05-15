export function TaxField({ label, value, onChange, type = 'text' }) {
  return <label className="block mb-3"><span className="label">{label}</span><input className="input" type={type} value={value} onChange={(e) => onChange(e.target.value)} /></label>
}

export function TaxTextArea({ label, value, onChange }) {
  return <label className="block mb-3"><span className="label">{label}</span><textarea className="input min-h-[80px]" value={value} onChange={(e) => onChange(e.target.value)} /></label>
}
