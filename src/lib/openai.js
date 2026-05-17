// Server-safe AI placeholder for TXPick.
// Do NOT call OpenAI directly from the browser. Any future AI feature must run
// through a server route or Supabase Edge Function using OPENAI_API_KEY.

function aiUnavailable() {
  return { _error: 'AI is not enabled yet. TXPick will keep using local smart parsing.' }
}

export async function aiParseReminder() {
  return aiUnavailable()
}

export async function aiDailySummary() {
  return aiUnavailable()
}
