import { useEffect, useState } from 'react'
import { BellRing, Save, Send, Settings as SettingsIcon, ShieldCheck, UserRound, MessageSquareHeart, FileText, Shield, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react'
import { getProfile } from '../lib/db.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'
import { checkServerPushStatus, diagnosePushSetup, disableBackgroundReminders, enableBackgroundReminders, getPushStatus, sendTestPush, describePushProblem } from '../lib/notifications.js'
import { getUserDisplayName } from '../lib/userDisplay.js'

const copy = {
  vi: {
    title: 'Cài đặt',
    sub: 'Đổi tên hiển thị, tên tiệm/business, ngôn ngữ và cách điện thoại nhắc bạn.',
    account: 'Thông tin cá nhân & business',
    displayName: 'Tên hiển thị',
    businessName: 'Tên tiệm / business',
    type: 'Mở app ở chế độ',
    personal: 'Cá nhân',
    business: 'Business',
    language: 'Ngôn ngữ mặc định',
    save: 'Lưu cài đặt',
    saved: 'Đã lưu cài đặt.',
    loading: 'Đang tải…',
    email: 'Email',
    note: 'Cá nhân và Business được tách riêng để dễ theo dõi. Nhắc việc vẫn gom chung để bạn không bỏ sót hóa đơn, lương thợ, deadline hoặc việc gia đình.',
    pushTitle: 'Nhắc việc trên điện thoại',
    pushSub: 'Bật một lần để điện thoại có thể nhận nhắc việc từ TXPick. Sau khi bật, dùng nút test để kiểm tra thật trên lock screen.',
    pushUnsupported: 'Thiết bị này chưa hỗ trợ nhắc nền. Trên iPhone, hãy cài TXPick vào màn hình chính rồi mở từ icon app.',
    pushOff: 'Chưa bật thông báo trên máy này',
    pushOn: 'Thông báo đang bật trên máy này',
    permissionDenied: 'Bạn đã chặn thông báo. Vào cài đặt của điện thoại/trình duyệt để cho phép lại.',
    enablePush: 'Bật nhắc việc trên máy này',
    disablePush: 'Tạm tắt thông báo trên máy này',
    testPush: 'Gửi thông báo thử',
    enableAndTest: 'Bật & gửi test ngay',
    checkStatus: 'Kiểm tra trạng thái',
    pushEnabled: 'Xong. Máy này đã đăng ký nhận nhắc việc từ TXPick.',
    pushDisabled: 'Đã tạm tắt nhắc nền trên máy này.',
    testSent: 'Đã gửi thông báo thử. Khóa màn hình và kiểm tra thông báo trên điện thoại.',
    pushSetupError: 'Chưa gửi được notification. Vui lòng bấm “Kiểm tra trạng thái” rồi thử lại.',
    pushNotReady: 'Chưa bật được nhắc nền lúc này. Hãy kiểm tra quyền thông báo trên điện thoại rồi thử lại.',
    diagnosticTitle: 'Trạng thái nhắc việc',
    noDiagnostics: 'Bấm “Kiểm tra trạng thái” để xem điện thoại đã sẵn sàng nhận nhắc việc chưa.',
    readyText: 'Máy này đã sẵn sàng nhận nhắc việc từ TXPick.',
    notReadyText: 'Máy này chưa sẵn sàng nhận nhắc việc. Hãy bật thông báo rồi thử lại.',
    lastChecked: 'Lần kiểm tra cuối',
    quickLinks: 'Liên kết nhanh',
    feedback: 'Gửi góp ý',
    privacy: 'Quyền riêng tư',
    terms: 'Điều khoản',
  },
  en: {
    title: 'Settings',
    sub: 'Update your name, business name, language, and phone reminder settings.',
    account: 'Profile & business',
    displayName: 'Display name',
    businessName: 'Business / salon name',
    type: 'Open app in',
    personal: 'Personal',
    business: 'Business',
    language: 'Default language',
    save: 'Save settings',
    saved: 'Settings saved.',
    loading: 'Loading…',
    email: 'Email',
    note: 'Personal and Business stay separated for cleaner records. Reminders stay together so bills, payroll, deadlines, and family tasks do not get missed.',
    pushTitle: 'Phone reminders',
    pushSub: 'Turn this on once so this phone can receive TXPick reminders. Then use the test button to check the real lock screen notification.',
    pushUnsupported: 'This phone cannot receive app notifications yet. On iPhone, add TXPick to the Home Screen and open it from the app icon.',
    pushOff: 'Notifications are off on this device',
    pushOn: 'Notifications are on for this device',
    permissionDenied: 'Notifications are blocked. Open browser/phone settings to allow notifications again.',
    enablePush: 'Enable reminders on this device',
    disablePush: 'Pause notifications on this device',
    testPush: 'Send test alert',
    enableAndTest: 'Enable & send test now',
    checkStatus: 'Check status',
    pushEnabled: 'Done. This device is registered for TXPick reminders.',
    pushDisabled: 'Notifications are paused on this device.',
    testSent: 'Test alert sent. Lock your phone and check the notification.',
    pushSetupError: 'Could not send a notification. Tap “Check status” and try again.',
    pushNotReady: 'Could not enable phone reminders right now. Check phone notification permission and try again.',
    diagnosticTitle: 'Reminder status',
    noDiagnostics: 'Tap “Check status” to see whether this phone is ready for reminders.',
    readyText: 'This device is ready to receive TXPick reminders.',
    notReadyText: 'This device is not ready yet. Enable notifications and try again.',
    lastChecked: 'Last checked',
    quickLinks: 'Quick links',
    feedback: 'Send feedback',
    privacy: 'Privacy Policy',
    terms: 'Terms',
  },
}

function statusStepsFrom({ local, server, setup, test, errorCode, errorMessage }) {
  const steps = []
  if (local) {
    steps.push({ label: 'Browser support', ok: Boolean(local.supported), detail: local.supported ? 'Supported' : 'Not supported' })
    steps.push({ label: 'Permission', ok: local.permission === 'granted', detail: local.permission || 'unknown' })
    steps.push({ label: 'Service worker', ok: local.serviceWorkerReady !== false, detail: local.serviceWorkerReady === false ? 'Not ready' : 'Ready' })
    steps.push({ label: 'Browser subscription', ok: Boolean(local.browserSubscribed || local.subscribed), detail: local.endpointStart || 'No device endpoint yet' })
  }
  for (const step of setup?.steps || []) steps.push({ label: step.key, ok: step.ok, detail: step.endpointStart || step.value || step.message })
  if (server) {
    steps.push({ label: 'Vercel push keys', ok: Boolean(server.envReady), detail: server.envReady ? 'Configured' : 'Missing key' })
    steps.push({ label: 'Supabase subscription', ok: Number(server.enabled || 0) > 0, detail: `${server.enabled || 0} active / ${server.total || 0} total` })
    if (server.hasThisEndpoint !== undefined) steps.push({ label: 'This device saved', ok: Boolean(server.hasThisEndpoint), detail: server.hasThisEndpoint ? 'Current phone matched in Supabase' : 'Current phone endpoint not found in Supabase' })
  }
  if (test) steps.push({ label: 'Test push send', ok: Number(test.sent || 0) > 0, detail: `${test.sent || 0} sent / ${test.failed || 0} failed` })
  if (errorCode || errorMessage) steps.push({ label: 'Last error', ok: false, detail: errorMessage || errorCode })
  return steps
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
  const [diagnostics, setDiagnostics] = useState(null)
  const [lastChecked, setLastChecked] = useState('')

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
      await updateProfile?.(form)
      setMessage(c.saved)
    } catch (err) {
      setError(err.message || 'Unable to save settings')
    } finally {
      setSaving(false)
    }
  }

  function setDiagnosticFromParts(parts) {
    const steps = statusStepsFrom(parts)
    setDiagnostics({ ...parts, steps })
    setLastChecked(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
  }

  async function disablePush() {
    setPushBusy(true)
    setPushMessage('')
    setPushError('')
    try {
      await disableBackgroundReminders()
      const local = await refreshPushStatus()
      setDiagnostics({ steps: statusStepsFrom({ local }) })
      setPushMessage(c.pushDisabled)
    } catch (err) {
      setPushError(c.pushSetupError)
    } finally {
      setPushBusy(false)
    }
  }

  async function checkStatus() {
    setPushBusy(true)
    setPushMessage('')
    setPushError('')
    try {
      const diag = await diagnosePushSetup()
      setPush(diag.local)
      setDiagnosticFromParts({ local: diag.local, server: diag.server, errorMessage: diag.serverError })
      setPushMessage(diag.ok ? c.pushOn : c.pushOff)
    } catch (err) {
      const local = await refreshPushStatus().catch(() => null)
      setDiagnosticFromParts({ local, errorMessage: err.message })
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
      let local = await refreshPushStatus()
      let setup = null
      let server = null
      if (!local.subscribed || local.permission !== 'granted') {
        setup = await enableBackgroundReminders()
        local = await refreshPushStatus()
        server = setup.serverStatus || null
        if (!setup.ok) {
          setDiagnosticFromParts({ local, server, setup })
          setPushError(describePushProblem(setup.problem || setup.status, lang))
          return
        }
      } else {
        server = await checkServerPushStatus().catch(() => null)
      }
      const test = await sendTestPush()
      setDiagnosticFromParts({ local, server, setup, test })
      setPushMessage(test?.message || c.testSent)
    } catch (err) {
      const local = await refreshPushStatus().catch(() => null)
      let server = null
      try { server = await checkServerPushStatus() } catch {}
      setDiagnosticFromParts({ local, server, errorCode: err.code, errorMessage: err.message })
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

        <div className="mt-5 grid sm:grid-cols-2 gap-3">
          {!push.subscribed ? (
            <button className="btn-primary" onClick={testPush} disabled={pushBusy || !push.supported}><BellRing className="w-4 h-4" /> {c.enableAndTest}</button>
          ) : (
            <button className="btn-secondary" onClick={disablePush} disabled={pushBusy}>{c.disablePush}</button>
          )}
          <button className="btn-secondary" onClick={testPush} disabled={pushBusy || !push.supported}><Send className="w-4 h-4" /> {c.testPush}</button>
          <button className="btn-secondary sm:col-span-2" onClick={checkStatus} disabled={pushBusy || !push.supported}><RefreshCw className="w-4 h-4" /> {c.checkStatus}</button>
        </div>

        {pushMessage && <p className="mt-4 text-sm font-semibold text-emerald-700">{pushMessage}</p>}
        {pushError && <p className="mt-4 text-sm font-semibold text-rose-700">{pushError}</p>}
        <PushDiagnostics c={c} diagnostics={diagnostics} lastChecked={lastChecked} />
      </section>

      <section className="mt-5 card p-5 max-w-3xl">
        <h2 className="font-bold text-ink-900 flex items-center gap-2"><Shield className="w-5 h-5 text-brand-600" /> {c.quickLinks}</h2>
        <div className="mt-4 grid sm:grid-cols-3 gap-3">
          <a className="btn-secondary justify-start" href="/feedback"><MessageSquareHeart className="w-4 h-4" /> {c.feedback}</a>
          <a className="btn-secondary justify-start" href="/privacy"><Shield className="w-4 h-4" /> {c.privacy}</a>
          <a className="btn-secondary justify-start" href="/terms"><FileText className="w-4 h-4" /> {c.terms}</a>
        </div>
      </section>
    </div>
  )
}

function PushDiagnostics({ c, diagnostics, lastChecked }) {
  const steps = diagnostics?.steps || []
  const hasSteps = steps.length > 0
  const failed = steps.some((step) => !step.ok)
  const ready = hasSteps && !failed

  return (
    <div className="mt-5 rounded-3xl border border-ink-100 bg-ink-50/60 p-4">
      <h3 className="font-bold text-ink-900">{c.diagnosticTitle}</h3>
      {!hasSteps ? (
        <p className="mt-2 text-sm text-ink-500">{c.noDiagnostics}</p>
      ) : (
        <div className={`mt-3 rounded-2xl border px-4 py-3 ${ready ? 'border-emerald-100 bg-emerald-50' : 'border-amber-100 bg-amber-50'}`}>
          <div className="flex items-start gap-2">
            {ready ? <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-700 shrink-0" /> : <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-700 shrink-0" />}
            <div>
              <p className={`text-sm font-bold ${ready ? 'text-emerald-800' : 'text-amber-800'}`}>{ready ? c.readyText : c.notReadyText}</p>
              {lastChecked && <p className="mt-1 text-xs text-ink-500">{c.lastChecked}: {lastChecked}</p>}
            </div>
          </div>
        </div>
      )}
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
