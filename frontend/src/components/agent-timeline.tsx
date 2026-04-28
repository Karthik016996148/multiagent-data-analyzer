"use client";

import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { AGENTS, AGENT_ORDER, type AgentName } from "@/lib/types";
import type { AgentHistoryEntry } from "@/hooks/use-chat";
import clsx from "clsx";

interface AgentTimelineProps {
  activeAgent: AgentName | null;
  agentHistory: AgentHistoryEntry[];
}

export function AgentTimeline({ activeAgent, agentHistory }: AgentTimelineProps) {
  if (!activeAgent && agentHistory.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="border-t border-white/[0.04] bg-[#08080c]/80 backdrop-blur-xl"
    >
      <div className="flex items-center justify-center gap-0.5 overflow-x-auto px-4 py-2.5">
        {AGENT_ORDER.map((name, i) => {
          const agent = AGENTS[name];
          const isActive = activeAgent === name;
          const isComplete = agentHistory.some((h) => h.agent === name);
          const isIdle = !isActive && !isComplete;

          return (
            <div key={name} className="flex items-center">
              <motion.div
                layout
                className={clsx(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all",
                  isActive && "gradient-primary glow-sm text-white",
                  isComplete && "bg-emerald-500/10 text-emerald-400",
                  isIdle && "text-zinc-700"
                )}
              >
                {isActive ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : isComplete ? (
                  <Check size={11} />
                ) : (
                  <span className="text-[10px] grayscale">{agent.icon}</span>
                )}
                <span className="hidden whitespace-nowrap sm:inline">{agent.label}</span>
              </motion.div>

              {i < AGENT_ORDER.length - 1 && (
                <div className={clsx("mx-1 h-px w-4 sm:w-6", isComplete ? "bg-emerald-500/25" : "bg-white/[0.04]")} />
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
