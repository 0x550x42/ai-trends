export function buildPrompt(date) {
  const year = new Date(date).getFullYear()
  return `Today is ${date}. Search the web for current ${year} data and list as many of the most popular AI tools as you can (aim for 100, minimum 50), ranked by real-world usage, web traffic and search trends. Return ONLY a JSON array, no markdown, no prose. Keep values short:
[{"i":"chatgpt","n":"ChatGPT","c":"OpenAI","d":"chat.openai.com","s":98,"t":5,"g":"Assistant","k":"AI chatbot","x":"#10a37f","l":"2022"}]
Rules: unique tools only (no version variants, treat GPT-4/GPT-4o as one "ChatGPT"), sort by s desc, s:20-98 spread evenly, t:-30..30, g one of Assistant|Coding|Image|Video|Audio|Search|Platform|Model, d unique domain, i lowercase slug, k max 3 words, x brand hex, l year.`
}
