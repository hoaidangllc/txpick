// OpenAI client for the AI Agent (Phase 6 - Pro feature, $9.99/mo).
//
// SECURITY NOTE:
// In production, do NOT call OpenAI directly from the browser. Move this
// logic to a Supabase Edge Function so your API key is never exposed.
// This file is a thin wrapper that works in dev with VITE_OPENAI_API_KEY,
// and can be swapped for a fetch() to your own /api/ai endpoint later.

const KEY = import.meta.env.VITE_OPENAI_API_KEY

export const OPENAI_CONFIGURED = Boolean(KEY)

export async function aiChat(messages, { model = 'gpt-4o-mini' } = {}) {
  if (!OPENAI_CONFIGURED) {
    return {
      role: 'assistant',
      content:
        'Demo mode — vui lòng thiết lập VITE_OPENAI_API_KEY trong .env để kích hoạt AI Agent. (Demo mode — set VITE_OPENAI_API_KEY in .env to enable the AI Agent.)',
    }
  }
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${KEY}`,
    },
    body: JSON.stringify({ model, messages, temperature: 0.3 }),
  })
  const json = await res.json()
  return json.choices?.[0]?.message ?? { role: 'assistant', content: 'No response.' }
}

export async function aiReadReceipt(imageDataUrl) {
  if (!OPENAI_CONFIGURED) {
    return {
      vendor: 'Beauty Supply Plus',
      date: new Date().toISOString().slice(0, 10),
      total: 142.37,
      category: 'supply',
      items: [
        { name: 'Acrylic powder', amount: 84.0 },
        { name: 'Gel polish set', amount: 58.37 },
      ],
      _demo: true,
    }
  }
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a receipt reader for a Vietnamese-American small business. ' +
            'Return strict JSON: {vendor, date (YYYY-MM-DD), total (number), category, items:[{name,amount}]}. ' +
            'Categories: supply, utilities, rent, food, equipment, other.',
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Parse this receipt:' },
            { type: 'image_url', image_url: { url: imageDataUrl } },
          ],
        },
      ],
      response_format: { type: 'json_object' },
    }),
  })
  const json = await res.json()
  try {
    return JSON.parse(json.choices?.[0]?.message?.content ?? '{}')
  } catch {
    return { _error: 'Could not parse receipt' }
  }
}

// ---------- Reminder parsing (Smart Daily Reminder feature) ----------
// Called only when the regex parser in src/lib/reminders.js wants a smarter
// pass. Returns the same shape as parseReminder(). Falls back gracefully if
// no API key is configured.

export async function aiParseReminder(text, { now = new Date() } = {}) {
  if (!OPENAI_CONFIGURED) return null
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + KEY },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You parse Vietnamese and English reminder requests into JSON. ' +
              'Return: {title, category, dueAt (ISO 8601), repeat, forPerson}. ' +
              'category ∈ medication, bill, appointment, family, work, personal, other. ' +
              'repeat ∈ none, daily, weekly, monthly. ' +
              'forPerson ∈ me, mom, dad, spouse, child, other. ' +
              'If time-of-day missing, default 9:00 AM local. ' +
              'Current time is ' + now.toISOString() + '. ' +
              'Reply with JSON only, no commentary.',
          },
          { role: 'user', content: text },
        ],
      }),
    })
    const json = await res.json()
    const parsed = JSON.parse(json.choices?.[0]?.message?.content ?? '{}')
    if (!parsed.title || !parsed.dueAt) return null
    return parsed
  } catch {
    return null
  }
}

export async function aiDailySummary(reminders, lang = 'vi') {
  if (!OPENAI_CONFIGURED || !reminders.length) return null
  const compact = reminders.slice(0, 30).map((r) => ({
    title: r.title, dueAt: r.dueAt, category: r.category, forPerson: r.forPerson,
  }))
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + KEY },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: lang === 'vi'
              ? 'Bạn là trợ lý nhắc việc TxPick. Viết tóm tắt 1-2 câu thân thiện cho ngày hôm nay dựa trên danh sách reminder. Ngắn gọn, ấm áp, kiểu nhắn tin với người thân.'
              : 'You are the TxPick reminder assistant. Write a warm 1-2 sentence summary for today based on the reminder list. Short and friendly, like a text to a family member.',
          },
          { role: 'user', content: JSON.stringify(compact) },
        ],
      }),
    })
    const json = await res.json()
    return json.choices?.[0]?.message?.content?.trim() ?? null
  } catch {
    return null
  }
}
