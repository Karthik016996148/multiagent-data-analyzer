export type AgentName = "planner" | "coder" | "analyzer" | "visualizer" | "summarizer";

export interface AgentInfo {
  name: AgentName;
  label: string;
  description: string;
  icon: string;
  color: string;
}

export const AGENTS: Record<AgentName, AgentInfo> = {
  planner: {
    name: "planner",
    label: "Planner",
    description: "Planning analysis approach",
    icon: "🎯",
    color: "text-violet-400",
  },
  coder: {
    name: "coder",
    label: "Code Generator",
    description: "Writing analysis code",
    icon: "💻",
    color: "text-blue-400",
  },
  analyzer: {
    name: "analyzer",
    label: "Analyzer",
    description: "Executing analysis",
    icon: "🔬",
    color: "text-cyan-400",
  },
  visualizer: {
    name: "visualizer",
    label: "Visualizer",
    description: "Creating charts",
    icon: "📊",
    color: "text-emerald-400",
  },
  summarizer: {
    name: "summarizer",
    label: "Summarizer",
    description: "Generating insights",
    icon: "✨",
    color: "text-amber-400",
  },
};

export const AGENT_ORDER: AgentName[] = ["planner", "coder", "analyzer", "visualizer", "summarizer"];

export interface SSEEvent {
  type: "agent_start" | "agent_output" | "code" | "chart" | "summary" | "done" | "error";
  agent?: AgentName;
  content?: any;
}

export interface ChartSpec {
  type: "bar" | "line" | "pie" | "area" | "scatter";
  title: string;
  data: Record<string, any>[];
  xKey: string;
  yKeys: string[];
  colors: string[];
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  agent?: AgentName;
  type?: "text" | "code" | "chart" | "summary" | "agent_start";
  chartSpec?: ChartSpec;
  timestamp: Date;
}

export interface DatasetInfo {
  filename: string;
  columns: string[];
  rows: number;
  sample: Record<string, any>[];
  schema: string;
  rawData: Record<string, any>[];
}
