"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useChat } from "@/hooks/use-chat";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { DataUpload } from "@/components/data-upload";
import { ChatInterface } from "@/components/chat-interface";
import { AlertCircle, X } from "lucide-react";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const {
    messages,
    isLoading,
    activeAgent,
    agentHistory,
    dataset,
    error,
    uploadFile,
    sendMessage,
    clearChat,
    clearError,
  } = useChat();

  return (
    <>
      <Header
        dataset={dataset}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((p) => !p)}
      />

      <div className="flex min-h-0 flex-1">
        <Sidebar
          open={sidebarOpen}
          activeAgent={activeAgent}
          agentHistory={agentHistory}
          onNewAnalysis={clearChat}
        />

        <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          {!dataset ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="mb-10 text-center"
              >
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20">
                  <span className="text-4xl">🔬</span>
                </div>
                <h2 className="gradient-text text-4xl font-extrabold tracking-tight sm:text-5xl">
                  Analyze your data with AI
                </h2>
                <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-zinc-400">
                  Upload a CSV dataset and ask questions in natural language. Five specialized
                  AI agents collaborate to plan, code, analyze, visualize, and summarize insights.
                </p>
              </motion.div>

              <DataUpload onUpload={uploadFile} dataset={dataset} isLoading={isLoading} />

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500"
              >
                {[
                  { dot: "bg-violet-400", text: "5 Specialized Agents" },
                  { dot: "bg-cyan-400", text: "Real-time Streaming" },
                  { dot: "bg-emerald-400", text: "Interactive Charts" },
                  { dot: "bg-amber-400", text: "AI Insights" },
                ].map((item) => (
                  <span key={item.text} className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${item.dot}`} />
                    {item.text}
                  </span>
                ))}
              </motion.div>
            </div>
          ) : (
            <ChatInterface
              messages={messages}
              isLoading={isLoading}
              activeAgent={activeAgent}
              agentHistory={agentHistory}
              dataset={dataset}
              hasSession={!!dataset}
              onSend={sendMessage}
            />
          )}
        </main>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
          >
            <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-950/80 px-5 py-3 shadow-2xl backdrop-blur-xl">
              <AlertCircle size={16} className="shrink-0 text-red-400" />
              <p className="text-sm text-red-200">{error}</p>
              <button
                onClick={clearError}
                className="shrink-0 text-red-400 transition hover:text-red-300"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
