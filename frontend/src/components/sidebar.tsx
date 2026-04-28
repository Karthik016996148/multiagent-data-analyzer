"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, Loader2, Zap } from "lucide-react";
import { AGENTS, AGENT_ORDER, type AgentName } from "@/lib/types";
import type { AgentHistoryEntry } from "@/hooks/use-chat";
import clsx from "clsx";

interface SidebarProps {
  open: boolean;
  activeAgent: AgentName | null;
  agentHistory: AgentHistoryEntry[];
  onNewAnalysis: () => void;
}

function agentStatus(
  agent: AgentName,
  activeAgent: AgentName | null,
  agentHistory: AgentHistoryEntry[]
): "idle" | "active" | "complete" {
  if (activeAgent === agent) return "active";
  if (agentHistory.some((h) => h.agent === agent)) return "complete";
  return "idle";
}

export function Sidebar({ open, activeAgent, agentHistory, onNewAnalysis }: SidebarProps) {
  return (
    <AnimatePresence mode="wait">
      {open && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 260, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="flex h-full shrink-0 flex-col overflow-hidden border-r border-white/[0.04] bg-[#08080c]"
        >
          <div className="flex flex-1 flex-col p-4">
            <button
              onClick={onNewAnalysis}
              className="gradient-primary glow-sm mb-6 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
            >
              <Plus size={15} />
              New Analysis
            </button>

            <div className="mb-2">
              <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600">
                Agent Pipeline
              </h3>

              <div className="flex flex-col">
                {AGENT_ORDER.map((name, i) => {
                  const agent = AGENTS[name];
                  const status = agentStatus(name, activeAgent, agentHistory);

                  return (
                    <div key={name} className="flex items-stretch gap-3">
                      <div className="flex w-6 flex-col items-center">
                        <motion.div
                          className={clsx(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] transition-all",
                            status === "active" && "gradient-primary shadow-lg shadow-violet-500/30",
                            status === "complete" && "bg-emerald-500/15 ring-1 ring-emerald-500/20",
                            status === "idle" && "bg-white/[0.04] ring-1 ring-white/[0.06]"
                          )}
                          animate={status === "active" ? { scale: [1, 1.12, 1] } : {}}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          {status === "complete" ? (
                            <Check size={11} className="text-emerald-400" />
                          ) : status === "active" ? (
                            <Loader2 size={11} className="animate-spin text-white" />
                          ) : (
                            <span className="text-[10px] grayscale">{agent.icon}</span>
                          )}
                        </motion.div>

                        {i < AGENT_ORDER.length - 1 && (
                          <div
                            className={clsx(
                              "w-px flex-1 transition-colors",
                              status === "complete" ? "bg-emerald-500/25" : "bg-white/[0.04]"
                            )}
                          />
                        )}
                      </div>

                      <div className={clsx("pb-5", i === AGENT_ORDER.length - 1 && "pb-0")}>
                        <p
                          className={clsx(
                            "text-[13px] font-medium leading-6 transition-colors",
                            status === "active" && "text-white",
                            status === "complete" && "text-zinc-300",
                            status === "idle" && "text-zinc-600"
                          )}
                        >
                          {agent.label}
                        </p>
                        <AnimatePresence>
                          {status === "active" && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="text-[11px] leading-snug text-zinc-500"
                            >
                              {agent.description}...
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.04] p-4">
            <div className="rounded-xl bg-white/[0.02] p-3 ring-1 ring-white/[0.04]">
              <div className="mb-1.5 flex items-center gap-1.5">
                <Zap size={11} className="text-violet-400" />
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500">
                  How it works
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-zinc-600">
                Your question flows through 5 specialized AI agents — each handles planning,
                coding, execution, visualization, and summarization.
              </p>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
