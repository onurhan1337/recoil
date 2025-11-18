import { generateText } from "ai";
import { config } from "./config";
import { getAIModel } from "./ai/provider";
import { AI_PROMPTS } from "./ai/prompts";

function extractKeywordLabel(content: string): string {
  const lines = content.split("\n").filter(line => line.trim().length > 0);

  let textContent = "";
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("#")) {
      continue;
    }
    if (trimmed.length > 0) {
      textContent = trimmed;
      break;
    }
  }

  if (!textContent) {
    textContent = lines[0]?.replace(/^#+\s*/, "").trim() || "";
  }

  const sentences = textContent.split(/[.!?]/);
  const firstSentence = sentences[0]?.trim() || "";

  if (firstSentence.length > 0 && firstSentence.length <= 60) {
    return firstSentence;
  }

  return textContent.slice(0, 60) + (textContent.length > 60 ? "..." : "");
}

export async function generateNoteMetadata(content: string): Promise<{
  label: string;
  category: string;
}> {
  const label = extractKeywordLabel(content);

  try {
    const { model } = getAIModel({
      model: config.ai.model,
      provider: config.ai.provider,
      fallbackEnabled: config.ai.fallbackEnabled,
      ollamaModel: config.ai.ollama.model,
    });

    const result = await generateText({
      model,
      temperature: 0.1,
      prompt: AI_PROMPTS.noteMetadata.categorize(content),
    });

    const category = result.text.trim().toLowerCase();
    return {
      label,
      category: category.charAt(0).toUpperCase() + category.slice(1),
    };
  } catch (error) {
    console.error("Error generating note category:", error);
    return {
      label,
      category: "Other",
    };
  }
}
