import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveFile = mutation({
  args: {
    chatId: v.id("chats"),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    size: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }

    const fileId = await ctx.db.insert("files", {
      chatId: args.chatId,
      storageId: args.storageId,
      fileName: args.fileName,
      fileType: args.fileType,
      size: args.size,
      userId: user._id,
    });
    return fileId;
  },
});

export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
