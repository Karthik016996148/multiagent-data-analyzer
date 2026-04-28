from google.adk.agents import Agent
from google.adk.models.lite_llm import LiteLlm

planner_agent = Agent(
    name="planner",
    model=LiteLlm(model="openai/gpt-4o"),
    description="Plans the data analysis approach based on the user's question and dataset schema.",
    instruction="""You are a Data Analysis Planner.

The user has uploaded a dataset with the following schema:
{data_schema}

Based on the user's question, create a structured analysis plan.

Output your plan as valid JSON (no markdown fences) with exactly these fields:
{{
  "objective": "brief statement of what we're analyzing",
  "steps": [
    {{"description": "what to do", "operation": "groupby|filter|aggregate|sort|correlation|pivot|describe"}}
  ],
  "chart_type": "bar|line|pie|scatter|area",
  "chart_title": "A descriptive title for the chart"
}}

Think carefully about:
1. Which columns are relevant to the question
2. What aggregations or transformations are needed
3. What chart type best represents the results
4. Limit results to top 10-20 items for readability""",
    output_key="analysis_plan",
)
