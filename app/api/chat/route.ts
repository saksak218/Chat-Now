import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
  MessageContent,
} from "@langchain/core/messages";
import { NextRequest } from "next/server";
import { AIModel } from "@/lib/utils/model";

export const runtime = "nodejs";

async function streamMistralResponse(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  file: { base64: string; mimeType: string } | null
): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.MISTRAL_AI_API_KEY;
  if (!apiKey) {
    throw new Error("MISTRAL_AI_API_KEY is not configured");
  }

  // Format messages for Mistral API (OpenAI-compatible)
  const formattedMessages = messages.map((msg) => ({
    role: msg.role === "assistant" ? "assistant" : "user",
    content: msg.content,
  }));

  // Add system message
  formattedMessages.unshift({
    role: "system",
    content: "You are a helpful AI assistant. You can analyze images and files when provided. Be concise but thorough in your responses."
  });

  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "mistral-large-latest",
      messages: formattedMessages,
      stream: true,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const errorMessage = error.error?.message || error.message || `Mistral API error: ${response.statusText}`;

    // If insufficient balance/credits, throw a specific error for fallback
    if (errorMessage.includes("insufficient") || errorMessage.includes("balance") || errorMessage.includes("credit")) {
      const balanceError = new Error("Mistral API: Insufficient balance");
      (balanceError as any).status = 402; // Payment required
      throw balanceError;
    }

    throw new Error(errorMessage);
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return new ReadableStream({
    async start(controller) {
      try {
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") {
                controller.close();
                return;
              }

              try {
                const json = JSON.parse(data);
                const content = json.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(encoder.encode(content));
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, file, model = "mistral" }: { messages: any[]; file: any; model?: AIModel } = body;

    if (!Array.isArray(messages)) {
      return new Response(
        JSON.stringify({
          error: "Messages must be an array",
          receivedKeys: Object.keys(body),
          bodyType: typeof body,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Handle different models

    if (model === "mistral") {
      try {
        const readableStream = await streamMistralResponse(messages, file);
        return new Response(readableStream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Transfer-Encoding": "chunked",
          },
        });
      } catch (error: any) {
      // If Mistral fails, try Gemini as fallback
      if (error.status === 402 || error.message?.includes("balance") || error.message?.includes("insufficient")) {
        console.log("Mistral balance insufficient, falling back to Gemini");
        // Continue to default Gemini handling
      } else {
        throw error; // Re-throw non-balance errors
      }
      }
    }

    // Try Gemini first
    try {
      const geminiModel = new ChatGoogleGenerativeAI({
        model: "gemini-2.5-flash-lite",
        apiKey: process.env.GOOGLE_API_KEY,
        apiVersion: "v1beta",
        streaming: true,
      });

      // Build conversation history
      const conversationHistory: (HumanMessage | AIMessage | SystemMessage)[] = [
        new SystemMessage(
          "You are a helpful AI assistant. You can analyze images and files when provided. Be concise but thorough in your responses."
        ),
      ];

      // Add previous messages
      for (const msg of messages.slice(0, -1)) {
        if (msg.role === "user") {
          conversationHistory.push(new HumanMessage(msg.content));
        } else {
          conversationHistory.push(new AIMessage(msg.content));
        }
      }

      const lastMessage = messages[messages.length - 1];
      if (file && file.base64) {
        // Multimodal message with image/file
        conversationHistory.push(
          new HumanMessage({
            content: [
              {
                type: "text",
                text:
                  lastMessage.content || "What can you tell me about this file?",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${file.mimeType};base64,${file.base64}`,
                },
              },
            ],
          })
        );
      } else {
        conversationHistory.push(new HumanMessage(lastMessage.content));
      }

      // Stream response
      const stream = await geminiModel.stream(conversationHistory);

      // Create readable stream for response
      const encoder = new TextEncoder();
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const text = chunk.content;
              if (typeof text === "string") {
                controller.enqueue(encoder.encode(text));
              }
            }
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return new Response(readableStream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Transfer-Encoding": "chunked",
        },
      });
    } catch (geminiError: any) {
      // If Gemini quota exceeded, try Mistral as fallback
      if (
        (geminiError.status === 429 || geminiError.message?.includes("quota"))
      ) {
        console.log("Gemini quota exceeded, falling back to Mistral");
        try {
          const readableStream = await streamMistralResponse(messages, file);
          return new Response(readableStream, {
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Transfer-Encoding": "chunked",
            },
          });
        } catch (mistralError: any) {
          // If Mistral also fails, throw the original Gemini error
          console.log("Mistral also failed, using original Gemini error");
          throw geminiError;
        }
      }
      // Re-throw if no fallback available or other error
      throw geminiError;
    }
  } catch (error: any) {
    console.error("Chat API error:", error);
    
    // Handle quota exceeded errors
    if (error.status === 429 || error.message?.includes("quota") || error.message?.includes("429")) {
      return new Response(
        JSON.stringify({
          error: "API quota exceeded",
          message: "You've exceeded the daily API request limit. Please try again later or upgrade your API plan.",
          details: "The free tier allows 20 requests per day. Please wait 24 hours or upgrade your Google Gemini API plan.",
          retryAfter: 86400, // 24 hours in seconds
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Failed to process request",
        message: error.message || "An unexpected error occurred",
        details: error.message,
        hasKey: !!process.env.GOOGLE_API_KEY,
      }),
      {
        status: error.status || 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
