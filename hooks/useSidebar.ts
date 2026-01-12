import { useState, useEffect } from "react";
import { Id } from "@/convex/_generated/dataModel";

export function useSidebar(activeChatId: Id<"chats"> | null) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on mobile when chat changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [activeChatId]);

  return {
    isSidebarOpen,
    setIsSidebarOpen,
    toggleSidebar: () => setIsSidebarOpen(!isSidebarOpen),
    closeSidebar: () => setIsSidebarOpen(false),
  };
}
