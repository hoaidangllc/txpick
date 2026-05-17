export function cleanText(value, max = 1200) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max)
}

export function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export async function sendFeedbackEmail(feedback, profile = {}) {
  const apiKey = process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY || ''
  const to = process.env.FEEDBACK_NOTIFY_EMAIL || process.env.ADMIN_EMAIL || 'ddh2755@gmail.com'
  const from = process.env.FEEDBACK_FROM_EMAIL || 'TXPick <noreply@txpick.com>'
  const appUrl = process.env.VITE_APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://txpick.com'

  if (!apiKey) {
    return { skipped: true, reason: 'Missing RESEND_API_KEY. Feedback was saved, but email notification was not sent.' }
  }

  const subject = cleanText(feedback.subject || feedback.category || 'New feedback', 120)
  const workspace = cleanText(feedback.workspace_type || 'personal', 80)
  const category = cleanText(feedback.category || 'feedback', 80)
  const contact = cleanText(feedback.contact_email || profile.email || '', 180)
  const message = cleanText(feedback.message || '', 1800)
  const adminUrl = `${appUrl.replace(/\/$/, '')}/admin/feedback`

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
      <h2 style="margin:0 0 12px">New TXPick feedback</h2>
      <p><strong>Workspace:</strong> ${escapeHtml(workspace)}</p>
      <p><strong>Category:</strong> ${escapeHtml(category)}</p>
      <p><strong>From:</strong> ${escapeHtml(contact || 'Unknown user')}</p>
      <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
      <div style="margin-top:16px;padding:14px;border:1px solid #e5e7eb;border-radius:12px;background:#f9fafb">
        ${escapeHtml(message || 'Voice/audio feedback only.')}
      </div>
      ${feedback.voice_note_url ? `<p><strong>Voice note:</strong> attached in app admin page.</p>` : ''}
      <p style="margin-top:18px"><a href="${escapeHtml(adminUrl)}">Open Admin Feedback</a></p>
    </div>
  `

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      subject: `[TXPick Feedback] ${subject}`,
      html,
    }),
  })

  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body?.message || body?.error || 'Unable to send feedback email')
  return { sent: true, provider: 'resend', id: body?.id || null }
}
