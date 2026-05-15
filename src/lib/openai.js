// Lightweight AI helpers for TX Life.
// The app works without these helpers. Keep AI limited to natural reminder parsing
// and short summaries; do not use this file for tax advice, receipt scanning, or chatbots.

const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY

function aiUnavailable() {
  return { _error: 'AI is not configured. The app will continue using local parsing.' }
}

export async function aiParseReminder(text, { now = new Date() } = {}) {
  if (!OPENAI_KEY) return aiUnavailable()
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0,
        messages: [
          { role: 'system', content: 'Extract a reminder from Vietnamese or English text. Return JSON only with title, date, time, repeat, category. Do not give advice.' },
          { role: 'user', content: JSON.stringify({ text, now: now.toISOString() }) },
        ],
      }),
    })
    const data = await res.json()
    const raw = data.choices?.[0]?.message?.content || '{}'
    return JSON.parse(raw.replace(/```json|```/g, '').trim())
  } catch {
    return aiUnavailable()
  }
}

export async function aiDailySummary(payload) {
  if (!OPENAI_KEY) return aiUnavailable()
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        messages: [
          { role: 'system', content: 'Write one short daily insight for a Vietnamese family in the U.S. Be practical, warm, and concise. No tax advice.' },
          { role: 'user', content: JSON.stringify(payload) },
        ],
      }),
    })
    const data = await res.json()
    return { text: data.choices?.[0]?.message?.content || '' }
  } catch {
    return aiUnavailable()
  }
}
