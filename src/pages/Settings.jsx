import { useEffect, useState } from 'react'
import { BellRing, Save, Send, Settings as SettingsIcon, ShieldCheck, UserRound } from 'lucide-react'
import { getProfile } from '../lib/db.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'
import { disableBackgroundReminders, enableBackgroundReminders, getPushDiagnostics, getPushStatus, sendTestPush } from '../lib/notifications.js'
import { getUserDisplayName } from '../lib/userDisplay.js'

const copy = {
  vi: {
    title: 'Cài đặt',
    sub: 'Đổi nhanh giữa Cá nhân và Kinh doanh, chỉnh tên hiển thị, tên tiệm và ngôn ngữ.',
    account: 'Tài khoản',
    displayName: 'Tên hiển thị',
    businessName: 'Tên business / tiệm',
    type: 'Khu đang dùng',
    personal: 'Cá nhân',
    business: 'Kinh doanh / Chủ tiệm',
    language: 'Ngôn ngữ mặc định',
    save: 'Lưu cài đặt',
    saved: 'Đã lưu cài đặt.',
    loading: 'Đang tải…',
    email: 'Email',
    note: 'Cá nhân và Kinh doanh được tách riêng. Nhắc việc dùng chung cho cả hai để bạn không bỏ sót bill, payroll, deadline hoặc việc gia đình.',
    pushTitle: 'Nhắc việc trên điện thoại',
    pushSub: 'Khi bật, điện thoại sẽ tự báo đúng giờ nhắc việc. Không cần mở app để nhận thông báo.',
    pushUnsupported: 'Thiết bị này chưa hỗ trợ nhắc nền. Trên iPhone, hãy cài app vào màn hình chính rồi mở lại.',
    pushOff: 'Chưa bật nhắc nền trên máy này',
    pushOn: 'Nhắc nền đang bật trên máy này',
    permissionDenied: 'Bạn đã chặn thông báo. Vào cài đặt của điện thoại/trình duyệt để cho phép lại.',
    enablePush: 'Bật nhắc ngay',
    disablePush: 'Tạm tắt nhắc trên máy này',
    testPush: 'Gửi thử ngay',
    checkPush: 'Kiểm tra hệ thống nhắc',
    pushEnabled: 'Xong. Điện thoại này đã được đăng ký nhận nhắc việc.',
    pushDisabled: 'Đã tạm tắt nhắc nền trên máy này.',
    testSent: 'Đã gửi thử thông báo. Khóa màn hình và kiểm tra trong vài giây.',
    pushSetupError: 'Chưa gửi được. Xem phần kiểm tra bên dưới để biết đang kẹt ở bước nào.',
    pushNotReady: 'Chưa bật được nhắc nền. Kiểm tra VAPID key, quyền thông báo, và cài app vào màn hình chính nếu dùng iPhone.',
    diagnosticTitle: 'Kiểm tra nhanh',
    diagnosticHelp: 'Nếu dòng nào chưa OK, TXPick chưa thể gửi nhắc việc ra màn hình khóa.',
    browserSupport: 'Thiết bị hỗ trợ thông báo nền',
    permission: 'Quyền thông báo',
    serviceWorker: 'Service worker sẵn sàng',
    browserSubscription: 'Máy này đã đăng ký trong trình duyệt',
    serverSubscription: 'Supabase đã lưu thiết bị này',
    serverEnv: 'Vercel có đủ push keys',
    endpoint: 'Thiết bị',
  },
  en: {
    title: 'Settings',
    sub: 'Basic profile settings for your name, business, and default language.',
    account: 'Account',
    displayName: 'Display name',
    businessName: 'Business / salon name',
    type: 'Active workspace',
    personal: 'Personal',
    business: 'Kinh doanh / Chủ tiệm',
    language: 'Default language',
    save: 'Save settings',
    saved: 'Settings saved.',
    loading: 'Loading…',
    email: 'Email',
    note: 'Personal and Business are separated. Reminders are shared across both so you do not miss bills, payroll, deadlines, or family tasks.',
    pushTitle: 'Phone reminders',
    pushSub: 'When enabled, this phone can notify you when reminders are due. You do not need to keep the app open.',
    pushUnsupported: 'This device does not support background reminders yet. On iPhone, add the app to the Home Screen and reopen it.',
    pushOff: 'Background reminders are off on this device',
    pushOn: 'Background reminders are on for this device',
    permissionDenied: 'Notifications are blocked. Open browser/phone settings to allow notifications again.',
    enablePush: 'Enable reminders',
    disablePush: 'Pause reminders on this device',
    testPush: 'Send test now',
    checkPush: 'Check reminder system',
    pushEnabled: 'Done. This phone is registered for reminder alerts.',
    pushDisabled: 'Background reminders are paused on this device.',
    testSent: 'Test notification sent. Lock the screen and check in a few seconds.',
    pushSetupError: 'Could not send yet. Check the diagnostic list below to see which step is blocked.',
    pushNotReady: 'Could not enable background reminders. Check VAPID keys, notification permission, and Home Screen install on iPhone.',
    diagnosticTitle: 'Quick check',
    diagnosticHelp: 'If any line is not OK, TXPick cannot send lock-screen reminders yet.',
    browserSupport: 'Device supports background alerts',
    permission: 'Notification permission',
    serviceWorker: 'Service worker ready',
    browserSubscription: 'This phone is registered in browser',
    serverSubscription: 'Supabase saved this device',
    serverEnv: 'Vercel push keys are configured',
    endpoint: 'Device',
  },
}

export default function Settings() {
  const { user, profile, updateProfile } = useAuth()
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
  const [pushDiagnostic, setPushDiagnostic] = useState(null)

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
    getPushDiagnostics().then((diag) => { if (alive) setPushDiagnostic(diag) }).catch(() => undefined)
    return () => { alive = false }
  }, [])

  async function refreshPushStatus() {
    const status = await getPushStatus()
    setPush(status)
    try { setPushDiagnostic(await getPushDiagnostics()) } catch {}
    return status
  }

  function detailMessage(text) {
    return String(text || '').replace(/^Error:\s*/i, '').trim()
  }

  async function save() {
    if (!user) return
    setSaving(true)
    setMessage('')
    setError('')
    try {
      await updateProfile?.(form)
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
      if (result.ok) setPushMessage(`${c.pushEnabled}${result.endpointShort ? ` (${result.endpointShort})` : ''}`)
      else setPushError(result.status === 'denied' ? c.permissionDenied : (result.status === 'missing_key' ? c.pushNotReady : (result.message || c.pushSetupError)))
    } catch (err) {
      await refreshPushStatus().catch(() => undefined)
      setPushError(detailMessage(err.message) || c.pushSetupError)
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
      setPushError(detailMessage(err.message) || c.pushSetupError)
    } finally {
      setPushBusy(false)
    }
  }

  async function runDiagnostics() {
    setPushBusy(true)
    setPushMessage('')
    setPushError('')
    try {
      await refreshPushStatus()
      setPushMessage(lang === 'vi' ? 'Đã kiểm tra hệ thống nhắc việc.' : 'Reminder system check completed.')
    } catch (err) {
      setPushError(detailMessage(err.message) || c.pushSetupError)
    } finally {
      setPushBusy(false)
    }
  }

  async function testPush() {
    setPushBusy(true)
    setPushMessage('')
    setPushError('')
    try {
      let status = await refreshPushStatus()
      if (!status.subscribed) {
        const enabled = await enableBackgroundReminders()
        if (!enabled.ok) throw new Error(enabled.message || c.pushNotReady)
        status = await refreshPushStatus()
      }
      const result = await sendTestPush()
      await refreshPushStatus()
      const body = result?.payload?.body ? ` — ${result.payload.body}` : ''
      setPushMessage(`${c.testSent}${result?.sent != null ? ` (${result.sent} device${result.sent === 1 ? '' : 's'})` : ''}${body}`)
    } catch (err) {
      await refreshPushStatus().catch(() => undefined)
      setPushError(detailMessage(err.message) || c.pushSetupError)
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
          <button className="btn-secondary" onClick={testPush} disabled={pushBusy || !push.supported}><Send className="w-4 h-4" /> {c.testPush}</button>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <button className="btn-secondary" onClick={runDiagnostics} disabled={pushBusy}><ShieldCheck className="w-4 h-4" /> {c.checkPush}</button>
        </div>

        {pushDiagnostic && (
          <div className="mt-5 rounded-2xl border border-ink-100 bg-ink-50/60 p-4">
            <h3 className="text-sm font-extrabold text-ink-900">{c.diagnosticTitle}</h3>
            <p className="text-xs text-ink-500 mt-1">{c.diagnosticHelp}</p>
            <div className="mt-3 grid gap-2 text-sm">
              <CheckLine label={c.browserSupport} ok={pushDiagnostic.browserSupportsPush} />
              <CheckLine label={`${c.permission}: ${pushDiagnostic.permission}`} ok={pushDiagnostic.permission === 'granted'} />
              <CheckLine label={c.serviceWorker} ok={pushDiagnostic.serviceWorkerReady} />
              <CheckLine label={c.browserSubscription} ok={pushDiagnostic.browserSubscribed} />
              <CheckLine label={c.serverSubscription} ok={Boolean(pushDiagnostic.serverHasThisEndpoint || pushDiagnostic.serverEnabledCount > 0)} />
              <CheckLine label={c.serverEnv} ok={pushDiagnostic.serverEnvReady !== false && pushDiagnostic.publicKeyConfigured} />
            </div>
            {pushDiagnostic.endpointShort && <p className="mt-3 text-xs text-ink-500 break-all">{c.endpoint}: {pushDiagnostic.endpointShort}</p>}
            {pushDiagnostic.serverError && <p className="mt-3 text-xs font-semibold text-rose-700">{pushDiagnostic.serverError}</p>}
          </div>
        )}

        {pushMessage && <p className="mt-4 text-sm font-semibold text-emerald-700">{pushMessage}</p>}
        {pushError && <p className="mt-4 text-sm font-semibold text-rose-700">{pushError}</p>}
      </section>
    </div>
  )
}

function CheckLine({ label, ok }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white border border-ink-100 px-3 py-2">
      <span className="text-ink-700">{label}</span>
      <span className={`text-xs font-extrabold ${ok ? 'text-emerald-700' : 'text-rose-700'}`}>{ok ? 'OK' : 'CHECK'}</span>
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
