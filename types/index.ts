import { Id } from "@/convex/_generated/dataModel";

export interface Message {
  _id: string;
  role: "user" | "assistant";
  content: string;
  fileId?: Id<"_storage">;
  fileName?: string;
  fileType?: string;
  fileUrl?: string | null;
}

export interface PendingFile {
  storageId: Id<"_storage">;
  fileName: string;
  fileType: string;
  base64: string;
}

export interface User {
  name?: string | null;
  image?: string | null;
  email?: string | null;
}

export interface Chat {
  _id: Id<"chats">;
  title: string;
  createdAt?: number;
}

