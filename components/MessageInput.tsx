import { useState, useRef, KeyboardEvent } from "react";
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
}

export default function MessageInput({
    onSend,
    onFileUpload,
    pendingFile,
    onRemoveFile,
    isLoading
}: MessageInputProps) {
    const [input, setInput] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = () => {
        if (input.trim() || pendingFile) {
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
                <div className="pending-file flex items-center gap-3 p-2 bg-white/5 rounded-xl m-2 border border-white/10">
                    {isImageFile(pendingFile.fileType) ? (
                        <div className="pending-image w-12 h-12 rounded-lg overflow-hidden ring-1 ring-white/20">
                            <img
                                src={`data:${pendingFile.fileType};base64,${pendingFile.base64}`}
                                alt={pendingFile.fileName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="pending-file-info flex items-center gap-2 text-slate-300">
                            <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                                <FileIcon size={18} />
                            </div>
                            <span className="file-name text-xs font-medium max-w-[150px] truncate">{pendingFile.fileName}</span>
                        </div>
                    )}
                    <button
                        onClick={onRemoveFile}
                        className="remove-file-btn ml-auto w-6 h-6 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center transition-colors"
                    >
                        <X size={12} />
                    </button>
                </div>
            )}

            <div className="input-row flex items-end gap-2 p-2">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="attach-btn p-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                    disabled={isLoading}
                >
                    <Paperclip size={20} />
                </button>

                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message or ask me anything..."
                    className="flex-1 bg-transparent border-none outline-none py-2.5 px-2 text-white placeholder-slate-500 selection:bg-primary/30 resize-none min-h-[44px] max-h-[200px]"
                    disabled={isLoading}
                    rows={1}
                    onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = `${target.scrollHeight}px`;
                    }}
                />

                <button
                    onClick={handleSubmit}
                    disabled={isLoading || (!input.trim() && !pendingFile)}
                    className={`send-btn p-2.5 rounded-xl flex items-center justify-center transition-all ${input.trim() || pendingFile
                            ? "bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105"
                            : "bg-white/5 text-slate-600 cursor-not-allowed"
                        }`}
                >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
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
