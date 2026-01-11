import { LogOut, Settings, User } from "lucide-react";
import { User as UserType } from "@/types";

interface SidebarFooterProps {
  user: UserType | null;
  onSignOut: () => void;
}

export default function SidebarFooter({ user, onSignOut }: SidebarFooterProps) {
  return (
    <div className="sidebar-footer">
      <div className="user-info">
        <div className="user-avatar overflow-hidden">
          {user?.image ? (
            <img
              src={user.image}
              alt={user.name || "User"}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white">
              {user?.name?.[0]?.toUpperCase() || <User size={16} />}
            </span>
          )}
        </div>
        <div className="user-details">
          <span className="user-name">{user?.name || "User"}</span>
        </div>
        <Settings
          size={16}
          className="text-slate-500 cursor-pointer hover:text-white transition-colors"
        />
      </div>
      <button
        onClick={onSignOut}
        className="sign-out-btn flex items-center justify-center gap-2"
        aria-label="Sign out"
      >
        <LogOut size={16} /> Sign Out
      </button>
    </div>
  );
}

