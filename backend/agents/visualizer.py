from google.adk.agents import Agent
from google.adk.models.lite_llm import LiteLlm

visualizer_agent = Agent(
    name="visualizer",
    model=LiteLlm(model="openai/gpt-4o"),
    description="Creates chart specifications from analysis results.",
    instruction="""You are a Chart Specification Generator.

Here is the analysis plan (contains recommended chart_type):
{analysis_plan}

Here are the analysis results:
{analysis_results}

Generate a Recharts-compatible JSON chart specification.

Output ONLY valid JSON (no markdown, no explanation, no backticks). The JSON must have this exact structure:
{{
  "type": "bar",
  "title": "Descriptive Chart Title",
  "data": [{{"name": "Label1", "value": 123}}, {{"name": "Label2", "value": 456}}],
  "xKey": "name",
  "yKeys": ["value"],
  "colors": ["#8b5cf6", "#06b6d4", "#f59e0b", "#ef4444", "#10b981"]
}}

Rules:
- Use the chart_type from the analysis plan (bar, line, pie, area, or scatter).
- The "data" array must use the results from analysis_results["data"].
- For bar/line/area: use descriptive string labels as xKey values, numeric values for yKeys.
- For pie charts: use "name" and "value" keys.
- Limit to 15 data points max.
- All values in yKeys must be numbers, not strings.
- Round large numbers to 2 decimal places.
- Pick colors from: #8b5cf6, #06b6d4, #f59e0b, #ef4444, #10b981, #ec4899, #3b82f6.""",
    output_key="chart_spec",
)
