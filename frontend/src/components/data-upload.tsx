"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { Upload, FileSpreadsheet, Table2, Loader2, ArrowRight } from "lucide-react";
import type { DatasetInfo } from "@/lib/types";
import clsx from "clsx";

interface DataUploadProps {
  onUpload: (file: File) => void;
  dataset: DatasetInfo | null;
  isLoading: boolean;
}

export function DataUpload({ onUpload, dataset, isLoading }: DataUploadProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) onUpload(accepted[0]);
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
    disabled: isLoading,
  });

  if (dataset) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full max-w-2xl"
      >
        <div className="glass-strong gradient-border rounded-2xl p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
              <FileSpreadsheet size={20} className="text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white">{dataset.filename}</p>
              <p className="text-xs text-zinc-500">
                {dataset.rows.toLocaleString()} rows &middot; {dataset.columns.length} columns
              </p>
            </div>
          </div>

          <div className="mb-5 flex flex-wrap gap-1.5">
            {dataset.columns.map((col) => (
              <span
                key={col}
                className="rounded-md bg-white/[0.04] px-2 py-1 text-[11px] font-medium text-zinc-400 ring-1 ring-white/[0.06]"
              >
                {col}
              </span>
            ))}
          </div>

          {dataset.sample.length > 0 && (
            <div className="overflow-hidden rounded-xl ring-1 ring-white/[0.06]">
              <div className="flex items-center gap-2 bg-white/[0.02] px-3 py-2">
                <Table2 size={11} className="text-zinc-500" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Preview
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-white/[0.04]">
                      {dataset.columns.slice(0, 6).map((col) => (
                        <th key={col} className="whitespace-nowrap px-3 py-2 font-semibold text-zinc-400">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dataset.sample.slice(0, 3).map((row, i) => (
                      <tr key={i} className="border-b border-white/[0.03] last:border-0">
                        {dataset.columns.slice(0, 6).map((col) => (
                          <td key={col} className="whitespace-nowrap px-3 py-2 text-zinc-500">
                            {String(row[col] ?? "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mx-auto w-full max-w-lg"
    >
      <div
        {...getRootProps()}
        className={clsx(
          "group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300",
          isDragActive
            ? "border-violet-400/50 bg-violet-500/5 shadow-2xl shadow-violet-500/10"
            : "border-white/[0.08] hover:border-violet-400/30 hover:bg-white/[0.01]",
          isLoading && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-5">
          <motion.div
            animate={isDragActive ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
            className={clsx(
              "flex h-16 w-16 items-center justify-center rounded-2xl transition-all",
              isDragActive ? "gradient-primary glow-violet" : "bg-white/[0.04] ring-1 ring-white/[0.06] group-hover:ring-violet-500/20"
            )}
          >
            {isLoading ? (
              <Loader2 size={26} className="animate-spin text-violet-400" />
            ) : (
              <Upload
                size={26}
                className={clsx(
                  "transition-colors",
                  isDragActive ? "text-white" : "text-zinc-500 group-hover:text-violet-400"
                )}
              />
            )}
          </motion.div>

          <div>
            <p className="text-sm font-semibold text-zinc-200">
              {isDragActive ? "Drop it here" : "Drop your CSV file here"}
            </p>
            <p className="mt-1.5 text-xs text-zinc-500">or click to browse files</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-md bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold text-zinc-500 ring-1 ring-white/[0.06]">
              .csv
            </span>
            <span className="text-[10px] text-zinc-600">Max 50MB</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-600">
        <ArrowRight size={11} />
        <span>Try with <code className="text-violet-400/80">data/sample_sales.csv</code></span>
      </div>
    </motion.div>
  );
}
