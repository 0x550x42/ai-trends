// ─── AI Trends Prompt ─────────────────────────────────────────────

export function buildPrompt(date) {
  const year = new Date(date).getFullYear()
  return `Today is ${date}. Search the web for current ${year} data and return a JSON array of the 100 most popular AI tools globally right now, ranked by actual real-world usage, web traffic, and search trends. Return ONLY raw JSON with no markdown, no code fences, no explanation:

[{"id":"chatgpt","name":"ChatGPT","company":"OpenAI","domain":"chat.openai.com","score":98,"trend":5,"category":"Assistant","launched":"2022","desc":"Most widely used AI chatbot","color":"#10a37f"}]

Rules:
- Exactly 100 tools, sorted by score descending
- Every tool must be UNIQUE — no duplicates by name, domain, or id
- Base rankings on real data: monthly active users, web traffic, app downloads, Google Trends, developer adoption
- score: integer 20-98 reflecting genuine relative popularity. Spread scores across the full range — do NOT cluster them
- trend: integer -30 to +30, actual week-over-week change based on current data
- category: Assistant | Coding | Image | Video | Audio | Search | Platform | Model
- domain: primary website domain only (no https://). Each domain must be unique.
- id: lowercase slug, unique across all entries
- color: brand hex color
- desc: max 5 words describing the tool
- launched: year as string`
}
