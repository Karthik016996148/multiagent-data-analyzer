import os
import json
import uuid
import asyncio
from typing import Dict, Any
from io import StringIO
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import pandas as pd

from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

load_dotenv(Path(__file__).resolve().parent.parent / ".env")
load_dotenv()

data_store: Dict[str, Dict[str, Any]] = {}
session_service = InMemorySessionService()

from agents.orchestrator import root_agent

runner = Runner(
    agent=root_agent,
    app_name="data_analyzer",
    session_service=session_service,
)

app = FastAPI(title="Multi-Agent Data Analyzer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    session_id: str


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    session_id = str(uuid.uuid4())
    content = await file.read()

    try:
        df = pd.read_csv(StringIO(content.decode("utf-8")))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid CSV: {str(e)}")

    schema_info = {
        "columns": list(df.columns),
        "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
        "shape": [int(df.shape[0]), int(df.shape[1])],
        "sample_rows": df.head(3).to_dict(orient="records"),
    }

    data_store[session_id] = {
        "filename": file.filename,
        "schema": schema_info,
        "raw_data": df.to_dict(orient="records"),
    }

    await session_service.create_session(
        app_name="data_analyzer",
        user_id="user",
        session_id=session_id,
        state={
            "data_schema": json.dumps(schema_info, indent=2),
            "raw_data": df.to_dict(orient="records"),
        },
    )

    return {
        "session_id": session_id,
        "filename": file.filename,
        "columns": schema_info["columns"],
        "rows": schema_info["shape"][0],
        "sample": schema_info["sample_rows"],
    }


@app.post("/chat")
async def chat(request: ChatRequest):
    if request.session_id not in data_store:
        raise HTTPException(
            status_code=404,
            detail="Session not found. Please upload data first.",
        )

    async def event_stream():
        try:
            content = types.Content(
                role="user",
                parts=[types.Part(text=request.message)],
            )

            current_agent = None

            async for event in runner.run_async(
                user_id="user",
                session_id=request.session_id,
                new_message=content,
            ):
                author = getattr(event, "author", None)
                if author and author != current_agent and author != "analysis_pipeline":
                    current_agent = author
                    yield f"data: {json.dumps({'type': 'agent_start', 'agent': current_agent})}\n\n"

                event_content = getattr(event, "content", None)
                if not event_content or not event_content.parts:
                    continue

                for part in event_content.parts:
                    # Handle function calls (tool invocations) - skip them
                    if hasattr(part, "function_call") and part.function_call:
                        continue
                    # Handle function responses (tool results)
                    if hasattr(part, "function_response") and part.function_response:
                        resp = part.function_response
                        result = getattr(resp, "response", None)
                        if result and isinstance(result, dict):
                            status = result.get("status", "")
                            if status == "error":
                                err_msg = result.get("message", "Unknown error")
                                yield f"data: {json.dumps({'type': 'agent_output', 'agent': current_agent, 'content': f'Error: {err_msg}'})}\n\n"
                        continue

                    text = getattr(part, "text", None)
                    if not text or not text.strip():
                        continue

                    text = text.strip()

                    # Route based on which agent produced the output
                    if current_agent == "visualizer":
                        try:
                            chart_data = json.loads(text)
                            yield f"data: {json.dumps({'type': 'chart', 'agent': current_agent, 'content': chart_data})}\n\n"
                            continue
                        except json.JSONDecodeError:
                            pass

                    if current_agent == "coder":
                        yield f"data: {json.dumps({'type': 'code', 'agent': current_agent, 'content': text})}\n\n"
                        continue

                    if current_agent == "summarizer":
                        yield f"data: {json.dumps({'type': 'summary', 'agent': current_agent, 'content': text})}\n\n"
                        continue

                    yield f"data: {json.dumps({'type': 'agent_output', 'agent': current_agent, 'content': text})}\n\n"

                await asyncio.sleep(0.01)

            yield f"data: {json.dumps({'type': 'done'})}\n\n"

        except Exception as e:
            import traceback
            traceback.print_exc()
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8001))
    print(f"\n  DataFlow AI backend starting on http://localhost:{port}\n")
    uvicorn.run(app, host="0.0.0.0", port=port)
