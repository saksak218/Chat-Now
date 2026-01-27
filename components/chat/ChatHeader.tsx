import { Menu } from "lucide-react";
import { Chat } from "@/types";
import { Id } from "@/convex/_generated/dataModel";
import ModelSelector from "./ModelSelector";
import { AIModel } from "@/lib/utils/model";

interface ChatHeaderProps {
  activeChat: Chat | undefined;
  onMenuClick: () => void;
  onModelChange?: (model: AIModel) => void;
}

export default function ChatHeader({ activeChat, onMenuClick, onModelChange }: ChatHeaderProps) {
  return (
    <header className="chat-header">
      <div className="flex items-center gap-3 overflow-hidden">
        <button
          className="mobile-toggle"
          onClick={onMenuClick}
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>
        <h1>{activeChat?.title || "CHAT NOW AI Assistant"}</h1>
      </div>
      <div className="flex items-center gap-3">
        <ModelSelector onModelChange={onModelChange} />
      </div>
    </header>
  );
}

