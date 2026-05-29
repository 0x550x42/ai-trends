// ─── AI Trends Prompt ─────────────────────────────────────────────
// Instructs the LLM to return popularity scores for AI tools.
// Score = relative popularity 1-100 based on web search trends, usage,
// social mentions, and developer adoption as of the current date.

export function buildPrompt(date) {
  return `Today is ${date}. You are an AI trends analyst with access to web search.

Search the web for current data and return a JSON object listing the 100 most popular AI tools globally right now, ranked by actual real-world usage, web traffic, and search trends (no markdown, just raw JSON):

{"tools":[{"id":"chatgpt","name":"ChatGPT","company":"OpenAI","domain":"chat.openai.com","score":98,"trend":5,"category":"Assistant","launched":"2022","desc":"Most widely used AI chatbot","color":"#10a37f"}]}

Rules:
- Exactly 100 tools, sorted by score descending
- Base rankings on real data: monthly active users, web traffic, app downloads, Google Trends, developer adoption
- score: integer 20-98 reflecting genuine relative popularity. Spread scores across the full range — do NOT cluster them.
- trend: integer -30 to +30, actual week-over-week change based on current data
- category: Assistant | Coding | Image | Video | Audio | Search | Platform | Model
- domain: primary website domain only (no https://)
- color: brand hex color
- desc: max 5 words describing the tool
- launched: year as string`
}
