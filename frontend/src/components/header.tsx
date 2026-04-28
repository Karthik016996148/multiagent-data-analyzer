"use client";

import { Sparkles, Github, Database, PanelLeftClose, PanelLeft } from "lucide-react";
import type { DatasetInfo } from "@/lib/types";

interface HeaderProps {
  dataset: DatasetInfo | null;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function Header({ dataset, sidebarOpen, onToggleSidebar }: HeaderProps) {
  return (
    <header className="glass-strong relative z-30 flex items-center justify-between px-5 py-3">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-white/5 hover:text-white"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
        </button>

        <div className="flex items-center gap-2.5">
          <div className="gradient-primary glow-sm flex h-8 w-8 items-center justify-center rounded-lg">
            <Sparkles size={15} className="text-white" />
          </div>
          <div>
            <h1 className="gradient-text text-base font-bold leading-tight tracking-tight">
              DataFlow AI
            </h1>
            <p className="hidden text-[10px] leading-none text-zinc-500 sm:block">
              Multi-Agent Data Analysis
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {dataset && (
          <div className="glass hidden items-center gap-2 rounded-full px-3 py-1.5 sm:flex">
            <Database size={12} className="text-violet-400" />
            <span className="text-[11px] font-medium text-zinc-300">{dataset.filename}</span>
            <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-400">
              {dataset.rows.toLocaleString()} rows
            </span>
          </div>
        )}

        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg p-1.5 text-zinc-600 transition-colors hover:bg-white/5 hover:text-white"
          aria-label="GitHub"
        >
          <Github size={17} />
        </a>
      </div>
    </header>
  );
}
