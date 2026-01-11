import { PendingFile } from "@/types";
import { Id } from "@/convex/_generated/dataModel";

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });
};

export const isImageFile = (fileType?: string): boolean => {
  return fileType?.startsWith("image/") ?? false;
};

export const createPendingFile = (
  storageId: Id<"_storage">,
  fileName: string,
  fileType: string,
  base64: string
): PendingFile => {
  return {
    storageId,
    fileName,
    fileType,
    base64,
  };
};

