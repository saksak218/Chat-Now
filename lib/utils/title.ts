/**
 * Generates a concise title from a message
 * Extracts key phrases and creates a title (max 50 chars)
 */
export function generateTitleFromMessage(message: string): string {
  // Remove common question words and clean up
  const cleaned = message
    .trim()
    .replace(/^(what|how|why|when|where|can|could|would|should|is|are|do|does|did)\s+/i, "")
    .replace(/\?+$/, "")
    .trim();

  // If message is short enough, use it directly (with some cleanup)
  if (cleaned.length <= 50) {
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  // Extract first sentence or first 50 characters
  const firstSentence = cleaned.split(/[.!?]/)[0];
  if (firstSentence.length <= 50) {
    return firstSentence.charAt(0).toUpperCase() + firstSentence.slice(1);
  }

  // Take first 47 chars and add ellipsis
  return cleaned.substring(0, 47).trim() + "...";
}

/**
 * Generates a title using AI based on the conversation
 */
export async function generateAITitle(
  userMessage: string,
  assistantResponse: string
): Promise<string> {
  try {
    const response = await fetch("/api/chat/title", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userMessage,
        assistantResponse,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate title");
    }

    const data = await response.json();
    return data.title || generateTitleFromMessage(userMessage);
  } catch (error) {
    console.error("Error generating AI title:", error);
    // Fallback to simple title generation
    return generateTitleFromMessage(userMessage);
  }
}

