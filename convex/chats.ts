import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

export const createChat = mutation({
  args: {
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }

    const chatId = await ctx.db.insert("chats", {
      title: args.title,
      userId: user._id, // Id<"user"> fits v.string() in Convex, but casting for safety
    });

    return chatId;
  },
});

export const getChats = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      return [];
    }

    return await ctx.db
      .query("chats")
      .withIndex("by_userId", (q) => q.eq("userId", user._id)) // Convex handles Id comparison with string fields if types match
      .order("desc")
      .collect();
  },
});

export const updateChatTitle = mutation({
  args: {
    chatId: v.id("chats"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== user._id) {
      throw new Error("Chat not found or unauthorized");
    }

    await ctx.db.patch(args.chatId, {
      title: args.title,
    });
  },
});

export const deleteChat = mutation({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== user._id) {
      // Same here
      throw new Error("Chat not found or unauthorized");
    }

    // Delete all messages in the chat
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .collect();

    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }

    // Delete the chat itself
    await ctx.db.delete(args.chatId);
  },
});
