export function buildPrompt(date) {
  const year = new Date(date).getFullYear()
  return `Today is ${date}. Search web for top 100 AI tools by real ${year} usage. Return ONLY a JSON array, no markdown, no explanation. Use the shortest possible values:
[{"i":"chatgpt","n":"ChatGPT","c":"OpenAI","d":"chat.openai.com","s":98,"t":5,"g":"Assistant","l":"2022","k":"AI chatbot","x":"#10a37f"}]
Rules: exactly 100 unique tools (no version variants), sort by s desc, s:20-98 spread evenly, t:-30 to 30, g:Assistant|Coding|Image|Video|Audio|Search|Platform|Model, d unique, i lowercase slug, k max 3 words, l year string.`
}
