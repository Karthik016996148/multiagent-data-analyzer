"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, ArrowDown, Database } from "lucide-react";
import type { Message, AgentName, DatasetInfo } from "@/lib/types";
import type { AgentHistoryEntry } from "@/hooks/use-chat";
import { MessageBubble } from "./message-bubble";
import { AgentTimeline } from "./agent-timeline";
import clsx from "clsx";

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  activeAgent: AgentName | null;
  agentHistory: AgentHistoryEntry[];
  dataset: DatasetInfo | null;
  hasSession: boolean;
  onSend: (message: string) => void;
}

const SUGGESTIONS = [
  "What are the top 5 products by total revenue?",
  "Show me monthly sales trends over time",
  "Which region generates the highest profit?",
  "Compare revenue vs cost by category",
];

export function ChatInterface({
  messages,
  isLoading,
  activeAgent,
  agentHistory,
  dataset,
  hasSession,
  onSend,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowScrollBtn(gap > 120);
    };
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading || !hasSession) return;
    onSend(trimmed);
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  };

  const visibleMessages = messages.filter((m) => {
    if (m.role === "system" && messages.indexOf(m) !== 0) return false;
    if (m.type === "agent_start" && !isLoading) return false;
    return true;
  });
  const isEmpty = visibleMessages.length <= 1;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Messages area */}
      <div ref={scrollRef} className="relative flex-1 overflow-y-auto">
        {isEmpty && hasSession ? (
          <div className="flex h-full flex-col items-center justify-center gap-8 px-6">
            {dataset && (
              <div className="glass rounded-xl px-4 py-2.5">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Database size={12} className="text-emerald-400" />
                  <span className="font-medium text-zinc-300">{dataset.filename}</span>
                  <span className="text-zinc-600">&middot;</span>
                  <span>{dataset.rows.toLocaleString()} rows</span>
                  <span className="text-zinc-600">&middot;</span>
                  <span>{dataset.columns.length} cols</span>
                </div>
              </div>
            )}

            <div className="text-center">
              <h3 className="text-xl font-bold text-zinc-100">What would you like to know?</h3>
              <p className="mt-2 text-sm text-zinc-500">
                Ask any question about your data — the AI agents will handle the rest
              </p>
            </div>

            <div className="grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => onSend(s)}
                  className="glass-hover group flex items-start gap-3 rounded-xl px-4 py-3.5 text-left transition"
                >
                  <Sparkles size={13} className="mt-0.5 shrink-0 text-violet-400 opacity-50 transition group-hover:opacity-100" />
                  <span className="text-[13px] leading-snug text-zinc-400 transition group-hover:text-zinc-200">
                    {s}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-6 sm:px-6">
            {visibleMessages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </div>
        )}

        <AnimatePresence>
          {showScrollBtn && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={scrollToBottom}
              className="glass absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full p-2 text-zinc-400 shadow-lg transition hover:text-white"
            >
              <ArrowDown size={16} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Agent timeline */}
      <AnimatePresence>
        {agentHistory.length > 0 && (
          <AgentTimeline activeAgent={activeAgent} agentHistory={agentHistory} />
        )}
      </AnimatePresence>

      {/* Input bar */}
      <div className="border-t border-white/[0.04] bg-[#08080c]/80 px-4 pb-5 pt-3 backdrop-blur-xl sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div
            className={clsx(
              "glass-strong flex items-end gap-3 rounded-2xl px-4 py-3 transition-all",
              "focus-within:ring-1 focus-within:ring-violet-500/30 focus-within:shadow-lg focus-within:shadow-violet-500/5"
            )}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={hasSession ? "Ask a question about your data..." : "Upload a dataset first"}
              disabled={!hasSession || isLoading}
              rows={1}
              className="max-h-40 flex-1 resize-none bg-transparent text-sm leading-relaxed text-white placeholder-zinc-600 outline-none disabled:cursor-not-allowed disabled:opacity-40"
            />

            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading || !hasSession}
              className={clsx(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all",
                input.trim() && hasSession && !isLoading
                  ? "gradient-primary glow-sm text-white hover:brightness-110 active:scale-95"
                  : "bg-white/[0.04] text-zinc-700"
              )}
              aria-label="Send message"
            >
              <Send size={15} />
            </button>
          </div>

          <p className="mt-2 text-center text-[10px] text-zinc-700">
            Agents may produce inaccurate results. Verify important findings.
          </p>
        </div>
      </div>
    </div>
  );
}
