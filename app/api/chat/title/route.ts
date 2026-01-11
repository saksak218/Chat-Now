import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

async function generateTitleWithDeepSeek(
  userMessage: string,
  assistantResponse: string
): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not configured");
  }

  const prompt = `Based on this conversation, generate a concise, descriptive title (maximum 50 characters) that captures the main topic or question being discussed.

User: ${userMessage}
${assistantResponse ? `Assistant: ${assistantResponse.substring(0, 200)}` : ""}

Generate only the title, nothing else. Make it clear and specific.`;

  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that generates concise, descriptive titles for conversations. Respond with only the title, no additional text.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 50,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const errorMessage = error.error?.message || `DeepSeek API error: ${response.statusText}`;

    // If insufficient balance, throw a specific error for fallback
    if (errorMessage.includes("Insufficient Balance") || errorMessage.includes("balance")) {
      const balanceError = new Error("DeepSeek API: Insufficient balance");
      (balanceError as any).status = 402; // Payment required
      throw balanceError;
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();
  const title = data.choices?.[0]?.message?.content?.trim() || userMessage.substring(0, 50);
  return title.replace(/^["']|["']|["']$/g, "");
}

async function generateTitleWithMistral(
  userMessage: string,
  assistantResponse: string
): Promise<string> {
  const apiKey = process.env.MISTRAL_AI_API_KEY;
  if (!apiKey) {
    throw new Error("MISTRAL_AI_API_KEY is not configured");
  }

  const prompt = `Based on this conversation, generate a concise, descriptive title (maximum 50 characters) that captures the main topic or question being discussed.

User: ${userMessage}
${assistantResponse ? `Assistant: ${assistantResponse.substring(0, 200)}` : ""}

Generate only the title, nothing else. Make it clear and specific.`;

  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "mistral-large-latest",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that generates concise, descriptive titles for conversations. Respond with only the title, no additional text.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 50,
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

  const data = await response.json();
  const title = data.choices?.[0]?.message?.content?.trim() || userMessage.substring(0, 50);
  return title.replace(/^["']|["']$/g, "");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userMessage, assistantResponse } = body;

    if (!userMessage) {
      return new Response(
        JSON.stringify({ error: "User message is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Try Gemini first
    try {
      const model = new ChatGoogleGenerativeAI({
        model: "gemini-2.5-flash-lite",
        apiKey: process.env.GOOGLE_API_KEY,
        apiVersion: "v1beta",
        streaming: false,
      });

      const prompt = `Based on this conversation, generate a concise, descriptive title (maximum 50 characters) that captures the main topic or question being discussed.

User: ${userMessage}
${assistantResponse ? `Assistant: ${assistantResponse.substring(0, 200)}` : ""}

Generate only the title, nothing else. Make it clear and specific.`;

      const messages = [
        new SystemMessage(
          "You are a helpful assistant that generates concise, descriptive titles for conversations. Respond with only the title, no additional text."
        ),
        new HumanMessage(prompt),
      ];

      const response = await model.invoke(messages);
      const title = typeof response.content === "string" 
        ? response.content.trim().replace(/^["']|["']$/g, "") 
        : userMessage.substring(0, 50);

      // Ensure title is not too long
      const finalTitle = title.length > 50 ? title.substring(0, 47) + "..." : title;

      return new Response(
        JSON.stringify({ title: finalTitle }),
        { headers: { "Content-Type": "application/json" } }
      );
    } catch (geminiError: any) {
      // If quota exceeded and DeepSeek is available, fallback to DeepSeek
      if (
        (geminiError.status === 429 || geminiError.message?.includes("quota")) &&
        process.env.DEEPSEEK_API_KEY
      ) {
        console.log("Gemini quota exceeded for title generation, falling back to DeepSeek");
        try {
          const title = await generateTitleWithDeepSeek(userMessage, assistantResponse);
          const finalTitle = title.length > 50 ? title.substring(0, 47) + "..." : title;
          return new Response(
            JSON.stringify({ title: finalTitle }),
            { headers: { "Content-Type": "application/json" } }
          );
        } catch (deepseekError: any) {
          // If DeepSeek fails due to balance, try Mistral, then fallback
          if (deepseekError.status === 402) {
            console.log("DeepSeek balance insufficient for title generation, trying Mistral");
            try {
              const title = await generateTitleWithMistral(userMessage, assistantResponse);
              const finalTitle = title.length > 50 ? title.substring(0, 47) + "..." : title;
              return new Response(
                JSON.stringify({ title: finalTitle }),
                { headers: { "Content-Type": "application/json" } }
              );
            } catch (mistralError: any) {
              if (mistralError.status === 402) {
                console.log("Mistral balance insufficient for title generation, using simple fallback");
              } else {
                console.error("Mistral title generation error:", mistralError);
              }
            }
          } else {
            console.error("DeepSeek title generation error:", deepseekError);
          }
        }
      }

      // Fallback to simple title generation
      const fallbackTitle = userMessage.length > 50 
        ? userMessage.substring(0, 47) + "..." 
        : userMessage || "New Chat";
      
      return new Response(
        JSON.stringify({ title: fallbackTitle }),
        { 
          status: 200, 
          headers: { "Content-Type": "application/json" } 
        }
      );
    }
  } catch (error: any) {
    console.error("Title generation error:", error);

    // Final fallback - use the original request body
    const body = await req.json().catch(() => ({}));
    const fallbackTitle = body.userMessage?.substring(0, 50) || "New Chat";
    return new Response(
      JSON.stringify({ title: fallbackTitle }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}

