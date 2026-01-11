export type AIModel = "gemini" | "deepseek" | "mistral";

export const MODELS = {
  gemini: {
    name: "Google Gemini",
    model: "gemini-2.5-flash-lite",
    provider: "google",
  },
  deepseek: {
    name: "DeepSeek",
    model: "deepseek-chat",
    provider: "deepseek",
  },
  mistral: {
    name: "Mistral AI",
    model: "mistral-large-latest",
    provider: "mistral",
  },
} as const;

export const getStoredModel = (): AIModel => {
  if (typeof window === "undefined") return "mistral";
  const stored = localStorage.getItem("ai-model");
  return (stored as AIModel) || "mistral";
};

export const setStoredModel = (model: AIModel): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("ai-model", model);
};

