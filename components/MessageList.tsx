import { useRef, useEffect } from "react";
import { Message, User } from "@/types";
import { isImageFile } from "@/lib/utils/file";
import MarkdownRenderer from "./MarkdownRenderer";
import { Bot, Sparkles, Paperclip, User as UserIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MessageListProps {
  messages: Message[];
  streamingContent: string;
  isLoading: boolean;
  user?: User | null;
}

export default function MessageList({ messages, streamingContent, isLoading, user }: MessageListProps) {
    const viewportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Find the actual scrollable viewport inside the ScrollArea
        const viewport = viewportRef.current?.querySelector('[data-slot="scroll-area-viewport"]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }, [messages, streamingContent, isLoading]);


    return (
        <ScrollArea className="flex-1 min-h-0 px-4 md:px-6" ref={viewportRef}>
            <div className="message-list-inner py-8 flex flex-col gap-8 max-w-5xl mx-auto">
                {messages.length === 0 && !isLoading && (
                    <div className="empty-state flex-1 flex flex-col items-center justify-center text-center opacity-80 py-20">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                            <Sparkles size={32} className="text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-white">How can I help you today?</h2>
                        <p className="text-slate-400 max-w-md">
                            Start a conversation or upload a file to analyze with AURA AI.
                        </p>
                    </div>
                )}

                {messages.map((message) => (
                    <div
                        key={message._id}
                        className={`message flex gap-4 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                        <div className={`message-avatar w-10 h-10 rounded-xl overflow-hidden shadow-lg flex-shrink-0 flex items-center justify-center text-white ${message.role === "user"
                            ? "bg-primary"
                            : "bg-slate-800 border border-white/10"
                            }`}>
                            {message.role === "assistant" ? (
                                <Bot size={20} />
                            ) : (
                                user?.image ? (
                                    <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-sm font-bold uppercase">{user?.name?.[0] || <UserIcon size={18} />}</span>
                                )
                            )}
                        </div>

                        <div className={`message-content max-w-[85%] sm:max-w-[75%] flex flex-col gap-2 ${message.role === "user" ? "items-end" : "items-start"
                            }`}>
                            {message.fileUrl && isImageFile(message.fileType) && (
                                <div className="message-image ring-1 ring-white/10 rounded-xl overflow-hidden shadow-2xl max-w-sm">
                                    <img src={message.fileUrl} alt={message.fileName || "Uploaded image"} className="w-full" />
                                </div>
                            )}
                            {message.fileName && !isImageFile(message.fileType) && (
                                <div className="message-file flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
                                    <Paperclip size={14} className="text-slate-400" />
                                    <span className="file-name text-xs text-slate-300">{message.fileName}</span>
                                </div>
                            )}
                            <div className="message-text">
                                {message.role === "assistant" ? (
                                    <MarkdownRenderer content={message.content} />
                                ) : (
                                    <div className="whitespace-pre-wrap">{message.content}</div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {(isLoading || streamingContent) && (
                    <div className="message flex gap-4 flex-row">
                        <div className="message-avatar w-10 h-10 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center flex-shrink-0">
                            <Bot size={20} className="text-white" />
                        </div>
                        <div className="message-content items-start max-w-[85%] sm:max-w-[75%] flex flex-col gap-2">
                            <div className="message-text min-h-[44px]">
                                {streamingContent ? (
                                    <MarkdownRenderer content={streamingContent} />
                                ) : (
                                    <div className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ScrollArea>
    );
}
