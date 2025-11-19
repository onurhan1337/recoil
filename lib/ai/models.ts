import type { LanguageModel } from "ai";

export type AIProvider = "google" | "ollama" | "auto";

export interface AIModelConfig {
  provider: AIProvider;
  model: string;
  fallbackEnabled: boolean;
  fallbackProvider?: AIProvider;
  ollamaBaseUrl: string;
  ollamaModel: string;
}

export interface ModelProvider {
  getModel(): LanguageModel;
  getProvider(): AIProvider;
}

export interface ProviderError extends Error {
  provider: AIProvider;
  retryable: boolean;
}
