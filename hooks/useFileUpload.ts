import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PendingFile } from "@/types";
import { fileToBase64, createPendingFile } from "@/lib/utils/file";

export function useFileUpload(
  setPendingFile: (file: PendingFile | null) => void
) {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const handleFileUpload = async (file: File) => {
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      const { storageId } = await result.json();
      const base64 = await fileToBase64(file);

      const newPendingFile = createPendingFile(
        storageId,
        file.name,
        file.type,
        base64
      );

      setPendingFile(newPendingFile);
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  const removeFile = () => {
    setPendingFile(null);
  };

  return {
    handleFileUpload,
    removeFile,
  };
}

