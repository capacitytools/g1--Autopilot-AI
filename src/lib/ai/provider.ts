import { getConfig } from "../config";

export type AIResponse = {
  text: string;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
};

export interface AIProvider {
  generateText(prompt: string, systemPrompt?: string): Promise<AIResponse>;
}

/**
 * OpenRouter implementation of the AI Provider.
 * OpenRouter is great because it supports both paid and free models 
 * (like meta-llama/llama-3-8b-instruct:free) using one API key.
 */
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
        "HTTP-Referer": "https://g1-autopilot-ai.vercel.app", // Required by OpenRouter
        "X-Title": "G1-Autopilot AI",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        // Using a free model by default. You can change this to "openai/gpt-4o" later.
        model: "meta-llama/llama-3-8b-instruct:free",
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

/**
 * Factory function to get the configured AI provider.
 * If no key is configured, it returns null so the UI can show a helpful setup message.
 */
export function getAIProvider(): AIProvider | null {
  const config = getConfig();
  
  if (config.providers.ai.openrouter) {
    return new OpenRouterProvider(config.providers.ai.openrouter);
  }
  
  return null;
}