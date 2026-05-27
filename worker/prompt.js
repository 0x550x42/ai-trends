// ─── AI Trends Prompt ─────────────────────────────────────────────
// Instructs the LLM to return popularity scores for AI tools.
// Score = relative popularity 1-100 based on web search trends, usage,
// social mentions, and developer adoption as of the current date.

export function buildPrompt(date) {
  return `Today is ${date}. You are an AI trends analyst with access to web search.

Return a JSON object listing the top 100 most popular AI tools right now (no markdown, just raw JSON):

{"tools":[{"id":"chatgpt","name":"ChatGPT","company":"OpenAI","domain":"chat.openai.com","score":98,"trend":5,"category":"Assistant","launched":"2022","desc":"Most widely used AI chatbot globally","color":"#10a37f"}]}

Rules:
- Exactly 100 tools, sorted by score descending
- score: integer 20-98. #1 = 98, scores decrease gradually. Top 5 score 75-98, middle 50 score 35-65, bottom 50 score 20-34. NO tool should score below 20. Spread evenly — do NOT bunch scores.
- trend: integer -30 to +30, week-over-week change
- category: Assistant | Coding | Image | Video | Audio | Search | Platform | Model
- domain: primary website domain only (no https://)
- color: brand hex color
- desc: max 5 words
- launched: year as string`
}
