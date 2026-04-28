import json
import numpy as np
import pandas as pd
from google.adk.agents import Agent
from google.adk.models.lite_llm import LiteLlm
from google.adk.tools.tool_context import ToolContext


def execute_analysis_code(tool_context: ToolContext) -> dict:
    """Executes the generated pandas code on the uploaded dataset."""
    code = tool_context.state.get("generated_code", "")
    raw_data = tool_context.state.get("raw_data", [])

    if not code or not raw_data:
        return {"status": "error", "message": "No code or data available"}

    try:
        df = pd.DataFrame(raw_data)

        # Strip markdown fences if the LLM included them
        clean_code = code.strip()
        for fence in ["```python", "```py", "```"]:
            if clean_code.startswith(fence):
                clean_code = clean_code[len(fence):]
                break
        if clean_code.endswith("```"):
            clean_code = clean_code[:-3]
        clean_code = clean_code.strip()

        namespace = {"df": df, "pd": pd, "np": np, "result": None}
        exec(clean_code, namespace)
        result = namespace.get("result")

        if result is None:
            return {"status": "error", "message": "Code did not produce a 'result' variable"}

        # Make everything JSON-serializable
        def make_serializable(obj):
            if isinstance(obj, pd.DataFrame):
                return obj.to_dict(orient="records")
            if isinstance(obj, pd.Series):
                return obj.to_dict()
            if isinstance(obj, (np.integer,)):
                return int(obj)
            if isinstance(obj, (np.floating,)):
                return float(obj)
            if isinstance(obj, np.ndarray):
                return obj.tolist()
            return obj

        if isinstance(result, dict):
            result = {k: make_serializable(v) for k, v in result.items()}
            if isinstance(result.get("summary_stats"), dict):
                result["summary_stats"] = {
                    k: make_serializable(v)
                    for k, v in result["summary_stats"].items()
                }

        serialized = json.dumps(result, default=str)
        tool_context.state["analysis_results"] = serialized
        return {
            "status": "success",
            "result_preview": serialized[:500],
        }
    except Exception as e:
        return {"status": "error", "message": f"Execution error: {str(e)}"}


analyzer_agent = Agent(
    name="analyzer",
    model=LiteLlm(model="openai/gpt-4o"),
    description="Executes the generated analysis code against the dataset.",
    instruction="""You are a Data Analysis Executor.

Your ONLY job is to call the `execute_analysis_code` tool. It takes no arguments — it reads everything it needs from internal state.

Call the tool immediately, then report exactly what happened:
- If status is "success", say: "Analysis executed successfully." followed by a brief description of the results.
- If status is "error", say: "Analysis failed:" followed by the error message.""",
    tools=[execute_analysis_code],
    output_key="analysis_output",
)
