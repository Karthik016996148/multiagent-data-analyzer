"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { AGENTS, type Message } from "@/lib/types";
import { ChartRenderer } from "./chart-renderer";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

function AgentBadge({ agent }: { agent: string }) {
  const info = AGENTS[agent as keyof typeof AGENTS];
  if (!info) return null;

  return (
    <div className="mb-2.5 flex items-center gap-2">
      <span className="text-xs">{info.icon}</span>
      <span className={clsx("text-[11px] font-bold uppercase tracking-wider", info.color)}>
        {info.label}
      </span>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 pl-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block h-1 w-1 rounded-full bg-violet-400"
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </span>
  );
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="overflow-hidden rounded-xl ring-1 ring-white/[0.06]">
      <div className="flex items-center justify-between bg-white/[0.02] px-4 py-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">python</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[10px] font-medium text-zinc-500 transition hover:text-zinc-300"
        >
          {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto bg-black/30 p-4 text-[12px] leading-relaxed text-zinc-300">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={clsx("group flex", isUser ? "justify-end" : "justify-start")}
    >
      <div className={clsx("max-w-[88%] sm:max-w-[78%]", isUser && "max-w-[72%] sm:max-w-[60%]")}>
        {isUser ? (
          <div className="rounded-2xl rounded-br-sm bg-gradient-to-br from-violet-600 to-indigo-600 px-4 py-3 shadow-lg shadow-violet-500/10">
            <p className="text-[13px] leading-relaxed text-white">{message.content}</p>
          </div>
        ) : isSystem ? (
          <div className="glass rounded-2xl px-4 py-3">
            <div className="text-[13px] text-zinc-400">
              <ReactMarkdown
                components={{
                  strong: ({ children }) => (
                    <strong className="font-semibold text-zinc-200">{children}</strong>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="glass-strong gradient-border rounded-2xl px-4 py-3">
            {message.agent && <AgentBadge agent={message.agent} />}

            {message.type === "agent_start" && (
              <div className="flex items-center gap-2 text-[13px] text-zinc-500">
                <span>{AGENTS[message.agent as keyof typeof AGENTS]?.description || "Processing"}</span>
                <TypingDots />
              </div>
            )}

            {message.type === "code" && <CodeBlock code={message.content} />}

            {message.type === "chart" && message.chartSpec && (
              <ChartRenderer spec={message.chartSpec} />
            )}

            {message.type === "summary" && (
              <div className="prose prose-sm prose-invert max-w-none text-[13px] leading-relaxed">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            )}

            {message.type === "text" && message.content && (
              <p className="text-[13px] leading-relaxed text-zinc-300">{message.content}</p>
            )}
          </div>
        )}

        <p className="mt-1 px-1 text-[9px] text-zinc-700 opacity-0 transition-opacity group-hover:opacity-100">
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </motion.div>
  );
}
