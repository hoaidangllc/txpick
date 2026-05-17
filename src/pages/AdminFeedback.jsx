import { useCallback, useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Filter, Inbox, Mail, MessageSquareHeart, RefreshCw, ShieldCheck } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'
import { supabase } from '../lib/supabase.js'
import { isAdminEmail } from '../config/admin.js'

const copy = {
  vi: {
    badge: 'Chỉ admin thấy',
    title: 'Hộp thư góp ý TXPick',
    sub: 'Nơi xem góp ý, yêu cầu tính năng, lỗi app và ghi âm của người dùng. Trang này không dùng realtime, chỉ tải khi bạn mở hoặc bấm refresh.',
    noAccess: 'Trang này chỉ dành cho admin.',
    refresh: 'Tải lại',
    status: 'Trạng thái',
    workspace: 'Khu',
    all: 'Tất cả',
    new: 'Mới',
    reviewed: 'Đã xem',
    planned: 'Sẽ làm',
    done: 'Xong',
    archived: 'Ẩn',
    personal: 'Cá nhân',
    business: 'Business',
    empty: 'Chưa có góp ý nào.',
    from: 'Người gửi',
    voice: 'Ghi âm',
    emailHint: 'Email notification chỉ cần báo nhanh. Chi tiết nên xem ở đây để không loạn inbox.',
    loading: 'Đang tải...',
  },
  en: {
    badge: 'Admin only',
    title: 'TXPick Feedback Inbox',
    sub: 'Review user feedback, feature requests, app bugs, and voice notes. This page does not use realtime; it only loads when opened or refreshed.',
    noAccess: 'This page is for admins only.',
    refresh: 'Refresh',
    status: 'Status',
    workspace: 'Workspace',
    all: 'All',
    new: 'New',
    reviewed: 'Reviewed',
    planned: 'Planned',
    done: 'Done',
    archived: 'Archived',
    personal: 'Personal',
    business: 'Business',
    empty: 'No feedback yet.',
    from: 'From',
    voice: 'Voice note',
    emailHint: 'Email notification is only for a quick alert. This inbox keeps details organized so your email does not become messy.',
    loading: 'Loading...',
  },
}

const statusOptions = ['all', 'new', 'reviewed', 'planned', 'done', 'archived']
const workspaceOptions = ['all', 'personal', 'business']
const nextStatuses = ['new', 'reviewed', 'planned', 'done', 'archived']

function formatDate(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function statusClass(status) {
  if (status === 'done') return 'bg-emerald-50 text-emerald-700'
  if (status === 'planned') return 'bg-brand-50 text-brand-700'
  if (status === 'reviewed') return 'bg-gold-50 text-gold-700'
  if (status === 'archived') return 'bg-ink-100 text-ink-500'
  return 'bg-rose-50 text-rose-700'
}

export default function AdminFeedback() {
  const { user } = useAuth()
  const { lang } = useLang()
  const c = copy[lang] || copy.en
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('all')
  const [workspace, setWorkspace] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState('')
  const admin = isAdminEmail(user?.email)

  const counts = useMemo(() => ({
    total: items.length,
    new: items.filter((item) => item.status === 'new').length,
    business: items.filter((item) => item.workspace_type === 'business').length,
    personal: items.filter((item) => item.workspace_type === 'personal').length,
  }), [items])

  const load = useCallback(async () => {
    if (!admin) return
    setLoading(true)
    setError('')
    try {
      const { data } = await supabase.auth.getSession()
      const token = data?.session?.access_token
      if (!token) throw new Error('Missing session token')
      const params = new URLSearchParams({ status, workspace })
      const res = await fetch(`/api/feedback/admin?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body?.error || 'Unable to load feedback')
      setItems(body.items || [])
    } catch (err) {
      setError(err.message || 'Unable to load feedback')
    } finally {
      setLoading(false)
    }
  }, [admin, status, workspace])

  useEffect(() => { load() }, [load])

  async function updateStatus(id, nextStatus) {
    setSavingId(id)
    setError('')
    try {
      const { data } = await supabase.auth.getSession()
      const token = data?.session?.access_token
      if (!token) throw new Error('Missing session token')
      const res = await fetch('/api/feedback/admin', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: nextStatus }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body?.error || 'Unable to update feedback')
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item)))
    } catch (err) {
      setError(err.message || 'Unable to update feedback')
    } finally {
      setSavingId('')
    }
  }

  if (!admin) {
    return (
      <div className="container-app py-10">
        <section className="card p-6 text-center">
          <ShieldCheck className="w-10 h-10 mx-auto text-ink-400" />
          <h1 className="mt-3 text-2xl font-extrabold text-ink-900">{c.noAccess}</h1>
        </section>
      </div>
    )
  }

  return (
    <div className="container-app py-6 sm:py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="badge bg-brand-50 text-brand-700"><ShieldCheck className="w-3.5 h-3.5" /> {c.badge}</span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold text-ink-900 flex items-center gap-2">
            <Inbox className="w-8 h-8 text-brand-600" /> {c.title}
          </h1>
          <p className="text-ink-500 mt-2 max-w-3xl leading-relaxed">{c.sub}</p>
        </div>
        <button className="btn-secondary" onClick={load} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> {c.refresh}
        </button>
      </div>

      <div className="mt-6 grid sm:grid-cols-4 gap-3">
        <div className="card p-4"><p className="text-xs text-ink-500">Total</p><p className="text-2xl font-extrabold text-ink-900">{counts.total}</p></div>
        <div className="card p-4"><p className="text-xs text-ink-500">New</p><p className="text-2xl font-extrabold text-rose-700">{counts.new}</p></div>
        <div className="card p-4"><p className="text-xs text-ink-500">Business</p><p className="text-2xl font-extrabold text-brand-700">{counts.business}</p></div>
        <div className="card p-4"><p className="text-xs text-ink-500">Personal</p><p className="text-2xl font-extrabold text-ink-900">{counts.personal}</p></div>
      </div>

      <section className="card p-4 mt-5">
        <div className="flex flex-wrap gap-3 items-end">
          <label>
            <span className="label flex items-center gap-1"><Filter className="w-3.5 h-3.5" /> {c.status}</span>
            <select className="input min-w-[150px]" value={status} onChange={(event) => setStatus(event.target.value)}>
              {statusOptions.map((key) => <option value={key} key={key}>{c[key]}</option>)}
            </select>
          </label>
          <label>
            <span className="label">{c.workspace}</span>
            <select className="input min-w-[150px]" value={workspace} onChange={(event) => setWorkspace(event.target.value)}>
              {workspaceOptions.map((key) => <option value={key} key={key}>{c[key]}</option>)}
            </select>
          </label>
          <p className="text-sm text-ink-500 flex items-center gap-2"><Mail className="w-4 h-4 text-brand-600" /> {c.emailHint}</p>
        </div>
      </section>

      {error && <p className="mt-4 text-sm font-semibold text-rose-700">{error}</p>}
      {loading ? <p className="mt-6 text-ink-500">{c.loading}</p> : items.length === 0 ? (
        <section className="card p-8 text-center mt-6">
          <MessageSquareHeart className="w-10 h-10 mx-auto text-ink-300" />
          <p className="mt-3 font-semibold text-ink-600">{c.empty}</p>
        </section>
      ) : (
        <div className="mt-6 space-y-4">
          {items.map((item) => {
            const profile = item.profiles || {}
            return (
              <article key={item.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`badge ${statusClass(item.status)}`}>{c[item.status] || item.status}</span>
                      <span className="badge bg-ink-100 text-ink-600">{c[item.workspace_type] || item.workspace_type}</span>
                      <span className="badge bg-brand-50 text-brand-700">{item.category}</span>
                    </div>
                    <h2 className="mt-3 text-xl font-extrabold text-ink-900">{item.subject || (lang === 'vi' ? 'Không có tiêu đề' : 'No subject')}</h2>
                    <p className="mt-1 text-xs text-ink-400">{formatDate(item.created_at)}</p>
                  </div>
                  <label className="min-w-[160px]">
                    <span className="label">{c.status}</span>
                    <select className="input" value={item.status || 'new'} disabled={savingId === item.id} onChange={(event) => updateStatus(item.id, event.target.value)}>
                      {nextStatuses.map((key) => <option value={key} key={key}>{c[key]}</option>)}
                    </select>
                  </label>
                </div>

                <div className="mt-4 rounded-2xl bg-ink-50 border border-ink-100 p-4">
                  <p className="text-sm text-ink-700 whitespace-pre-wrap">{item.message || (item.voice_note_url ? (lang === 'vi' ? 'Người dùng gửi ghi âm.' : 'User sent a voice note.') : '')}</p>
                </div>

                <div className="mt-4 grid md:grid-cols-2 gap-3 text-sm text-ink-600">
                  <p><strong>{c.from}:</strong> {profile.display_name || item.contact_email || profile.email || 'Unknown'} {profile.email ? `(${profile.email})` : ''}</p>
                  <p><strong>Business:</strong> {profile.business_name || '-'}</p>
                </div>

                {item.voice_signed_url && (
                  <div className="mt-4">
                    <p className="label">{c.voice}</p>
                    <audio className="w-full" controls src={item.voice_signed_url} />
                  </div>
                )}

                {item.status === 'done' && <p className="mt-4 text-sm font-semibold text-emerald-700 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Done</p>}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
