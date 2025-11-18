import { google } from "@ai-sdk/google";
import type { LanguageModel } from "ai";
import { getOllamaModel } from "./ollama";
import type { AIProvider, ProviderError } from "./models";

export interface ProviderOptions {
  provider?: AIProvider;
  model?: string;
  fallbackEnabled?: boolean;
  ollamaModel?: string;
}

class AIProviderError extends Error implements ProviderError {
  provider: AIProvider;
  retryable: boolean;

  constructor(message: string, provider: AIProvider, retryable = true) {
    super(message);
    this.name = "AIProviderError";
    this.provider = provider;
    this.retryable = retryable;
  }
}

function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

function getConfiguredProvider(): AIProvider {
  const envProvider = process.env.AI_PROVIDER as AIProvider | undefined;

  if (envProvider && ["google", "ollama", "auto"].includes(envProvider)) {
    return envProvider;
  }

  return "auto";
}

function getProviderForEnvironment(): AIProvider {
  const configured = getConfiguredProvider();

  if (configured !== "auto") {
    return configured;
  }

  return isDevelopment() ? "ollama" : "google";
}

function getFallbackProvider(primary: AIProvider): AIProvider | null {
  const fallbackEnabled = process.env.AI_FALLBACK_ENABLED !== "false";

  if (!fallbackEnabled) {
    return null;
  }

  return primary === "google" ? "ollama" : "google";
}

function createGoogleModel(modelName: string): LanguageModel {
  return google(modelName);
}

function createOllamaModelSafe(modelName?: string): LanguageModel {
  try {
    return getOllamaModel(modelName);
  } catch (error) {
    throw new AIProviderError(
      `Failed to create Ollama model: ${error instanceof Error ? error.message : "Unknown error"}`,
      "ollama"
    );
  }
}

function getModelForProvider(
  provider: AIProvider,
  modelName: string,
  ollamaModel?: string
): LanguageModel {
  switch (provider) {
    case "google":
      return createGoogleModel(modelName);
    case "ollama":
      return createOllamaModelSafe(ollamaModel);
    default:
      throw new AIProviderError(`Unknown provider: ${provider}`, provider, false);
  }
}

export function getAIModel(options: ProviderOptions = {}): {
  model: LanguageModel;
  provider: AIProvider;
} {
  const primaryProvider = options.provider || getProviderForEnvironment();
  const modelName = options.model || process.env.AI_MODEL || "gemini-2.0-flash-thinking-exp-01-21";
  const fallbackEnabled = options.fallbackEnabled ?? (process.env.AI_FALLBACK_ENABLED !== "false");

  console.log(`[AI Provider] Attempting to use provider: ${primaryProvider}, model: ${primaryProvider === "ollama" ? (options.ollamaModel || process.env.OLLAMA_MODEL) : modelName}`);

  try {
    const model = getModelForProvider(primaryProvider, modelName, options.ollamaModel);
    console.log(`[AI Provider] Successfully initialized ${primaryProvider} provider`);
    return { model, provider: primaryProvider };
  } catch (primaryError) {
    if (!fallbackEnabled) {
      throw primaryError;
    }

    const fallbackProvider = getFallbackProvider(primaryProvider);

    if (!fallbackProvider) {
      throw primaryError;
    }

    console.warn(
      `Primary provider ${primaryProvider} failed, attempting fallback to ${fallbackProvider}:`,
      primaryError instanceof Error ? primaryError.message : "Unknown error"
    );

    try {
      const model = getModelForProvider(fallbackProvider, modelName, options.ollamaModel);
      return { model, provider: fallbackProvider };
    } catch (fallbackError) {
      console.error(
        `Fallback provider ${fallbackProvider} also failed:`,
        fallbackError instanceof Error ? fallbackError.message : "Unknown error"
      );
      throw primaryError;
    }
  }
}

export async function withProviderFallback<T>(
  operation: (model: LanguageModel, provider: AIProvider) => Promise<T>,
  options: ProviderOptions = {}
): Promise<T> {
  const { model, provider } = getAIModel(options);

  try {
    return await operation(model, provider);
  } catch (error) {
    const fallbackEnabled = options.fallbackEnabled ?? (process.env.AI_FALLBACK_ENABLED !== "false");

    if (!fallbackEnabled) {
      throw error;
    }

    const fallbackProvider = getFallbackProvider(provider);

    if (!fallbackProvider) {
      throw error;
    }

    console.warn(
      `Operation failed with ${provider}, attempting fallback to ${fallbackProvider}:`,
      error instanceof Error ? error.message : "Unknown error"
    );

    try {
      const { model: fallbackModel } = getAIModel({
        ...options,
        provider: fallbackProvider,
      });

      return await operation(fallbackModel, fallbackProvider);
    } catch (fallbackError) {
      console.error(
        `Fallback operation with ${fallbackProvider} also failed:`,
        fallbackError instanceof Error ? fallbackError.message : "Unknown error"
      );
      throw error;
    }
  }
}
