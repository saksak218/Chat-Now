import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Message, PendingFile } from "@/types";
import { sendChatMessage, streamResponse } from "@/lib/services/chat";
import { generateAITitle } from "@/lib/utils/title";
import { AIModel, getStoredModel } from "@/lib/utils/model";

export function useChat(session: { user: { id: string } } | null) {
  const chats = useQuery(api.chats.getChats, session ? {} : "skip");
  const [activeChatId, setActiveChatId] = useState<Id<"chats"> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [pendingFile, setPendingFile] = useState<PendingFile | null>(null);

  const messages = useQuery(
    api.messages.getMessages,
    activeChatId ? { chatId: activeChatId } : "skip"
  ) as Message[] | undefined;

  const sendMessage = useMutation(api.messages.sendMessage);
  const createChat = useMutation(api.chats.createChat);
  const updateChatTitle = useMutation(api.chats.updateChatTitle);
  const deleteChat = useMutation(api.chats.deleteChat);

  // Set first chat as active if none selected
  useEffect(() => {
    if (chats && chats.length > 0 && !activeChatId) {
      setActiveChatId(chats[0]._id);
    }
  }, [chats, activeChatId]);

  const filteredChats = chats?.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = async (content: string) => {
    if (!content.trim() && !pendingFile) return;

    let currentChatId = activeChatId;
    let isNewChat = false;
    let shouldUpdateTitle = false;

    // Create a new chat if none exists
    if (!currentChatId) {
      const newChatId = await createChat({
        title: "New Chat",
      });
      currentChatId = newChatId;
      setActiveChatId(newChatId);
      isNewChat = true;
      shouldUpdateTitle = true;
    } else {
      // Check if this is the first user message in an existing chat
      const currentMessages = messages || [];
      const userMessages = currentMessages.filter((msg) => msg.role === "user");
      // If chat title is still "New Chat" and this is the first user message, update title
      const currentChat = chats?.find((c) => c._id === currentChatId);
      if (currentChat?.title === "New Chat" && userMessages.length === 0) {
        shouldUpdateTitle = true;
      }
    }

    setIsLoading(true);
    setStreamingContent("");

    try {
      await sendMessage({
        chatId: currentChatId,
        role: "user",
        content: content,
        fileId: pendingFile?.storageId,
        fileName: pendingFile?.fileName,
        fileType: pendingFile?.fileType,
      });

      const conversationHistory =
        messages?.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })) || [];

      conversationHistory.push({ role: "user", content });

      const selectedModel = getStoredModel();
      const responseBody = await sendChatMessage(conversationHistory, pendingFile, selectedModel);
      if (!responseBody) {
        throw new Error("No response body");
      }

      const reader = responseBody.getReader();
      const fullContent = await streamResponse(reader, setStreamingContent);

      await sendMessage({
        chatId: currentChatId,
        role: "assistant",
        content: fullContent,
      });

      // Update chat title if this is the first message
      if (shouldUpdateTitle) {
        try {
          const title = await generateAITitle(content, fullContent);
          await updateChatTitle({
            chatId: currentChatId,
            title: title,
          });
        } catch (error: any) {
          console.error("Error updating chat title:", error);
          // If quota exceeded, use fallback title generation
          if (error.status === 429 || error.message?.includes("quota")) {
            // Generate simple title from user message
            const simpleTitle = content.length > 50 
              ? content.substring(0, 47) + "..." 
              : content || "New Chat";
            try {
              await updateChatTitle({
                chatId: currentChatId,
                title: simpleTitle,
              });
            } catch (updateError) {
              console.error("Error updating with fallback title:", updateError);
            }
          }
          // Continue even if title update fails
        }
      }

      setStreamingContent("");
      setPendingFile(null);
    } catch (error: any) {
      console.error("Error sending message:", error);
      
      // Handle quota exceeded error gracefully
      if (error.status === 429) {
        setStreamingContent("");
        setPendingFile(null);
        // Show user-friendly error message
        throw new Error(
          "API quota exceeded. You've reached the daily limit of 20 requests. " +
          "Please try again in 24 hours or upgrade your API plan."
        );
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = async () => {
    const chatId = await createChat({ title: "New Chat" });
    setActiveChatId(chatId);
  };

  const handleDeleteChat = async (id: Id<"chats">, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteChat({ chatId: id });
    if (activeChatId === id) {
      setActiveChatId(null);
    }
  };

  return {
    chats: filteredChats,
    activeChatId,
    setActiveChatId,
    messages,
    isLoading,
    streamingContent,
    pendingFile,
    setPendingFile,
    searchQuery,
    setSearchQuery,
    handleSendMessage,
    handleNewChat,
    handleDeleteChat,
  };
}

