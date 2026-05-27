// ─── AI Trends Prompt ─────────────────────────────────────────────
// Instructs the LLM to return popularity scores for AI tools.
// Score = relative popularity 1-100 based on web search trends, usage,
// social mentions, and developer adoption as of the current date.

export function buildPrompt(date) {
  return `Today is ${date}. You are an AI trends analyst with access to web search.

Search the web for current popularity data on the following AI tools:
ChatGPT, Claude, Gemini, Copilot, Perplexity, Midjourney, DALL-E, Stable Diffusion, Runway, Sora,
Cursor, Windsurf, Devin, Replit, GitHub Copilot, Grok, Mistral, LLaMA, Cohere, Jasper,
Notion AI, Grammarly, Character.AI, Pi, HuggingFace, Replicate, ElevenLabs, Udio, Suno, Luma,
Pika, Synthesia, HeyGen, Descript, Adobe Firefly, Canva AI, Figma AI, Galileo AI, v0, Bolt,
Lovable, Kling, Flux, Leonardo AI, Ideogram, Playground AI, Krea, Fal, Together AI, Groq,
DeepSeek, Qwen, Phi, Gemma, Claude Code, Cursor, Warp, Codeium, Tabnine, Cody, Continue,
Aider, Zed, JetBrains AI, Amazon Q, Bedrock, Vertex AI, Azure OpenAI, Ollama, LM Studio,
AnythingLLM, OpenRouter, Poe, You.com, Phind, Kagi, Elicit, Consensus, Semantic Scholar,
Wolfram Alpha, NotebookLM, Illuminate, Gemini Advanced, ChatGPT Plus, Claude Pro,
Copilot Pro, Meta AI, Llama 3, Command R, Mixtral

Return a JSON object with this exact shape (no markdown, no explanation, just raw JSON):

{
  "tools": [
    {
      "id": "chatgpt",
      "name": "ChatGPT",
      "company": "OpenAI",
      "domain": "chat.openai.com",
      "score": 98,
      "trend": 5,
      "category": "Assistant",
      "launched": "2022",
      "desc": "Most widely used AI chatbot globally",
      "color": "#10a37f"
    }
  ]
}

Rules:
- Return ALL tools listed above (aim for 80+ entries)
- score: integer 1-100, relative popularity (ChatGPT = 98 baseline)
- trend: integer -30 to +30, week-over-week % change (positive = rising)
- category: one of: Assistant | Coding | Image | Video | Audio | Search | Platform | Model
- domain: the tool's primary website domain (no https://, no trailing slash)
- color: a hex color that matches the tool's brand
- desc: max 10 words describing what the tool does
- launched: year as string
- Sort by score descending
- Use real current data from web search, not guesses`
}
