import { useState } from "react";
import { toast } from "sonner";
import { getStoredModel } from "@/lib/utils/model";

export function useChatErrorHandler() {
  const [currentModel, setCurrentModel] = useState<string>(getStoredModel());

  const handleSendMessageWithErrorHandling = async (
    handleSendMessage: (content: string) => Promise<void>,
    content: string
  ) => {
    try {
      await handleSendMessage(content);
    } catch (error: any) {
      if (error.message?.includes("quota") || error.status === 429) {
        toast.error("API Quota Exceeded", {
          description: "You've reached the daily limit of 20 requests. Please try again in 24 hours or upgrade your API plan.",
          duration: 6000,
        });
      } else {
        toast.error("Error sending message", {
          description: error.message || "An unexpected error occurred. Please try again.",
          duration: 5000,
        });
      }
    }
  };

  const handleModelChange = (model: string) => {
    console.log("ChatContainer: Model changed to:", model);
    setCurrentModel(model); // Force re-render to update UI
    // The model is automatically saved to localStorage by ModelSelector
    // and will be used by the next API call via getStoredModel()
  };

  return {
    currentModel,
    handleSendMessageWithErrorHandling,
    handleModelChange,
  };
}
