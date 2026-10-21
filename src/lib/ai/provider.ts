import { getConfig } from "../config";

export type AIResponse = {
  text: string;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
};

export interface AIProvider {
  generateText(prompt: string, systemPrompt?: string): Promise<AIResponse>;
}

export class OpenRouterProvider implements AIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateText(prompt: string, systemPrompt?: string): Promise<AIResponse> {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "HTTP-Referer": "https://g1-autopilot-ai.vercel.app",
        "X-Title": "G1-Autopilot AI",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        // Use the Free Models Router: automatically selects an available free model
        model: "openrouter/free",
        messages: [
          ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AI Provider Error: ${response.status} ${error}`);
    }

    const data = await response.json();
    return {
      text: data.choices[0]?.message?.content || "",
      usage: data.usage,
    };
  }
}

export function getAIProvider(): AIProvider | null {
  const config = getConfig();
  
  if (config.providers.ai.openrouter) {
    return new OpenRouterProvider(config.providers.ai.openrouter);
  }
  
  return null;
}