// ─── LLM Provider Registry ────────────────────────────────────────
// Supported values: "openai" | "claude" | "gemini"
// Default: "openai"

// Tolerant parser — salvages all complete objects even if the JSON
// array is truncated mid-stream (e.g. token limit hit).
function parseToolArray(text) {
  const clean = text.replace(/```json|```/g, '').trim()
  // Fast path: valid JSON
  try {
    const parsed = JSON.parse(clean)
    return Array.isArray(parsed) ? parsed : (parsed.tools || [])
  } catch (_) {}
  // Salvage path: extract every complete {...} object
  const objects = []
  let depth = 0, start = -1
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i]
    if (ch === '{') { if (depth === 0) start = i; depth++ }
    else if (ch === '}') {
      depth--
      if (depth === 0 && start !== -1) {
        try { objects.push(JSON.parse(clean.slice(start, i + 1))) } catch (_) {}
        start = -1
      }
    }
  }
  if (objects.length === 0) throw new Error('Could not parse any tool objects from response')
  return objects
}

const openai = {
  name: 'OpenAI GPT-4o + Web Search',

  buildRequest(prompt, apiKey) {
    return {
      url: 'https://api.openai.com/v1/responses',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        tools: [{ type: 'web_search_preview' }],
        input: prompt,
        max_output_tokens: 16000,
      }),
    }
  },

  parseResponse(data) {
    // Find the last message block with output_text
    const messages = data.output?.filter(b => b.type === 'message') || []
    const last = messages[messages.length - 1]
    const text = last?.content?.find(c => c.type === 'output_text')?.text
    if (!text) throw new Error('OpenAI: no text output in response')
    return { tools: parseToolArray(text) }
  },
}

const claude = {
  name: 'Anthropic Claude',

  buildRequest(prompt, apiKey) {
    return {
      url: 'https://api.anthropic.com/v1/messages',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 16000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: prompt }],
      }),
    }
  },

  parseResponse(data) {
    const textBlocks = data.content?.filter(b => b.type === 'text')
    const last = textBlocks?.[textBlocks.length - 1]?.text
    if (!last) throw new Error('Claude: no text block in response')
    const clean = last.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  },
}

const gemini = {
  name: 'Google Gemini',

  buildRequest(prompt, apiKey) {
    return {
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ googleSearch: {} }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    }
  },

  parseResponse(data) {
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) throw new Error('Gemini: empty response')
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  },
}

const PROVIDERS = { openai, claude, gemini }

export function getProvider(name = 'openai') {
  const provider = PROVIDERS[name.toLowerCase()]
  if (!provider) throw new Error(`Unknown LLM provider: "${name}". Use: openai, claude, gemini`)
  return provider
}
