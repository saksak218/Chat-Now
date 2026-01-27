"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/constants";
import { useChat } from "@/hooks/useChat";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useSidebar } from "@/hooks/useSidebar";
import { useChatErrorHandler } from "@/hooks/useChatErrorHandler";
import MessageList from "@/components/MessageList";
import MessageInput from "@/components/MessageInput";
import SidebarHeader from "@/components/chat/SidebarHeader";
import ChatList from "@/components/chat/ChatList";
import SidebarFooter from "@/components/chat/SidebarFooter";
import ChatHeader from "@/components/chat/ChatHeader";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ChatContainer() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = authClient.useSession();

  const {
    chats,
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
  } = useChat(session);

  const { handleFileUpload, removeFile } = useFileUpload(setPendingFile);
  const { isSidebarOpen, setIsSidebarOpen, toggleSidebar } = useSidebar(activeChatId);
  const { currentModel, handleSendMessageWithErrorHandling, handleModelChange } = useChatErrorHandler();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push(ROUTES.LOGIN);
  };

  const activeChat = chats?.find((c) => c._id === activeChatId);

  if (isSessionPending) return null;
  if (!session) {
    router.push(ROUTES.LOGIN);
    return null;
  }

  return (
    <div className="main-layout">
      <div
        className={`sidebar-overlay ${isSidebarOpen ? "visible" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside className={`chat-sidebar ${isSidebarOpen ? "open" : ""}`}>
        <SidebarHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNewChat={handleNewChat}
          onClose={() => setIsSidebarOpen(false)}
          showCloseButton={true}
        />

        <ScrollArea className="chat-list flex-1">
          <ChatList
            chats={chats}
            activeChatId={activeChatId}
            onChatSelect={setActiveChatId}
            onChatDelete={handleDeleteChat}
          />
        </ScrollArea>

        <SidebarFooter user={session.user} onSignOut={handleSignOut} />
      </aside>

      <main className="chat-main">
        <div className="chat-container">
          <ChatHeader
            activeChat={activeChat}
            onMenuClick={toggleSidebar}
            onModelChange={handleModelChange}
          />

          <MessageList
            messages={messages || []}
            streamingContent={streamingContent}
            isLoading={isLoading}
            user={session?.user}
          />

          <div className="message-input-container">
            <MessageInput
              onSend={(content) => handleSendMessageWithErrorHandling(handleSendMessage, content)}
              onFileUpload={handleFileUpload}
              pendingFile={pendingFile}
              onRemoveFile={removeFile}
              isLoading={isLoading}
              currentModel={currentModel}
            />
          </div>
        </div>
      </main>
    </div>
  );
}