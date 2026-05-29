// ─── LLM Provider Registry ────────────────────────────────────────
// Supported values: "openai" | "claude" | "gemini"
// Default: "openai"

const openai = {
  name: 'OpenAI GPT-4o',

  buildRequest(prompt, apiKey) {
    return {
      url: 'https://api.openai.com/v1/chat/completions',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an AI trends analyst. Always respond with valid JSON only. No markdown, no explanation, no code fences. Just raw JSON.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 16000,
        temperature: 0.2,
      }),
    }
  },

  parseResponse(data) {
    const content = data.choices?.[0]?.message?.content
    if (!content) {
      const reason = data.choices?.[0]?.finish_reason
      throw new Error(`OpenAI: empty response. finish_reason: ${reason}`)
    }
    return JSON.parse(content)
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
