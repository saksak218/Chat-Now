import { Menu, Search, Bell, MoreVertical } from "lucide-react";
import { Chat } from "@/types";
import { Id } from "@/convex/_generated/dataModel";
import ModelSelector, { AIModel } from "./ModelSelector";

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
        <h1>{activeChat?.title || "AURA AI Assistant"}</h1>
      </div>
      <div className="flex items-center gap-3">
        <ModelSelector onModelChange={onModelChange} />
        <button
          className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
          aria-label="Search"
        >
          <Search size={18} />
        </button>
        <button
          className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>
        <button
          className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
          aria-label="More options"
        >
          <MoreVertical size={18} />
        </button>
      </div>
    </header>
  );
}

