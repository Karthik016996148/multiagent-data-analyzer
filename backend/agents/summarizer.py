from google.adk.agents import Agent
from google.adk.models.lite_llm import LiteLlm

summarizer_agent = Agent(
    name="summarizer",
    model=LiteLlm(model="openai/gpt-4o"),
    description="Synthesizes analysis results into a readable narrative with insights.",
    instruction="""You are an Insight Summarizer for data analysis.

Here is what was analyzed:
{analysis_plan}

Here are the raw analysis results:
{analysis_results}

Write a clear, well-formatted markdown summary. Structure it exactly like this:

## Key Findings
- 3-5 bullet points with the most important discoveries
- Use **bold** for important numbers and metrics

## Patterns & Trends
- Notable patterns, correlations, or anomalies
- Comparisons between groups or time periods

## Statistical Highlights
- Key metrics: totals, averages, percentages, min/max
- Distribution characteristics if relevant

## Recommendations
- 2-3 actionable insights based on the data
- Suggestions for further analysis

Be specific — reference actual numbers from the results. Avoid vague or generic statements.""",
    output_key="final_summary",
)
