import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  chats: defineTable({
    title: v.string(),
    userId: v.string(), // Better Auth user ID
  }).index("by_userId", ["userId"]),

  messages: defineTable({
    chatId: v.id("chats"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    fileId: v.optional(v.id("_storage")),
    fileName: v.optional(v.string()),
    fileType: v.optional(v.string()),
    userId: v.string(),
  }).index("by_chatId", ["chatId"]),

  files: defineTable({
    chatId: v.id("chats"),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    size: v.number(),
    userId: v.string(),
  }).index("by_chatId", ["chatId"]),
});
