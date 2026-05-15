import { useEffect, useState } from 'react'
import { BellRing, Save, Send, Settings as SettingsIcon, ShieldCheck, UserRound } from 'lucide-react'
import { getProfile, upsertProfile } from '../lib/db.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'
import { disableBackgroundReminders, enableBackgroundReminders, getPushStatus, sendTestPush } from '../lib/notifications.js'
import { getUserDisplayName } from '../lib/userDisplay.js'

const copy = {
  vi: {
    title: 'Cài đặt',
    sub: 'Thông tin cơ bản để app hiển thị đúng tên, công việc/tiệm và ngôn ngữ.',
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
    note: 'App ưu tiên nhập tay nhanh, nhắc việc rõ ràng và tổng kết cuối tháng/cuối năm. Không scan hình để giữ app nhẹ và rẻ.',
    pushTitle: 'Nhắc việc trên điện thoại',
    pushSub: 'Khi bật, điện thoại sẽ tự báo đúng giờ nhắc việc. Không cần mở app để nhận thông báo.',
    pushUnsupported: 'Thiết bị này chưa hỗ trợ nhắc nền. Trên iPhone, hãy cài app vào màn hình chính rồi mở lại.',
    pushOff: 'Chưa bật nhắc nền trên máy này',
    pushOn: 'Nhắc nền đang bật trên máy này',
    permissionDenied: 'Bạn đã chặn thông báo. Vào cài đặt của điện thoại/trình duyệt để cho phép lại.',
    enablePush: 'Bật nhắc ngay',
    disablePush: 'Tạm tắt nhắc trên máy này',
    testPush: 'Gửi thử một nhắc việc',
    pushEnabled: 'Xong. Điện thoại này sẽ tự báo khi tới giờ nhắc việc.',
    pushDisabled: 'Đã tạm tắt nhắc nền trên máy này.',
    testSent: 'Đã gửi thử một thông báo nhắc việc.',
    pushSetupError: 'Chưa gửi được thông báo. Kiểm tra quyền thông báo rồi thử lại.',
    pushNotReady: 'Chưa bật được nhắc nền lúc này. Kiểm tra cài đặt thông báo rồi thử lại.',
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
    note: 'The app is built for quick manual entry, clear reminders, and month-end/year-end summaries. No receipt scan — to keep it light and affordable.',
    pushTitle: 'Phone reminders',
    pushSub: 'When enabled, this phone can notify you when reminders are due. You do not need to keep the app open.',
    pushUnsupported: 'This device does not support background reminders yet. On iPhone, add the app to the Home Screen and reopen it.',
    pushOff: 'Background reminders are off on this device',
    pushOn: 'Background reminders are on for this device',
    permissionDenied: 'Notifications are blocked. Open browser/phone settings to allow notifications again.',
    enablePush: 'Enable reminders',
    disablePush: 'Pause reminders on this device',
    testPush: 'Send a reminder test',
    pushEnabled: 'Done. This phone will notify you when reminders are due.',
    pushDisabled: 'Background reminders are paused on this device.',
    testSent: 'A reminder test was sent.',
    pushSetupError: 'Could not send a notification. Check notification permission and try again.',
    pushNotReady: 'Could not enable background reminders right now. Check notification settings and try again.',
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
          display_name: row?.display_name || getUserDisplayName(user, profile) || '',
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
  }, [user, profile, lang])

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
      else setPushError(result.status === 'denied' ? c.permissionDenied : (result.status === 'missing_key' ? c.pushNotReady : c.pushSetupError))
    } catch (err) {
      setPushError(c.pushSetupError)
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
      setPushError(c.pushSetupError)
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
      setPushError(c.pushSetupError)
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

      <section className="mt-5 card p-5 max-w-3xl">
        <div className="flex items-start gap-3">
          <span className="h-10 w-10 rounded-2xl bg-brand-600 text-white grid place-items-center shadow-soft shrink-0"><BellRing className="w-5 h-5" /></span>
          <div className="flex-1">
            <h2 className="font-extrabold text-ink-900">{c.pushTitle}</h2>
            <p className="text-sm text-ink-500 max-w-xl mt-0.5">{c.pushSub}</p>
            <p className={`mt-3 text-xs font-semibold ${push.subscribed ? 'text-emerald-700' : 'text-ink-500'}`}>
              {push.subscribed ? c.pushOn : c.pushOff}
            </p>
          </div>
          <ShieldCheck className="hidden sm:block w-7 h-7 text-brand-500 shrink-0" />
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
