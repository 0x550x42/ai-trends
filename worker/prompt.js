export function buildPrompt(date) {
  const year = new Date(date).getFullYear()
  return `Today is ${date}. Search web for the top 100 AI tools by real ${year} usage. Return ONLY a JSON array of exactly 100 objects, no markdown, no prose. Keep every value short:
[{"i":"chatgpt","n":"ChatGPT","c":"OpenAI","d":"chat.openai.com","s":98,"t":5,"g":"Assistant","k":"AI chatbot","x":"#10a37f","l":"2022"}]
Rules: exactly 100 unique tools (no version variants), sort by s desc, s:20-98 spread evenly, t:-30..30, g one of Assistant|Coding|Image|Video|Audio|Search|Platform|Model, d unique domain, i lowercase slug, k max 3 words, x brand hex, l year.`
}
