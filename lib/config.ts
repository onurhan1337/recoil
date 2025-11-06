export const config = {
  app: {
    name: "Recoil",
    description: "Personal memory app with semantic search",
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
    },
    pro: {
      name: "Pro",
      monthlyCredits: 10000,
      costs: {
        createNote: 1,
        chatMessage: 3,
        embedding: 0,
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
