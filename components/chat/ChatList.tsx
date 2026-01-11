import { MessageSquare, Trash2 } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { Chat } from "@/types";

interface ChatListProps {
  chats: Chat[] | undefined;
  activeChatId: Id<"chats"> | null;
  onChatSelect: (chatId: Id<"chats">) => void;
  onChatDelete: (chatId: Id<"chats">, e: React.MouseEvent) => void;
}

export default function ChatList({
  chats,
  activeChatId,
  onChatSelect,
  onChatDelete,
}: ChatListProps) {
  if (!chats || chats.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-slate-500 text-sm text-center">No chats yet. Create a new chat to get started!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 p-2">
      {chats.map((chat) => (
        <div
          key={chat._id}
          className={`chat-item ${activeChatId === chat._id ? "active" : ""}`}
          onClick={() => onChatSelect(chat._id)}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <MessageSquare
              size={16}
              className={activeChatId === chat._id ? "text-primary" : "text-slate-500"}
            />
            <span className="chat-title">{chat.title}</span>
          </div>
          <button
            onClick={(e) => onChatDelete(chat._id, e)}
            className="delete-chat-btn"
            title="Delete chat"
            aria-label="Delete chat"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

