// ─── AI Trends Worker ─────────────────────────────────────────────
// scheduled() — cron job, calls LLM, writes to KV
// fetch()     — serves cached KV data to frontend

import { buildPrompt } from './prompt.js'
import { getProvider }  from './providers.js'

const KV_KEY     = 'trends_v1'
const KV_TTL_SEC = 7 * 24 * 60 * 60  // 7 days

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type':                 'application/json',
}

async function fetchTrendsFromLLM(env) {
  const providerName = env.LLM_PROVIDER || 'openai'
  const apiKey       = env.LLM_API_KEY

  if (!apiKey) throw new Error('LLM_API_KEY is not set. Run: npx wrangler secret put LLM_API_KEY')

  const provider = getProvider(providerName)
  const prompt   = buildPrompt(new Date().toISOString().split('T')[0])

  console.log(`[trends] Calling ${provider.name}...`)

  const { url, headers, body } = provider.buildRequest(prompt, apiKey)
  const res = await fetch(url, { method: 'POST', headers, body })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`${provider.name} API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  console.log('[LLM raw response]', JSON.stringify(data))
  const parsed = provider.parseResponse(data)

  if (!Array.isArray(parsed.tools) || parsed.tools.length === 0) {
    throw new Error('LLM returned invalid tools shape')
  }

  parsed.generatedAt = new Date().toISOString()
  console.log(`[trends] Got ${parsed.tools.length} tools from ${provider.name}`)
  return parsed
}

async function refreshTrends(env) {
  try {
    const data = await fetchTrendsFromLLM(env)
    await env.TRENDS_KV.put(KV_KEY, JSON.stringify(data), { expirationTtl: KV_TTL_SEC })
    console.log(`[trends] KV updated at ${data.generatedAt}`)
    return data
  } catch (err) {
    console.error(`[trends] Refresh failed: ${err.message}`)
    throw err
  }
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(refreshTrends(env))
  },

  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS })
    }

    const path = new URL(request.url).pathname

    // POST /refresh — manual seed (protected by token)
    if (path === '/refresh' && request.method === 'POST') {
      const token = request.headers.get('x-refresh-token')
      if (token !== env.REFRESH_TOKEN) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: CORS })
      }
      try {
        const data = await refreshTrends(env)
        return new Response(JSON.stringify({ ok: true, count: data.tools.length, generatedAt: data.generatedAt }), { status: 200, headers: CORS })
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS })
      }
    }

    // GET /trends — serve cached data
    if (path !== '/trends') {
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: CORS })
    }

    const cached = await env.TRENDS_KV.get(KV_KEY)

    if (!cached) {
      return new Response(
        JSON.stringify({ error: 'Trends not yet generated. POST /refresh to seed data.' }),
        { status: 503, headers: CORS }
      )
    }

    return new Response(cached, {
      status: 200,
      headers: { ...CORS, 'Cache-Control': 'public, max-age=3600' },
    })
  },
}
