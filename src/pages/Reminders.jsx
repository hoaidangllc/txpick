import { useMemo, useState } from 'react'
import { Bell, CheckCircle2, Plus, Trash2, RotateCcw, Inbox } from 'lucide-react'
import Modal from '../components/Modal.jsx'
import {
  CATEGORIES, todayISO, parseNaturalReminder,
  categoryLabel, repeatLabel,
} from '../lib/lifeStore.js'
import { remindersDb, useRemoteCollection } from '../lib/db.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'

const copy = {
  vi: {
    title: 'Nhắc việc',
    sub: 'Việc một lần, việc lặp lại, nhắc hóa đơn và nhắc cho gia đình — gom chung một chỗ.',
    active: 'Đang cần nhớ',
    done: 'Đã xong gần đây',
    new: 'Tạo mới',
    emptyActiveTitle: 'Chưa có việc nào',
    emptyActive: 'Thêm việc đầu tiên để bắt đầu.',
    emptyDone: 'Khi bạn hoàn thành việc, nó sẽ hiện ở đây.',
    noDate: 'Chưa chọn ngày',
    modal: 'Tạo nhắc việc',
    close: 'Đóng',
    save: 'Lưu',
    natural: 'Gõ nhanh bằng câu tự nhiên',
    naturalPh: 'Ví dụ: nhắc tôi uống thuốc mỗi ngày lúc 9 giờ tối',
    read: 'Đọc câu',
    titleField: 'Nội dung cần nhớ',
    date: 'Ngày', time: 'Giờ', category: 'Phân loại', repeat: 'Lặp lại', notes: 'Ghi chú',
    none: 'Một lần', daily: 'Hằng ngày', weekly: 'Hằng tuần', monthly: 'Hằng tháng',
    loading: 'Đang tải…',
  },
  en: {
    title: 'Reminders',
    sub: 'One-time tasks, recurring tasks, bill reminders, and family nudges — all in one place.',
    active: 'Active',
    done: 'Done recently',
    new: 'New',
    emptyActiveTitle: 'Nothing here yet',
    emptyActive: 'Add your first reminder to get started.',
    emptyDone: 'Completed reminders will appear here.',
    noDate: 'No date',
    modal: 'New reminder',
    close: 'Cancel',
    save: 'Save',
    natural: 'Quick add (natural language)',
    naturalPh: 'Example: remind me to take medicine every day at 9 PM',
    read: 'Parse',
    titleField: 'Title',
    date: 'Date', time: 'Time', category: 'Category', repeat: 'Repeat', notes: 'Notes',
    none: 'One time', daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly',
    loading: 'Loading…',
  },
}

export default function Reminders() {
  const { lang } = useLang()
  const c = copy[lang]
  const { user } = useAuth()
  const [items, api, state] = useRemoteCollection(user?.id, remindersDb)
  const [open, setOpen] = useState(false)
  const active = useMemo(() => items.filter((x) => !x.done), [items])
  const done = useMemo(() => items.filter((x) => x.done).slice(0, 20), [items])

  return (
    <div className="container-app py-6 sm:py-8">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-ink-900 flex items-center gap-2">
            <Bell className="w-7 h-7 text-brand-600" /> {c.title}
          </h1>
          <p className="text-ink-500 mt-1 max-w-2xl">{c.sub}</p>
        </div>
        <button onClick={() => setOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> {c.new}
        </button>
      </div>

      {state.error && <p className="mt-4 text-sm text-rose-600">{state.error}</p>}
      <section className="mt-5 grid lg:grid-cols-2 gap-4">
        <ReminderCard title={c.active} items={active} api={api} emptyTitle={c.emptyActiveTitle} empty={state.loading ? c.loading : c.emptyActive} onAdd={() => setOpen(true)} addLabel={c.new} c={c} lang={lang} />
        <ReminderCard title={c.done} items={done} api={api} empty={c.emptyDone} done c={c} lang={lang} />
      </section>

      <ReminderModal open={open} onClose={() => setOpen(false)} onSave={(item) => { api.add(item); setOpen(false) }} c={c} lang={lang} />
    </div>
  )
}

function ReminderCard({ title, items, api, emptyTitle, empty, done, onAdd, addLabel, c, lang }) {
  return (
    <div className="card p-5">
      <h2 className="font-bold text-ink-900">{title}</h2>
      {items.length === 0 ? (
        <div className="py-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-ink-50 border border-ink-100 text-ink-400 flex items-center justify-center">
            <Inbox className="w-5 h-5" />
          </div>
          {emptyTitle && <h3 className="mt-3 font-bold text-ink-900">{emptyTitle}</h3>}
          <p className="mt-1 text-sm text-ink-500">{empty}</p>
          {onAdd && addLabel && (
            <button onClick={onAdd} className="btn-primary mt-4">
              <Plus className="w-4 h-4" /> {addLabel}
            </button>
          )}
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-ink-100">
          {items.map((r) => (
            <li key={r.id} className="py-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-ink-900 truncate">{r.title}</p>
                <p className="text-xs text-ink-500">
                  {r.date || c.noDate}{r.time ? ` • ${r.time}` : ''} • {categoryLabel(r.category, lang)}{r.repeat && r.repeat !== 'none' ? ` • ${repeatLabel(r.repeat, lang)}` : ''}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                {done ? (
                  <button onClick={() => api.update(r.id, { done: false, doneAt: null })} className="text-brand-600 hover:text-brand-800" aria-label="Reopen"><RotateCcw className="w-4 h-4" /></button>
                ) : (
                  <button onClick={() => api.update(r.id, { done: true, doneAt: new Date().toISOString() })} className="text-brand-600 hover:text-brand-800" aria-label="Done"><CheckCircle2 className="w-5 h-5" /></button>
                )}
                <button onClick={() => api.remove(r.id)} className="text-ink-300 hover:text-rose-600" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ReminderModal({ open, onClose, onSave, c, lang }) {
  const [quick, setQuick] = useState('')
  const [form, setForm] = useState({ title: '', date: todayISO(), time: '', category: 'personal', repeat: 'none', notes: '' })
  const applyQuick = () => setForm({ ...form, ...parseNaturalReminder(quick) })
  const save = () => {
    const item = { ...form, done: false }
    if (!item.title) return
    onSave(item)
    setForm({ title: '', date: todayISO(), time: '', category: 'personal', repeat: 'none', notes: '' })
    setQuick('')
  }
  return (
    <Modal open={open} onClose={onClose} title={c.modal} footer={<><button className="btn-secondary" onClick={onClose}>{c.close}</button><button className="btn-primary" onClick={save}>{c.save}</button></>}>
      <label className="label">{c.natural}</label>
      <div className="flex gap-2 mb-3">
        <input className="input" value={quick} onChange={(e) => setQuick(e.target.value)} placeholder={c.naturalPh} />
        <button className="btn-secondary !px-3" onClick={applyQuick}>{c.read}</button>
      </div>
      <Field label={c.titleField} value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
      <div className="grid grid-cols-2 gap-3">
        <Field label={c.date} type="date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} />
        <Field label={c.time} type="time" value={form.time} onChange={(v) => setForm({ ...form, time: v })} />
      </div>
      <label className="label">{c.category}</label>
      <select className="input mb-3" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
        {CATEGORIES.map((cat) => <option key={cat.key} value={cat.key}>{categoryLabel(cat.key, lang)}</option>)}
      </select>
      <label className="label">{c.repeat}</label>
      <select className="input mb-3" value={form.repeat} onChange={(e) => setForm({ ...form, repeat: e.target.value })}>
        <option value="none">{c.none}</option>
        <option value="daily">{c.daily}</option>
        <option value="weekly">{c.weekly}</option>
        <option value="monthly">{c.monthly}</option>
      </select>
      <Field label={c.notes} value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
    </Modal>
  )
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <label className="block mb-3">
      <span className="label">{label}</span>
      <input className="input" type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}
