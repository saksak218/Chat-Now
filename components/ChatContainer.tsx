"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/constants";
import { useChat } from "@/hooks/useChat";
import { useFileUpload } from "@/hooks/useFileUpload";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentModel, setCurrentModel] = useState<string>("gemini");

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

  // Close sidebar on mobile when chat changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [activeChatId]);

  // Wrap handleSendMessage to show toast notifications for errors
  const handleSendMessageWithErrorHandling = async (content: string) => {
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

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push(ROUTES.SIGNUP);
  };

  const activeChat = chats?.find((c) => c._id === activeChatId);

  const handleModelChange = (model: string) => {
    console.log("ChatContainer: Model changed to:", model);
    setCurrentModel(model); // Force re-render to update UI
    // The model is automatically saved to localStorage by ModelSelector
    // and will be used by the next API call via getStoredModel()
  };

  if (isSessionPending) return null;
  if (!session) {
    router.push(ROUTES.SIGNUP);
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
            onMenuClick={() => setIsSidebarOpen(true)}
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
              onSend={handleSendMessageWithErrorHandling}
              onFileUpload={handleFileUpload}
              pendingFile={pendingFile}
              onRemoveFile={removeFile}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>
    </div>
  );
}