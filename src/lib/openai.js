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
