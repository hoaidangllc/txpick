// AI fallback architecture for TXPick Smart Assistant.
// Keep browser code safe: never expose OPENAI_API_KEY in Vite/client code.
// The UI can call this helper later when server AI is enabled.

export async function parseWithAssistantFallback(input, context = {}) {
  if (!input || !String(input).trim()) return { ok: false, error: 'empty_input' }
  try {
    const res = await fetch('/api/assistant/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, context }),
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) return { ok: false, error: json.error || 'assistant_unavailable', code: json.code }
    return json
  } catch (err) {
    return { ok: false, error: err.message || 'assistant_unavailable' }
  }
}
