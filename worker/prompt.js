// ─── AI Trends Prompt ─────────────────────────────────────────────
// Instructs the LLM to return popularity scores for AI tools.
// Score = relative popularity 1-100 based on web search trends, usage,
// social mentions, and developer adoption as of the current date.

export function buildPrompt(date) {
  return `Today is ${date}. You are an AI trends analyst with access to web search.

Return a JSON object listing the top 50 most popular AI tools right now (no markdown, just raw JSON):

{"tools":[{"id":"chatgpt","name":"ChatGPT","company":"OpenAI","domain":"chat.openai.com","score":98,"trend":5,"category":"Assistant","launched":"2022","desc":"Most widely used AI chatbot globally","color":"#10a37f"}]}

Rules:
- Exactly 50 tools, sorted by score descending
- score: integer 1-100 (ChatGPT = 98 baseline)
- trend: integer -30 to +30, week-over-week change
- category: Assistant | Coding | Image | Video | Audio | Search | Platform | Model
- domain: primary website domain only (no https://)
- color: brand hex color
- desc: max 8 words
- launched: year as string`
}
