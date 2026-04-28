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
    sessionId: data.session_id,
    filename: data.filename,
    columns: data.columns,
    rows: data.rows,
    sample: data.sample,
  };
}

export async function sendMessage(
  message: string,
  sessionId: string,
  onEvent: (event: SSEEvent) => void
): Promise<void> {
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, session_id: sessionId }),
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

          // Stop reading as soon as we get the done signal
          if (event.type === "done" || event.type === "error") {
            reader.cancel();
            return;
          }
        } catch {
          // skip malformed events
        }
      }
    }

    // Process any remaining buffer
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
