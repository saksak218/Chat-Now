import { useState, useRef, KeyboardEvent, useEffect } from "react";
import { PendingFile } from "@/types";
import { isImageFile } from "@/lib/utils/file";
import { FILE_ACCEPT_TYPES } from "@/constants";
import { Send, Paperclip, X, File as FileIcon, Loader2 } from "lucide-react";

interface MessageInputProps {
  onSend: (content: string) => void;
  onFileUpload: (file: File) => void;
  pendingFile: PendingFile | null;
  onRemoveFile: () => void;
  isLoading: boolean;
  currentModel?: string;
}

export default function MessageInput({
    onSend,
    onFileUpload,
    pendingFile,
    onRemoveFile,
    isLoading,
    currentModel
}: MessageInputProps) {
    const [input, setInput] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Disable file uploads for Mistral AI (doesn't support multimodal)
    const isFileUploadDisabled = currentModel === "mistral";

    // Clear pending files when switching to Mistral AI (doesn't support files)
    useEffect(() => {
        if (isFileUploadDisabled && pendingFile) {
            onRemoveFile();
        }
    }, [isFileUploadDisabled, pendingFile, onRemoveFile]);

    const handleSubmit = () => {
        if (input.trim() || (pendingFile && !isFileUploadDisabled)) {
            onSend(input);
            setInput("");
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onFileUpload(file);
        }
        e.target.value = "";
    };


    return (
        <div className="input-wrapper">
            {pendingFile && (
                <div className="pending-file flex items-center gap-2 sm:gap-3 p-2 bg-white/5 rounded-xl mx-2 my-2 border border-white/10">
                    {isImageFile(pendingFile.fileType) ? (
                        <div className="pending-image w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden ring-1 ring-white/20 flex-shrink-0">
                            <img
                                src={`data:${pendingFile.fileType};base64,${pendingFile.base64}`}
                                alt={pendingFile.fileName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="pending-file-info flex items-center gap-2 text-slate-300 flex-1 min-w-0">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FileIcon size={16} />
                            </div>
                            <span className="file-name text-xs font-medium truncate max-w-[120px] sm:max-w-[150px]">{pendingFile.fileName}</span>
                        </div>
                    )}
                    <button
                        onClick={onRemoveFile}
                        className="remove-file-btn w-6 h-6 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                    >
                        <X size={12} />
                    </button>
                </div>
            )}

            <div className="input-row flex items-end gap-1 sm:gap-2 p-2">
                {!isFileUploadDisabled && (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="attach-btn p-2 sm:p-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all flex-shrink-0"
                        disabled={isLoading}
                        title="Attach file"
                    >
                        <Paperclip size={18} />
                    </button>
                )}

                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent border-none outline-none py-2.5 px-2 text-white placeholder-slate-500 selection:bg-primary/30 resize-none min-h-[40px] sm:min-h-[44px] max-h-[200px] text-sm sm:text-base"
                    disabled={isLoading}
                    rows={1}
                    onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
                    }}
                />

                <button
                    onClick={handleSubmit}
                    disabled={isLoading || (!input.trim() && !pendingFile)}
                    className={`send-btn p-2 sm:p-2.5 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${input.trim() || pendingFile
                            ? "bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105"
                            : "bg-white/5 text-slate-600 cursor-not-allowed"
                        }`}
                >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept={FILE_ACCEPT_TYPES}
                onChange={handleFileChange}
                style={{ display: "none" }}
            />
        </div>
    );
}
