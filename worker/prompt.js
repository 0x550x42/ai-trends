export function buildPrompt(date) {
  const year = new Date(date).getFullYear()
  return `Today is ${date}. Search web for top 100 AI tools by real ${year} usage. Return ONLY a JSON array, no markdown:
[{"id":"chatgpt","name":"ChatGPT","company":"OpenAI","domain":"chat.openai.com","score":98,"trend":5,"category":"Assistant","launched":"2022","desc":"AI chatbot","color":"#10a37f"}]
Rules: exactly 100 tools (no more, no less), each tool is a distinct product (no version numbers, no "v2/v3", no model variants — treat GPT-4/GPT-4o as one entry "ChatGPT"), score 20-98 spread evenly, trend -30 to +30, category: Assistant|Coding|Image|Video|Audio|Search|Platform|Model, domain unique per tool, id lowercase slug unique, desc max 4 words, launched year string.`
}
