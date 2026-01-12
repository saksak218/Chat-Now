import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Message } from "@/types";

export function useChatData(session: { user: { id: string } } | null) {
  const chats = useQuery(api.chats.getChats, session ? {} : "skip");
  const [activeChatId, setActiveChatId] = useState<Id<"chats"> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const messages = useQuery(
    api.messages.getMessages,
    activeChatId ? { chatId: activeChatId } : "skip"
  ) as Message[] | undefined;

  // Set first chat as active if none selected
  useEffect(() => {
    if (chats && chats.length > 0 && !activeChatId) {
      setActiveChatId(chats[0]._id);
    }
  }, [chats, activeChatId]);

  const filteredChats = chats?.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    chats,
    activeChatId,
    setActiveChatId,
    messages,
    searchQuery,
    setSearchQuery,
    filteredChats,
  };
}
