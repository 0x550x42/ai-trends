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

// Expand short keys to full keys
function expandTool(t) {
  return {
    id:       t.id || t.i || '',
    name:     t.name     || t.n || '',
    company:  t.company  || t.c || '',
    domain:   t.domain   || t.d || '',
    score:    t.score    ?? t.s ?? 50,
    trend:    t.trend    ?? t.t ?? 0,
    category: t.category || t.g || 'Assistant',
    launched: t.launched || t.l || '2023',
    desc:     t.desc     || t.k || '',
    color:    t.color    || t.x || '#4dd9ff',
  }
}

async function callLLM(provider, prompt, apiKey) {
  const { url, headers, body } = provider.buildRequest(prompt, apiKey)
  const res = await fetch(url, { method: 'POST', headers, body })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`${provider.name} API error ${res.status}: ${err}`)
  }
  const data = await res.json()
  const parsed = provider.parseResponse(data)
  return Array.isArray(parsed) ? parsed : (parsed.tools || [])
}

async function fetchTrendsFromLLM(env) {
  const providerName = env.LLM_PROVIDER || 'openai'
  const apiKey       = env.LLM_API_KEY
  if (!apiKey) throw new Error('LLM_API_KEY is not set.')

  const provider = getProvider(providerName)
  const date     = new Date().toISOString().split('T')[0]

  console.log(`[trends] Calling ${provider.name}...`)

  let tools = (await callLLM(provider, buildPrompt(date), apiKey)).map(expandTool)

  // Deduplicate by name and domain
  const seenNames   = new Set()
  const seenDomains = new Set()
  const baseName = n => n?.toLowerCase().trim().replace(/\s*(v\d+[\.\d]*|\d+(\.\d+)*)$/i, '').trim()
  tools = tools.filter(t => {
    const name   = t.name?.toLowerCase().trim()
    const base   = baseName(t.name)
    const domain = t.domain?.toLowerCase().trim()
    if (!name || seenNames.has(name) || seenNames.has(base) || (domain && seenDomains.has(domain))) return false
    seenNames.add(name)
    seenNames.add(base)
    if (domain) seenDomains.add(domain)
    return true
  })

  // Sort by score and trim to 100
  tools = tools.sort((a, b) => b.score - a.score).slice(0, 100)

  if (tools.length === 0) throw new Error('LLM returned no valid tools')

  const result = { tools, generatedAt: new Date().toISOString() }
  console.log(`[trends] Got ${tools.length} unique tools from ${provider.name}`)
  return result
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
