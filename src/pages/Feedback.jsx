import { useMemo, useRef, useState } from 'react'
import { Lightbulb, MessageSquareHeart, Mic, Paperclip, Send, Square, UploadCloud } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useLang } from '../contexts/LanguageContext.jsx'
import { feedbackDb, useRemoteCollection } from '../lib/db.js'
import { supabase, SUPABASE_CONFIGURED } from '../lib/supabase.js'

const copy = {
  vi: {
    title: 'Góp ý & yêu cầu tính năng',
    sub: 'TXPick đang cho dùng thử. Bạn cần thêm gì để app này đáng mở mỗi ngày? Gửi chữ hoặc ghi âm để mình ưu tiên build đúng thứ người dùng thật cần.',
    badge: 'Dùng thử miễn phí — đang lắng nghe người dùng',
    formTitle: 'Gửi góp ý cho TXPick',
    workspace: 'Khu bạn đang dùng',
    personal: 'Cá nhân',
    business: 'Business / Chủ tiệm',
    category: 'Bạn muốn góp ý phần nào?',
    subject: 'Tiêu đề ngắn',
    subjectPlaceholder: 'Ví dụ: cần nhắc bill mạnh hơn trên iPhone',
    message: 'Nói rõ bạn cần gì',
    messagePlaceholder: 'Bạn muốn thêm tính năng gì, đang bị khó chỗ nào, hoặc điều gì khiến bạn mở app mỗi ngày?',
    voice: 'Góp ý bằng giọng nói',
    record: 'Ghi âm',
    stop: 'Dừng ghi',
    recorded: 'Đã ghi âm. Bạn có thể gửi kèm góp ý này.',
    upload: 'Hoặc đính kèm file audio',
    send: 'Gửi góp ý',
    sending: 'Đang gửi…',
    sent: 'Đã nhận góp ý. Cảm ơn bạn — cái này giúp build app thực tế hơn nhiều.',
    needMessage: 'Viết vài dòng hoặc ghi âm trước khi gửi nha.',
    storageOff: 'Chưa lưu được file tiếng nói vì Supabase Storage chưa bật bucket feedback-voice-notes. Góp ý chữ vẫn gửi được.',
    recent: 'Góp ý gần đây',
    empty: 'Chưa có góp ý nào. Gửi cái đầu tiên để định hướng app tốt hơn.',
    whyTitle: 'Vì sao đổi nút Nâng cấp thành Góp ý?',
    whyText: 'AI/Pro chưa build xong thì chưa nên bán. Giai đoạn này nên nghe người dùng thật cần gì trước: nhắc việc, tax, business, mobile, notification hay workflow chủ tiệm.',
    categories: {
      feature_request: 'Yêu cầu tính năng', reminder: 'Nhắc việc', business: 'Business / Chủ tiệm', tax: '1099 / W-2 / Thuế',
      mobile: 'Mobile / iPhone', notification: 'Thông báo', bug: 'Báo lỗi', other: 'Khác',
    },
  },
  en: {
    title: 'Feedback & feature requests',
    sub: 'TXPick is in early use. What would make this app worth opening every day? Send text or voice feedback so we can build what real users actually need.',
    badge: 'Free trial — listening to real users',
    formTitle: 'Send feedback to TXPick',
    workspace: 'Workspace',
    personal: 'Personal',
    business: 'Business / Owner',
    category: 'What is this about?',
    subject: 'Short subject',
    subjectPlaceholder: 'Example: stronger iPhone bill reminders',
    message: 'Tell us what you need',
    messagePlaceholder: 'What feature do you want, where are you stuck, or what would make you open this app every day?',
    voice: 'Voice feedback',
    record: 'Record voice',
    stop: 'Stop recording',
    recorded: 'Voice note recorded. It will be sent with this feedback.',
    upload: 'Or attach an audio file',
    send: 'Send feedback',
    sending: 'Sending…',
    sent: 'Feedback received. Thank you — this helps build a more useful app.',
    needMessage: 'Please write a few words or record voice feedback first.',
    storageOff: 'Voice storage is not ready because the feedback-voice-notes bucket is not enabled. Text feedback can still be sent.',
    recent: 'Recent feedback',
    empty: 'No feedback yet. Send the first one to help shape the app.',
    whyTitle: 'Why Feedback instead of Upgrade?',
    whyText: 'AI/Pro is not ready yet, so selling it too early would feel wrong. This stage should collect real needs first: reminders, tax, business, mobile, notifications, or owner workflows.',
    categories: {
      feature_request: 'Feature request', reminder: 'Reminders', business: 'Business / Owner', tax: '1099 / W-2 / Taxes',
      mobile: 'Mobile / iPhone', notification: 'Notifications', bug: 'Bug report', other: 'Other',
    },
  },
}

const categoryKeys = ['feature_request', 'reminder', 'business', 'tax', 'mobile', 'notification', 'bug', 'other']

export default function Feedback() {
  const { user, profile } = useAuth()
  const { lang } = useLang()
  const c = copy[lang] || copy.en
  const [items, api, state] = useRemoteCollection(user?.id, feedbackDb)
  const [form, setForm] = useState({
    workspace_type: profile?.type || 'personal',
    category: 'feature_request',
    subject: '',
    message: '',
  })
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioName, setAudioName] = useState('')
  const [recording, setRecording] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const recorderRef = useRef(null)
  const chunksRef = useRef([])

  const audioPreview = useMemo(() => (audioBlob ? URL.createObjectURL(audioBlob) : ''), [audioBlob])

  async function startRecording() {
    setError('')
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError(lang === 'vi' ? 'Trình duyệt này chưa hỗ trợ ghi âm. Bạn có thể đính kèm file audio.' : 'This browser cannot record audio. You can attach an audio file instead.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunksRef.current = []
      const recorder = new MediaRecorder(stream)
      recorderRef.current = recorder
      recorder.ondataavailable = (event) => {
        if (event.data?.size) chunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioName(`voice-feedback-${Date.now()}.webm`)
        stream.getTracks().forEach((track) => track.stop())
      }
      recorder.start()
      setRecording(true)
    } catch (err) {
      setError(err.message || (lang === 'vi' ? 'Chưa mở được microphone.' : 'Could not access the microphone.'))
    }
  }

  function stopRecording() {
    recorderRef.current?.stop()
    setRecording(false)
  }

  function handleAudioFile(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setAudioBlob(file)
    setAudioName(file.name)
  }

  async function uploadVoiceNote() {
    if (!audioBlob || !SUPABASE_CONFIGURED || !user?.id) return null
    const safeName = audioName || `voice-feedback-${Date.now()}.webm`
    const ext = safeName.includes('.') ? safeName.split('.').pop() : 'webm'
    const path = `${user.id}/${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`
    const { error: uploadError } = await supabase.storage.from('feedback-voice-notes').upload(path, audioBlob, {
      contentType: audioBlob.type || 'audio/webm',
      upsert: false,
    })
    if (uploadError) throw uploadError
    return path
  }

  async function submit() {
    if (!user?.id) return
    if (!form.message.trim() && !audioBlob) {
      setError(c.needMessage)
      return
    }
    setSaving(true)
    setMessage('')
    setError('')
    try {
      let voicePath = null
      if (audioBlob) {
        try {
          voicePath = await uploadVoiceNote()
        } catch (err) {
          setError(`${c.storageOff} ${err.message ? `(${err.message})` : ''}`)
        }
      }
      const saved = await api.add({
        ...form,
        contact_email: user.email || '',
        voice_note_url: voicePath,
      })
      try {
        const { data } = await supabase.auth.getSession()
        const token = data?.session?.access_token
        if (token && saved?.id) {
          await fetch('/api/feedback/notify', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ feedback_id: saved.id }),
          })
        }
      } catch (notifyError) {
        console.warn('Feedback email notification skipped:', notifyError)
      }
      setForm({ workspace_type: profile?.type || 'personal', category: 'feature_request', subject: '', message: '' })
      setAudioBlob(null)
      setAudioName('')
      setMessage(c.sent)
    } catch (err) {
      setError(err.message || 'Unable to send feedback')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container-app py-6 sm:py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="badge bg-brand-50 text-brand-700"><MessageSquareHeart className="w-3.5 h-3.5" /> {c.badge}</span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold text-ink-900 flex items-center gap-2">
            {c.title}
          </h1>
          <p className="text-ink-500 mt-2 max-w-3xl leading-relaxed">{c.sub}</p>
        </div>
      </div>

      <div className="mt-6 grid lg:grid-cols-[1.2fr_0.8fr] gap-5 items-start">
        <section className="card p-5">
          <h2 className="font-extrabold text-ink-900 flex items-center gap-2"><Send className="w-5 h-5 text-brand-600" /> {c.formTitle}</h2>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="label">{c.workspace}</span>
              <select className="input" value={form.workspace_type} onChange={(event) => setForm({ ...form, workspace_type: event.target.value })}>
                <option value="personal">{c.personal}</option>
                <option value="business">{c.business}</option>
              </select>
            </label>
            <label className="block">
              <span className="label">{c.category}</span>
              <select className="input" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                {categoryKeys.map((key) => <option value={key} key={key}>{c.categories[key]}</option>)}
              </select>
            </label>
          </div>

          <label className="block mt-4">
            <span className="label">{c.subject}</span>
            <input className="input" value={form.subject} placeholder={c.subjectPlaceholder} onChange={(event) => setForm({ ...form, subject: event.target.value })} />
          </label>

          <label className="block mt-4">
            <span className="label">{c.message}</span>
            <textarea className="input min-h-[150px] resize-y" value={form.message} placeholder={c.messagePlaceholder} onChange={(event) => setForm({ ...form, message: event.target.value })} />
          </label>

          <div className="mt-4 rounded-2xl border border-ink-100 bg-ink-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold text-ink-900 flex items-center gap-2"><Mic className="w-4 h-4 text-brand-600" /> {c.voice}</p>
                <p className="text-xs text-ink-500 mt-1">{audioBlob ? c.recorded : c.upload}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {!recording ? (
                  <button type="button" className="btn-secondary !py-2 !px-3 text-sm" onClick={startRecording}><Mic className="w-4 h-4" /> {c.record}</button>
                ) : (
                  <button type="button" className="btn-secondary !py-2 !px-3 text-sm" onClick={stopRecording}><Square className="w-4 h-4" /> {c.stop}</button>
                )}
                <label className="btn-secondary !py-2 !px-3 text-sm cursor-pointer">
                  <Paperclip className="w-4 h-4" /> {lang === 'vi' ? 'File audio' : 'Audio file'}
                  <input type="file" accept="audio/*" className="hidden" onChange={handleAudioFile} />
                </label>
              </div>
            </div>
            {audioPreview && <audio className="mt-3 w-full" src={audioPreview} controls />}
          </div>

          {message && <p className="mt-4 text-sm font-semibold text-emerald-700">{message}</p>}
          {error && <p className="mt-4 text-sm font-semibold text-rose-700">{error}</p>}
          <button className="btn-primary mt-5" onClick={submit} disabled={saving}>
            <UploadCloud className="w-4 h-4" /> {saving ? c.sending : c.send}
          </button>
        </section>

        <aside className="space-y-5">
          <section className="card p-5">
            <h2 className="font-extrabold text-ink-900 flex items-center gap-2"><Lightbulb className="w-5 h-5 text-gold-600" /> {c.whyTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">{c.whyText}</p>
          </section>

          <section className="card p-5">
            <h2 className="font-extrabold text-ink-900">{c.recent}</h2>
            {state.loading ? <p className="mt-4 text-sm text-ink-400">...</p> : items.length === 0 ? (
              <p className="mt-3 text-sm text-ink-500">{c.empty}</p>
            ) : (
              <div className="mt-3 space-y-3">
                {items.slice(0, 5).map((item) => (
                  <div key={item.id} className="rounded-2xl border border-ink-100 p-3 bg-white">
                    <p className="text-xs font-bold text-brand-700">{c.categories[item.category] || item.category}</p>
                    <p className="mt-1 font-semibold text-ink-900">{item.subject || (lang === 'vi' ? 'Không có tiêu đề' : 'No subject')}</p>
                    <p className="mt-1 text-sm text-ink-500 line-clamp-3">{item.message || (item.voice_note_url ? (lang === 'vi' ? 'Có gửi ghi âm.' : 'Voice note attached.') : '')}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  )
}
