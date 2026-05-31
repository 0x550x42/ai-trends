export function buildPrompt(date) {
  const year = new Date(date).getFullYear()
  return `Today is ${date}. Search web for top 100 AI tools by real ${year} usage. Return ONLY a JSON array, no markdown:
[{"id":"chatgpt","name":"ChatGPT","company":"OpenAI","domain":"chat.openai.com","score":98,"trend":5,"category":"Assistant","launched":"2022","desc":"AI chatbot","color":"#10a37f"}]
Rules: 100 unique tools, score 20-98 spread evenly, trend -30 to +30, category: Assistant|Coding|Image|Video|Audio|Search|Platform|Model, domain unique, id lowercase slug, desc max 4 words, launched year string.`
}
