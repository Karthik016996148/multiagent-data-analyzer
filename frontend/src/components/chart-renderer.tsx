"use client";

import { motion } from "framer-motion";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import type { ChartSpec } from "@/lib/types";

const DEFAULT_COLORS = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#3b82f6"];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-white/10 bg-zinc-900/95 px-3 py-2 shadow-2xl backdrop-blur-xl">
      {label && <p className="mb-1 text-[10px] font-semibold text-zinc-300">{label}</p>}
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-[11px]" style={{ color: entry.color }}>
          {entry.name}: <span className="font-bold">{Number(entry.value).toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
}

export function ChartRenderer({ spec }: { spec: ChartSpec }) {
  const colors = spec.colors?.length ? spec.colors : DEFAULT_COLORS;
  const axisStyle = { fontSize: 10, fill: "#71717a" };
  const gridStroke = "rgba(255,255,255,0.04)";

  const renderChart = () => {
    switch (spec.type) {
      case "bar":
        return (
          <BarChart data={spec.data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
            <XAxis dataKey={spec.xKey} tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={60} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, color: "#a1a1aa" }} />
            {spec.yKeys.map((key, i) => (
              <Bar key={key} dataKey={key} fill={colors[i % colors.length]} radius={[4, 4, 0, 0]} maxBarSize={44} />
            ))}
          </BarChart>
        );

      case "line":
        return (
          <LineChart data={spec.data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
            <XAxis dataKey={spec.xKey} tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={60} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, color: "#a1a1aa" }} />
            {spec.yKeys.map((key, i) => (
              <Line key={key} dataKey={key} stroke={colors[i % colors.length]} strokeWidth={2} dot={{ r: 3, fill: colors[i % colors.length] }} activeDot={{ r: 5 }} />
            ))}
          </LineChart>
        );

      case "area":
        return (
          <AreaChart data={spec.data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              {spec.yKeys.map((key, i) => (
                <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors[i % colors.length]} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={colors[i % colors.length]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
            <XAxis dataKey={spec.xKey} tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={60} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, color: "#a1a1aa" }} />
            {spec.yKeys.map((key, i) => (
              <Area key={key} dataKey={key} stroke={colors[i % colors.length]} strokeWidth={2} fill={`url(#grad-${key})`} />
            ))}
          </AreaChart>
        );

      case "scatter":
        return (
          <ScatterChart margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey={spec.xKey} tick={axisStyle} axisLine={false} tickLine={false} name={spec.xKey} />
            <YAxis dataKey={spec.yKeys[0]} tick={axisStyle} axisLine={false} tickLine={false} name={spec.yKeys[0]} width={60} />
            <Tooltip content={<CustomTooltip />} />
            <Scatter data={spec.data} fill={colors[0]}>
              {spec.data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Scatter>
          </ScatterChart>
        );

      case "pie":
        return (
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, color: "#a1a1aa" }} />
            <Pie
              data={spec.data}
              dataKey={spec.yKeys[0]}
              nameKey={spec.xKey}
              cx="50%"
              cy="50%"
              outerRadius={120}
              innerRadius={55}
              paddingAngle={3}
              strokeWidth={0}
            >
              {spec.data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden rounded-xl ring-1 ring-white/[0.06]"
    >
      {spec.title && (
        <div className="bg-white/[0.02] px-4 py-2.5">
          <h4 className="text-[12px] font-bold text-zinc-200">{spec.title}</h4>
        </div>
      )}
      <div className="px-2 py-4">
        <ResponsiveContainer width="100%" height={340}>
          {renderChart() || <div />}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
