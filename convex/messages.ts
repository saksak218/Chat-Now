import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

export const getMessages = query({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      return [];
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .order("asc")
      .collect();

    // Verify chat ownership
    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== user._id) {
      return [];
    }

    // Get file URLs for messages with files
    const messagesWithUrls = await Promise.all(
      messages.map(async (msg) => {
        if (msg.fileId) {
          const url = await ctx.storage.getUrl(msg.fileId);
          return { ...msg, fileUrl: url };
        }
        return { ...msg, fileUrl: null };
      })
    );

    return messagesWithUrls;
  },
});

export const sendMessage = mutation({
  args: {
    chatId: v.id("chats"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    fileId: v.optional(v.id("_storage")),
    fileName: v.optional(v.string()),
    fileType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Verify chat ownership
    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== (user._id as string)) {
      throw new Error("Chat not found or unauthorized");
    }

    const messageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      role: args.role,
      content: args.content,
      fileId: args.fileId,
      fileName: args.fileName,
      fileType: args.fileType,
      userId: user._id,
    });
    return messageId;
  },
});
