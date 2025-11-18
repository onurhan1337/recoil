import { createOllama } from "ollama-ai-provider-v2";
import type { LanguageModel } from "ai";

export interface OllamaConfig {
  baseURL?: string;
  model?: string;
}

export function createOllamaProvider(config: OllamaConfig = {}) {
  const baseURL =
    config.baseURL || process.env.OLLAMA_BASE_URL || "http://localhost:11434";

  return createOllama({
    baseURL: `${baseURL}/api`,
  });
}

export function getOllamaModel(model?: string): LanguageModel {
  const modelName = model || process.env.OLLAMA_MODEL || "llama3.2:latest";
  const provider = createOllamaProvider();

  return provider(modelName);
}
