"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";

interface MarkdownRendererProps {
    content: string;
}

const CodeBlock = ({ children, language, ...props }: any) => {
    const [copied, setCopied] = useState(false);

    const onCopy = () => {
        navigator.clipboard.writeText(String(children).replace(/\n$/, ""));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="code-block-wrapper">
            <div className="code-block-header">
                <span className="code-lang">{language || "text"}</span>
                <button onClick={onCopy} className="copy-btn">
                    {copied ? (
                        <>
                            <Check size={12} />
                            <span>Copied!</span>
                        </>
                    ) : (
                        <>
                            <Copy size={12} />
                            <span>Copy code</span>
                        </>
                    )}
                </button>
            </div>
            <SyntaxHighlighter
                style={vscDarkPlus}
                language={language}
                PreTag="div"
                {...props}
            >
                {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
        </div>
    );
};

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                        <CodeBlock language={match[1]} {...props}>
                            {children}
                        </CodeBlock>
                    ) : (
                        <code className={className} {...props}>
                            {children}
                        </code>
                    );
                },
                table({ children }) {
                    return (
                        <div className="table-container">
                            <table>{children}</table>
                        </div>
                    );
                },
            }}
        >
            {content}
        </ReactMarkdown>
    );
}
