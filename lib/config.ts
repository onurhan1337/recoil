export const config = {
  app: {
    name: "Recoil",
    description: "Personal memory app with semantic search",
  },
  polar: {
    allowedPortalHostnames: [
      "polar.sh",
      "api.polar.sh",
      "portal.polar.sh",
      "sandbox.polar.sh",
    ],
  },
  plans: {
    free: {
      name: "Free",
      monthlyCredits: 500,
      costs: {
        createNote: 2,
        chatMessage: 5,
        embedding: 1,
      },
      features: {
        maxTemplates: 1,
        emailReminders: false,
        analytics: false,
      },
    },
    pro: {
      name: "Pro",
      price: "$4.99/month",
      monthlyCredits: 10000,
      costs: {
        createNote: 1,
        chatMessage: 3,
        embedding: 0,
      },
      features: {
        maxTemplates: -1, // -1 means unlimited
        emailReminders: true,
        analytics: true,
      },
    },
  },
  credits: {
    initial: 500,
    costs: {
      createNote: 2,
      chatMessage: 5,
      embedding: 1,
    },
    displayInSidebar: true,
  },
  ai: {
    model: "gemini-2.0-flash-thinking-exp-01-21",
    embeddingModel: "local",
    temperature: 0.7,
    maxTokens: 2048,
    provider: (process.env.AI_PROVIDER || "auto") as "google" | "ollama" | "auto",
    fallbackEnabled: process.env.AI_FALLBACK_ENABLED !== "false",
    ollama: {
      baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
      model: process.env.OLLAMA_MODEL || "llama3.2",
    },
  },
  search: {
    matchThreshold: 0.1,
    matchCount: 20,
    includeRawContent: true,
  },
  embeddings: {
    chunkSize: 512,
    chunkOverlap: 50,
    model: "all-MiniLM-L6-v2",
    dimensions: 384,
  },
} as const;

export type Config = typeof config;
