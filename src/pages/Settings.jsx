import { useEffect, useState } from 'react'
import { BellRing, Save, Send, Settings as SettingsIcon, ShieldCheck, UserRound } from 'lucide-react'
import { getProfile, upsertProfile } from '../lib/db.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'
import { disableBackgroundReminders, enableBackgroundReminders, getPushStatus, sendTestPush } from '../lib/notifications.js'

const copy = {
  vi: {
    title: 'Cài đặt',
    sub: 'Thông tin căn bản để app hiển thị đúng tên, công việc/tiệm và ngôn ngữ.',
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
    note: 'App ưu tiên nhập tay nhanh, nhắc việc rõ ràng và tổng kết cuối tháng/cuối năm. Không dùng OCR/upload hình để giữ chi phí thấp.',
    pushTitle: 'Nhắc việc trên điện thoại',
    pushSub: 'Bật Web Push để reminder vẫn báo khi bạn không mở app. Hoạt động tốt nhất sau khi cài PWA/Add to Home Screen.',
    pushUnsupported: 'Trình duyệt này chưa hỗ trợ Web Push. Hãy thử sau khi cài app vào màn hình chính hoặc dùng Chrome/Edge/Android.',
    pushOff: 'Chưa bật push reminder trên thiết bị này.',
    pushOn: 'Push reminder đã bật trên thiết bị này.',
    permissionDenied: 'Bạn đã chặn notification. Vào cài đặt trình duyệt/điện thoại để mở lại quyền thông báo.',
    enablePush: 'Bật push reminder',
    disablePush: 'Tắt trên thiết bị này',
    testPush: 'Gửi test notification',
    pushEnabled: 'Đã bật push reminder. Hãy gửi test để kiểm tra.',
    pushDisabled: 'Đã tắt push reminder trên thiết bị này.',
    testSent: 'Đã gửi test notification.',
    pushSetupError: 'Không bật được push. Kiểm tra env key, database migration và quyền notification.',
    pushTip: 'Production cần: VITE_WEB_PUSH_PUBLIC_KEY, WEB_PUSH_PRIVATE_KEY, WEB_PUSH_SUBJECT, SUPABASE_SERVICE_ROLE_KEY và cron /api/cron/send-reminders.',
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
    note: 'The app is optimized for quick manual entry, clear reminders, and monthly/year-end summaries. No OCR/photo upload is included to keep costs low.',
    pushTitle: 'Phone reminders',
    pushSub: 'Enable Web Push so reminders can notify you even when the app is not open. Best after installing the PWA/Add to Home Screen.',
    pushUnsupported: 'This browser does not support Web Push yet. Try after installing the app to your home screen or use Chrome/Edge/Android.',
    pushOff: 'Push reminders are not enabled on this device.',
    pushOn: 'Push reminders are enabled on this device.',
    permissionDenied: 'Notifications are blocked. Open browser/phone settings to allow notifications again.',
    enablePush: 'Enable push reminders',
    disablePush: 'Disable on this device',
    testPush: 'Send test notification',
    pushEnabled: 'Push reminders are enabled. Send a test to verify.',
    pushDisabled: 'Push reminders are disabled on this device.',
    testSent: 'Test notification sent.',
    pushSetupError: 'Unable to enable push. Check env keys, database migration, and notification permission.',
    pushTip: 'Production needs: VITE_WEB_PUSH_PUBLIC_KEY, WEB_PUSH_PRIVATE_KEY, WEB_PUSH_SUBJECT, SUPABASE_SERVICE_ROLE_KEY, and cron /api/cron/send-reminders.',
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
  const [push, setPush] = useState({ supported: false, permission: 'default', subscribed: false })
  const [pushBusy, setPushBusy] = useState(false)
  const [pushMessage, setPushMessage] = useState('')
  const [pushError, setPushError] = useState('')

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

  useEffect(() => {
    let alive = true
    getPushStatus().then((status) => { if (alive) setPush(status) }).catch(() => undefined)
    return () => { alive = false }
  }, [])

  async function refreshPushStatus() {
    const status = await getPushStatus()
    setPush(status)
    return status
  }

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

  async function enablePush() {
    setPushBusy(true)
    setPushMessage('')
    setPushError('')
    try {
      const result = await enableBackgroundReminders()
      await refreshPushStatus()
      if (result.ok) setPushMessage(c.pushEnabled)
      else setPushError(result.status === 'denied' ? c.permissionDenied : (result.message || c.pushSetupError))
    } catch (err) {
      setPushError(err.message || c.pushSetupError)
    } finally {
      setPushBusy(false)
    }
  }

  async function disablePush() {
    setPushBusy(true)
    setPushMessage('')
    setPushError('')
    try {
      await disableBackgroundReminders()
      await refreshPushStatus()
      setPushMessage(c.pushDisabled)
    } catch (err) {
      setPushError(err.message || c.pushSetupError)
    } finally {
      setPushBusy(false)
    }
  }

  async function testPush() {
    setPushBusy(true)
    setPushMessage('')
    setPushError('')
    try {
      await sendTestPush()
      setPushMessage(c.testSent)
    } catch (err) {
      setPushError(err.message || c.pushSetupError)
    } finally {
      setPushBusy(false)
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

      <section className="mt-5 card p-5 max-w-3xl border-brand-100 bg-gradient-to-br from-white to-brand-50/40">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-10 w-10 rounded-2xl bg-brand-600 text-white grid place-items-center shadow-soft"><BellRing className="w-5 h-5" /></span>
              <div>
                <h2 className="font-extrabold text-ink-900">{c.pushTitle}</h2>
                <p className="text-sm text-ink-500 max-w-xl">{c.pushSub}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
              <span className={`rounded-full px-3 py-1 ${push.supported ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                {push.supported ? 'Web Push supported' : 'Web Push not supported'}
              </span>
              <span className="rounded-full bg-ink-100 text-ink-700 px-3 py-1">Permission: {push.permission}</span>
              <span className={`rounded-full px-3 py-1 ${push.subscribed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {push.subscribed ? c.pushOn : c.pushOff}
              </span>
            </div>
          </div>
          <ShieldCheck className="hidden sm:block w-10 h-10 text-brand-500" />
        </div>

        {!push.supported && <p className="mt-4 rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-800">{c.pushUnsupported}</p>}
        {push.permission === 'denied' && <p className="mt-4 rounded-2xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-800">{c.permissionDenied}</p>}

        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          {!push.subscribed ? (
            <button className="btn-primary" onClick={enablePush} disabled={pushBusy || !push.supported}><BellRing className="w-4 h-4" /> {c.enablePush}</button>
          ) : (
            <button className="btn-secondary" onClick={disablePush} disabled={pushBusy}>{c.disablePush}</button>
          )}
          <button className="btn-secondary" onClick={testPush} disabled={pushBusy || !push.subscribed}><Send className="w-4 h-4" /> {c.testPush}</button>
        </div>

        {pushMessage && <p className="mt-4 text-sm font-semibold text-emerald-700">{pushMessage}</p>}
        {pushError && <p className="mt-4 text-sm font-semibold text-rose-700">{pushError}</p>}
        <p className="mt-4 text-xs text-ink-400">{c.pushTip}</p>
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
