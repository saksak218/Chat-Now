import { Message, PendingFile } from "@/types";
import { AIModel, getStoredModel } from "@/lib/utils/model";

export interface ChatRequest {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  file: {
    base64: string;
    mimeType: string;
  } | null;
  model?: AIModel;
}

export const sendChatMessage = async (
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  pendingFile: PendingFile | null,
  model?: AIModel
): Promise<ReadableStream<Uint8Array> | null> => {
  const selectedModel = model || getStoredModel();
  
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      file: pendingFile
        ? {
            base64: pendingFile.base64,
            mimeType: pendingFile.fileType,
          }
        : null,
      model: selectedModel,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    if (response.status === 429) {
      const error = new Error(errorData.message || "API quota exceeded. Please try again later.");
      (error as any).status = 429;
      (error as any).retryAfter = errorData.retryAfter;
      throw error;
    }
    
    throw new Error(errorData.message || errorData.error || "Failed to get AI response");
  }

  return response.body;
};

export const streamResponse = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onChunk: (content: string) => void
): Promise<string> => {
  const decoder = new TextDecoder();
  let fullContent = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    fullContent += chunk;
    onChunk(fullContent);
  }

  return fullContent;
};

