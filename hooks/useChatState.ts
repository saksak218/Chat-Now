import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { PendingFile } from "@/types";

export function useChatState() {
  const [activeChatId, setActiveChatId] = useState<Id<"chats"> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [pendingFile, setPendingFile] = useState<PendingFile | null>(null);

  return {
    activeChatId,
    setActiveChatId,
    searchQuery,
    setSearchQuery,
    isLoading,
    setIsLoading,
    streamingContent,
    setStreamingContent,
    pendingFile,
    setPendingFile,
  };
}
