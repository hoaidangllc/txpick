import { useEffect, useState } from 'react'
import { BellRing, Save, Send, Settings as SettingsIcon, ShieldCheck, UserRound, MessageSquareHeart, FileText, Shield, CheckCircle2, AlertTriangle, RefreshCw, Sparkles, Trash2, Crown } from 'lucide-react'
import { getProfile } from '../lib/db.js'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'
import { checkServerPushStatus, diagnosePushSetup, disableBackgroundReminders, enableBackgroundReminders, getPushStatus, sendTestPush, describePushProblem, refreshBackgroundReminders } from '../lib/notifications.js'
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
    pushSub: 'Bật một lần để điện thoại nhận nhắc việc từ TXPick. Sau khi bật, bấm nút thử để xem thông báo có hiện trên màn hình khóa không.',
    pushUnsupported: 'Điện thoại này chưa nhận thông báo được. Trên iPhone, hãy thêm TXPick vào màn hình chính rồi mở từ icon app.',
    pushOff: 'Chưa bật thông báo trên máy này',
    pushOn: 'Thông báo đang bật trên máy này',
    permissionDenied: 'Bạn đã chặn thông báo. Vào cài đặt của điện thoại/trình duyệt để cho phép lại.',
    enablePush: 'Bật nhắc việc trên máy này',
    disablePush: 'Tạm tắt thông báo trên máy này',
    testPush: 'Gửi thông báo thử',
    enableAndTest: 'Bật và gửi thử ngay',
    checkStatus: 'Kiểm tra trạng thái',
    refreshPush: 'Làm mới thông báo trên máy này',
    pushEnabled: 'Xong. Máy này đã sẵn sàng nhận nhắc việc từ TXPick.',
    pushDisabled: 'Đã tạm tắt thông báo trên máy này.',
    pushRefreshed: 'Đã làm mới thông báo trên máy này.',
    testSent: 'Đã gửi thông báo thử. Khóa màn hình rồi xem thông báo trên điện thoại.',
    pushSetupError: 'Chưa gửi được thông báo. Vui lòng bấm "Kiểm tra trạng thái" rồi thử lại.',
    pushNotReady: 'Chưa bật được thông báo lúc này. Hãy kiểm tra quyền thông báo trên điện thoại rồi thử lại.',
    diagnosticTitle: 'Trạng thái nhắc việc',
    noDiagnostics: 'Bấm “Kiểm tra trạng thái” để xem điện thoại đã sẵn sàng nhận nhắc việc chưa.',
    readyText: 'Máy này đã sẵn sàng nhận nhắc việc từ TXPick.',
    notReadyText: 'Máy này chưa sẵn sàng nhận nhắc việc. Hãy bật thông báo rồi thử lại.',
    lastChecked: 'Lần kiểm tra cuối',
    premiumTitle: 'Smart Assistant Pro',
    premiumSub: 'Plus và Pro sắp ra mắt. Hiện tại bạn vẫn có thể dùng TXPick miễn phí trong giai đoạn đầu.',
    premiumBadge: 'Sắp ra mắt',
    freePlan: 'Free: reminder, bills, expenses, AI nhẹ',
    plusPlan: 'Plus $1.99: không quảng cáo, thêm lượt Smart Assistant',
    proPlan: 'Pro $4.99: business mode, tax summary, assistant mạnh hơn',
    viewPlans: 'Xem gói nâng cấp',
    quickLinks: 'Liên kết nhanh',
    feedback: 'Gửi góp ý',
    privacy: 'Quyền riêng tư',
    terms: 'Điều khoản',
    dangerTitle: 'Xóa tài khoản',
    dangerSub: 'Dành cho yêu cầu Google Play. Xóa tài khoản sẽ xóa dữ liệu chính của bạn và đăng xuất khỏi TXPick.',
    deleteLabel: 'Gõ DELETE để xác nhận',
    deleteButton: 'Xóa tài khoản',
    deleting: 'Đang xóa…',
    deleteError: 'Chưa xóa được tài khoản. Vui lòng thử lại hoặc liên hệ hỗ trợ.',
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
    pushSub: 'Turn this on once so this phone can receive TXPick reminders. Then tap the sample alert button to make sure it shows on the lock screen.',
    pushUnsupported: 'This phone cannot receive app notifications yet. On iPhone, add TXPick to the Home Screen and open it from the app icon.',
    pushOff: 'Notifications are off on this device',
    pushOn: 'Notifications are on for this device',
    permissionDenied: 'Notifications are blocked. Open browser/phone settings to allow notifications again.',
    enablePush: 'Enable reminders on this device',
    disablePush: 'Pause notifications on this device',
    testPush: 'Send a sample alert',
    enableAndTest: 'Enable and send a sample',
    checkStatus: 'Check status',
    refreshPush: 'Refresh notifications on this device',
    pushEnabled: 'Done. This device is registered for TXPick reminders.',
    pushDisabled: 'Notifications are paused on this device.',
    pushRefreshed: 'Notifications refreshed on this device.',
    testSent: 'Sample alert sent. Lock your phone and look for the notification.',
    pushSetupError: 'Could not send a notification. Tap "Check status" and try again.',
    pushNotReady: 'Could not enable phone reminders right now. Check phone notification permission and try again.',
    diagnosticTitle: 'Reminder status',
    noDiagnostics: 'Tap “Check status” to see whether this phone is ready for reminders.',
    readyText: 'This device is ready to receive TXPick reminders.',
    notReadyText: 'This device is not ready yet. Enable notifications and try again.',
    lastChecked: 'Last checked',
    premiumTitle: 'Smart Assistant Pro',
    premiumSub: 'Plus and Pro are coming soon. You can keep using TXPick for free during early access.',
    premiumBadge: 'Coming soon',
    freePlan: 'Free: reminders, bills, expenses, light assistant',
    plusPlan: 'Plus $1.99: remove ads, more assistant usage',
    proPlan: 'Pro $4.99: business mode, tax summary, stronger assistant',
    viewPlans: 'View upgrade plans',
    quickLinks: 'Quick links',
    feedback: 'Send feedback',
    privacy: 'Privacy Policy',
    terms: 'Terms',
    dangerTitle: 'Delete account',
    dangerSub: 'Required for Google Play readiness. This deletes your main TXPick data and signs you out.',
    deleteLabel: 'Type DELETE to confirm',
    deleteButton: 'Delete account',
    deleting: 'Deleting…',
    deleteError: 'Could not delete the account. Try again or contact support.',
  },
}

function statusStepsFrom({ local, server, setup, test, errorCode, errorMessage }) {
  const steps = []
  if (local) {
    steps.push({ label: 'Phone supports notifications', ok: Boolean(local.supported), detail: local.supported ? 'Yes' : 'No' })
    steps.push({ label: 'Notification permission', ok: local.permission === 'granted', detail: local.permission || 'unknown' })
    steps.push({ label: 'App ready in background', ok: local.serviceWorkerReady !== false, detail: local.serviceWorkerReady === false ? 'Not ready' : 'Ready' })
    steps.push({ label: 'This phone registered', ok: Boolean(local.browserSubscribed || local.subscribed), detail: local.browserSubscribed || local.subscribed ? 'Yes' : 'Not yet' })
  }
  for (const step of setup?.steps || []) steps.push({ label: step.key, ok: step.ok, detail: step.value || step.message })
  if (server) {
    steps.push({ label: 'Reminder service ready', ok: Boolean(server.envReady), detail: server.envReady ? 'Ready' : 'Not set up' })
    steps.push({ label: 'Phones saved for reminders', ok: Number(server.enabled || 0) > 0, detail: `${server.enabled || 0} active / ${server.total || 0} total` })
    if (server.hasThisEndpoint !== undefined) steps.push({ label: 'This phone saved', ok: Boolean(server.hasThisEndpoint), detail: server.hasThisEndpoint ? 'Yes' : 'Not yet' })
  }
  if (test) steps.push({ label: 'Sample alert delivery', ok: Number(test.sent || 0) > 0, detail: `${test.sent || 0} sent / ${test.failed || 0} failed` })
  if (errorCode || errorMessage) steps.push({ label: 'Last issue', ok: false, detail: errorMessage || errorCode })
  return steps
}

export default function Settings() {
  const { user, profile, updateProfile, signOut } = useAuth()
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
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState('')

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


  async function refreshPush() {
    setPushBusy(true)
    setPushMessage('')
    setPushError('')
    try {
      const setup = await refreshBackgroundReminders()
      const local = await refreshPushStatus()
      const server = setup.serverStatus || await checkServerPushStatus().catch(() => null)
      setDiagnosticFromParts({ local, server, setup })
      if (!setup.ok) {
        setPushError(describePushProblem(setup.problem || setup.status, lang))
        return
      }
      setPushMessage(c.pushRefreshed)
    } catch (err) {
      const local = await refreshPushStatus().catch(() => null)
      setDiagnosticFromParts({ local, errorCode: err.code, errorMessage: err.message })
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


  async function deleteAccount() {
    if (deleteConfirm !== 'DELETE') return
    setDeleteBusy(true)
    setDeleteError('')
    try {
      const { data } = await supabase.auth.getSession()
      const token = data?.session?.access_token
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ confirm: 'DELETE' }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Unable to delete account')
      await signOut?.()
      window.location.assign('/')
    } catch (err) {
      setDeleteError(err.message || c.deleteError)
    } finally {
      setDeleteBusy(false)
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

      <section className="mt-5 card p-5 max-w-3xl border-brand-100 bg-brand-50/40">
        <div className="flex items-start gap-3">
          <span className="h-10 w-10 rounded-2xl bg-white text-brand-700 grid place-items-center shadow-soft shrink-0"><Sparkles className="w-5 h-5" /></span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-extrabold text-ink-900">{c.premiumTitle}</h2>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-brand-700 border border-brand-100">{c.premiumBadge}</span>
            </div>
            <p className="mt-1 text-sm text-ink-600">{c.premiumSub}</p>
            <ul className="mt-3 space-y-1 text-sm text-ink-600">
              <li>{c.freePlan}</li>
              <li>{c.plusPlan}</li>
              <li>{c.proPlan}</li>
            </ul>
            <a href="/pricing" className="btn-secondary mt-4 inline-flex"><Crown className="w-4 h-4" /> {c.viewPlans}</a>
          </div>
        </div>
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
          <button className="btn-secondary" onClick={refreshPush} disabled={pushBusy || !push.supported}><RefreshCw className="w-4 h-4" /> {c.refreshPush}</button>
          <button className="btn-secondary" onClick={checkStatus} disabled={pushBusy || !push.supported}><RefreshCw className="w-4 h-4" /> {c.checkStatus}</button>
        </div>

        {pushMessage && <p className="mt-4 text-sm font-semibold text-emerald-700">{pushMessage}</p>}
        {pushError && <p className="mt-4 text-sm font-semibold text-rose-700">{pushError}</p>}
        <PushDiagnostics c={c} diagnostics={diagnostics} lastChecked={lastChecked} />
      </section>





      <section className="mt-5 card p-5 max-w-3xl border-rose-100 bg-rose-50/40">
        <div className="flex items-start gap-3">
          <span className="h-10 w-10 rounded-2xl bg-white text-rose-700 grid place-items-center shadow-soft shrink-0"><Trash2 className="w-5 h-5" /></span>
          <div className="min-w-0 flex-1">
            <h2 className="font-extrabold text-ink-900">{c.dangerTitle}</h2>
            <p className="mt-1 text-sm text-ink-600">{c.dangerSub}</p>
            <label className="block mt-4">
              <span className="label">{c.deleteLabel}</span>
              <input className="input" value={deleteConfirm} onChange={(event) => setDeleteConfirm(event.target.value)} placeholder="DELETE" />
            </label>
            {deleteError && <p className="mt-3 text-sm font-semibold text-rose-700">{deleteError}</p>}
            <button className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-soft hover:bg-rose-700 disabled:opacity-50" onClick={deleteAccount} disabled={deleteBusy || deleteConfirm !== 'DELETE'}>
              <Trash2 className="w-4 h-4" /> {deleteBusy ? c.deleting : c.deleteButton}
            </button>
          </div>
        </div>
      </section>

      <section className="mt-5 card p-5 max-w-3xl">
        <h2 className="font-bold text-ink-900 flex items-center gap-2"><Shield className="w-5 h-5 text-brand-600" /> {c.quickLinks}</h2>
        <div className="mt-4 grid sm:grid-cols-3 gap-3">
          <a className="btn-secondary justify-start" href="/pricing"><Crown className="w-4 h-4" /> {c.viewPlans}</a>
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
