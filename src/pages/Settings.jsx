import { useEffect, useState } from 'react'
import { Save, Settings as SettingsIcon, UserRound } from 'lucide-react'
import { getProfile, upsertProfile } from '../lib/db.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'

const copy = {
  vi: {
    title: 'Cài đặt',
    sub: 'Thông tin căn bản để app hiển thị đúng tên, business và ngôn ngữ.',
    account: 'Tài khoản',
    displayName: 'Tên hiển thị',
    businessName: 'Tên business / tiệm',
    type: 'Loại tài khoản',
    personal: 'Cá nhân',
    business: 'Business',
    language: 'Ngôn ngữ mặc định',
    save: 'Lưu cài đặt',
    saved: 'Đã lưu cài đặt.',
    loading: 'Đang tải…',
    email: 'Email',
    note: 'App đang ưu tiên nhập tay nhanh, export cho thuế, và nhắc việc cơ bản. Không dùng OCR/upload hình để giữ chi phí thấp.',
  },
  en: {
    title: 'Settings',
    sub: 'Basic profile settings for your name, business, and default language.',
    account: 'Account',
    displayName: 'Display name',
    businessName: 'Business / salon name',
    type: 'Account type',
    personal: 'Personal',
    business: 'Business',
    language: 'Default language',
    save: 'Save settings',
    saved: 'Settings saved.',
    loading: 'Loading…',
    email: 'Email',
    note: 'The app is optimized for quick manual entry, tax export, and basic reminders. No OCR/photo upload is included to keep costs low.',
  },
}

export default function Settings() {
  const { user, profile } = useAuth()
  const { lang } = useLang()
  const c = copy[lang] || copy.en
  const [form, setForm] = useState({ display_name: '', business_name: '', type: 'personal', locale: lang })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    async function load() {
      if (!user?.id) return
      setLoading(true)
      setError('')
      try {
        const row = await getProfile(user.id)
        if (!alive) return
        setForm({
          display_name: row?.display_name || profile?.display_name || user.email?.split('@')[0] || '',
          business_name: row?.business_name || profile?.business_name || '',
          type: row?.type || profile?.type || 'personal',
          locale: row?.locale || profile?.locale || lang,
        })
      } catch (err) {
        if (alive) setError(err.message || 'Unable to load settings')
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [user?.id, user?.email, profile?.display_name, profile?.business_name, profile?.type, profile?.locale, lang])

  async function save() {
    if (!user) return
    setSaving(true)
    setMessage('')
    setError('')
    try {
      await upsertProfile(user, form)
      setMessage(c.saved)
    } catch (err) {
      setError(err.message || 'Unable to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container-app py-6 sm:py-8">
      <div>
        <h1 className="text-3xl font-extrabold text-ink-900 flex items-center gap-2"><SettingsIcon className="w-7 h-7 text-brand-600" /> {c.title}</h1>
        <p className="text-ink-500 mt-1 max-w-2xl">{c.sub}</p>
      </div>

      <section className="mt-5 card p-5 max-w-3xl">
        <h2 className="font-bold text-ink-900 flex items-center gap-2"><UserRound className="w-5 h-5 text-brand-600" /> {c.account}</h2>
        {loading ? <p className="py-8 text-sm text-ink-400">{c.loading}</p> : (
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <Field label={c.email} value={user?.email || ''} disabled />
            <Field label={c.displayName} value={form.display_name} onChange={(value) => setForm({ ...form, display_name: value })} />
            <Field label={c.businessName} value={form.business_name} onChange={(value) => setForm({ ...form, business_name: value })} />
            <label className="block">
              <span className="label">{c.type}</span>
              <select className="input" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
                <option value="personal">{c.personal}</option>
                <option value="business">{c.business}</option>
              </select>
            </label>
            <label className="block">
              <span className="label">{c.language}</span>
              <select className="input" value={form.locale} onChange={(event) => setForm({ ...form, locale: event.target.value })}>
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </label>
          </div>
        )}

        <p className="mt-4 rounded-2xl bg-brand-50 border border-brand-100 px-4 py-3 text-sm text-brand-800">{c.note}</p>
        {message && <p className="mt-4 text-sm font-semibold text-emerald-700">{message}</p>}
        {error && <p className="mt-4 text-sm font-semibold text-rose-700">{error}</p>}
        <button className="btn-primary mt-5" onClick={save} disabled={saving || loading}><Save className="w-4 h-4" /> {c.save}</button>
      </section>
    </div>
  )
}

function Field({ label, value, onChange, disabled = false }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input className="input" value={value} disabled={disabled} onChange={(event) => onChange?.(event.target.value)} />
    </label>
  )
}
