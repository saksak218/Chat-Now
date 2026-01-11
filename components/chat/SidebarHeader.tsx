import { Plus, Search, X } from "lucide-react";
import Logo from "@/components/shared/Logo";

interface SidebarHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onNewChat: () => void;
  onClose?: () => void;
  showCloseButton?: boolean;
}

export default function SidebarHeader({
  searchQuery,
  onSearchChange,
  onNewChat,
  onClose,
  showCloseButton = false,
}: SidebarHeaderProps) {
  return (
    <div className="sidebar-header">
      <div className="flex items-center justify-between mb-4">
        <Logo size="sm" className="flex-1" />
        {showCloseButton && onClose && (
          <button
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors md:hidden flex-shrink-0"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="search-container mb-3 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
        <input
          type="text"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-slate-900/50 border border-slate-800 rounded-lg py-2 pl-9 pr-3 text-sm outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      <button
        onClick={onNewChat}
        className="new-chat-btn w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white rounded-lg py-2.5 px-4 text-sm font-medium transition-colors"
      >
        <Plus size={18} /> New Chat
      </button>
    </div>
  );
}

