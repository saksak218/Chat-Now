export type AIModel = "gemini" | "mistral";

export const MODELS = {
  gemini: {
    name: "Google Gemini",
    model: "gemini-2.5-flash-lite",
    provider: "google",
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
  const validModels: AIModel[] = ["gemini", "mistral"];
  // Handle legacy values by converting them to valid models
  if (stored === "deepseek" || stored === "ollama") return "mistral";
  return (stored && validModels.includes(stored as AIModel)) ? (stored as AIModel) : "mistral";
};

export const setStoredModel = (model: AIModel): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("ai-model", model);
};

