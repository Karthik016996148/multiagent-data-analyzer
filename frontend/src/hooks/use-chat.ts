"use client";

import { useState, useCallback, useRef } from "react";
import type { Message, DatasetInfo, AgentName, SSEEvent } from "@/lib/types";
import { uploadFile as apiUpload, sendMessage as apiSend } from "@/lib/api";

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export interface AgentHistoryEntry {
  agent: AgentName;
  timestamp: Date;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState<AgentName | null>(null);
  const [agentHistory, setAgentHistory] = useState<AgentHistoryEntry[]>([]);
  const [dataset, setDataset] = useState<DatasetInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const handleUpload = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const info = await apiUpload(file);
      setDataset(info);
      setMessages([
        {
          id: uid(),
          role: "system",
          content: `Dataset **${info.filename}** loaded — ${info.rows.toLocaleString()} rows, ${info.columns.length} columns.`,
          type: "text",
          timestamp: new Date(),
        },
      ]);
    } catch (e: any) {
      setError(e.message || "Upload failed");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSend = useCallback(
    async (message: string) => {
      if (!dataset || isLoading) return;
      abortRef.current = false;
      setIsLoading(true);
      setError(null);
      setAgentHistory([]);
      setActiveAgent(null);

      const userMsg: Message = {
        id: uid(),
        role: "user",
        content: message,
        type: "text",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);

      try {
        await apiSend(message, dataset, (event: SSEEvent) => {
          if (abortRef.current) return;

          switch (event.type) {
            case "agent_start":
              if (event.agent) {
                setActiveAgent(event.agent);
                setAgentHistory((prev) => [...prev, { agent: event.agent!, timestamp: new Date() }]);
                setMessages((prev) => [
                  ...prev,
                  {
                    id: uid(),
                    role: "assistant",
                    content: "",
                    agent: event.agent,
                    type: "agent_start",
                    timestamp: new Date(),
                  },
                ]);
              }
              break;

            case "agent_output":
              if (event.content) {
                setMessages((prev) => [
                  ...prev,
                  {
                    id: uid(),
                    role: "assistant",
                    content: String(event.content),
                    agent: event.agent,
                    type: "text",
                    timestamp: new Date(),
                  },
                ]);
              }
              break;

            case "code":
              setMessages((prev) => [
                ...prev,
                {
                  id: uid(),
                  role: "assistant",
                  content: String(event.content),
                  agent: event.agent,
                  type: "code",
                  timestamp: new Date(),
                },
              ]);
              break;

            case "chart":
              setMessages((prev) => [
                ...prev,
                {
                  id: uid(),
                  role: "assistant",
                  content: event.content?.title || "Chart",
                  agent: event.agent,
                  type: "chart",
                  chartSpec: event.content,
                  timestamp: new Date(),
                },
              ]);
              break;

            case "summary":
              setMessages((prev) => [
                ...prev,
                {
                  id: uid(),
                  role: "assistant",
                  content: String(event.content),
                  agent: event.agent,
                  type: "summary",
                  timestamp: new Date(),
                },
              ]);
              break;

            case "error":
              setError(String(event.content));
              break;

            case "done":
              setActiveAgent(null);
              setIsLoading(false);
              setAgentHistory([]);
              break;
          }
        });
      } catch (e: any) {
        if (!abortRef.current) {
          setError(e.message || "Something went wrong");
        }
      } finally {
        setIsLoading(false);
        setActiveAgent(null);
      }
    },
    [dataset, isLoading]
  );

  const clearChat = useCallback(() => {
    abortRef.current = true;
    setMessages([]);
    setDataset(null);
    setActiveAgent(null);
    setAgentHistory([]);
    setIsLoading(false);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    messages,
    isLoading,
    activeAgent,
    agentHistory,
    dataset,
    error,
    uploadFile: handleUpload,
    sendMessage: handleSend,
    clearChat,
    clearError,
  };
}
