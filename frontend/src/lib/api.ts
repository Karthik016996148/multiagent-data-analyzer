import type { DatasetInfo, SSEEvent } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

export async function uploadFile(file: File): Promise<DatasetInfo> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Upload failed");
  }

  const data = await res.json();

  return {
    filename: data.filename,
    columns: data.columns,
    rows: data.rows,
    sample: data.sample,
    schema: JSON.stringify(data.schema),
    rawData: data.raw_data,
  };
}

export async function sendMessage(
  message: string,
  dataset: DatasetInfo,
  onEvent: (event: SSEEvent) => void
): Promise<void> {
  const formData = new FormData();
  formData.append("message", message);
  formData.append("csv_data", JSON.stringify(dataset.rawData));
  formData.append("schema", dataset.schema);

  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Chat request failed");
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response stream");

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data: ")) continue;

        const jsonStr = trimmed.slice(6);
        if (!jsonStr) continue;

        try {
          const event: SSEEvent = JSON.parse(jsonStr);
          onEvent(event);

          if (event.type === "done" || event.type === "error") {
            reader.cancel();
            return;
          }
        } catch {
          // skip malformed events
        }
      }
    }

    if (buffer.trim().startsWith("data: ")) {
      try {
        const event: SSEEvent = JSON.parse(buffer.trim().slice(6));
        onEvent(event);
      } catch {
        // skip
      }
    }
  } finally {
    reader.cancel().catch(() => {});
  }
}
