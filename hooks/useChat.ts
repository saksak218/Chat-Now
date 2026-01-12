import { useChatState } from "./useChatState";
import { useChatActions } from "./useChatActions";
import { useChatData } from "./useChatData";

export function useChat(session: { user: { id: string } } | null) {
  const {
    chats,
    activeChatId,
    setActiveChatId,
    messages,
    searchQuery,
    setSearchQuery,
    filteredChats,
  } = useChatData(session);

  const {
    isLoading,
    streamingContent,
    pendingFile,
    setPendingFile,
    handleSendMessage,
    handleNewChat,
    handleDeleteChat,
  } = useChatActions(activeChatId, setActiveChatId, chats, messages);

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

