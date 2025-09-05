export async function summarizeIssuesWithAI(payload: {
  timeframe: { start: string | null; end: string | null };
  topCategories: string[];
  categories: { category: string; mentions: number; positive: number; negative: number }[];
}) {
  const provider = (process.env.AI_PROVIDER ?? '').toLowerCase();
  const system =
    'You are a product analyst. Summarize guest review themes for a property manager in 4–6 bullet points. Be concise and actionable. Mention positives and negatives.';
  const user = `Based on this data, summarize recurring issues and wins:\n${JSON.stringify(payload)}`;

  if (provider === 'openrouter') {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) return null;
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
        'X-Title': 'Flex Reviews Dashboard',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.2,
        max_tokens: 300,
      }),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.choices?.[0]?.message?.content?.trim() ?? null;
  }

  if (provider === 'groq') {
    const key = process.env.GROQ_API_KEY;
    if (!key) return null;
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.2,
        max_tokens: 300,
      }),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.choices?.[0]?.message?.content?.trim() ?? null;
  }

  return null;
}
