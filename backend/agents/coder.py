from google.adk.agents import Agent
from google.adk.models.lite_llm import LiteLlm

coder_agent = Agent(
    name="coder",
    model=LiteLlm(model="openai/gpt-4o"),
    description="Generates pandas code to execute the analysis plan.",
    instruction="""You are a Python Code Generator for data analysis.

Here is the analysis plan you must implement:
{analysis_plan}

Here is the dataset schema:
{data_schema}

Write pandas code that performs the planned analysis. CRITICAL RULES:
1. Output ONLY valid Python code — no markdown fences, no explanations, no triple backticks.
2. The DataFrame is already loaded as `df` — do NOT create or read it.
3. Only use `pandas` (as `pd`) and `numpy` (as `np`).
4. Store your final result in a variable called `result` — a dict with exactly two keys:
   - "data": the processed data as a list of dicts (use `.to_dict(orient="records")`)
   - "summary_stats": a dict of key statistics (totals, averages, counts, etc.)
5. Always call `.reset_index()` before `.to_dict(orient="records")`.
6. Handle NaN values with `.fillna(0)` or `.dropna()`.
7. Convert numpy types to Python natives: use `int()`, `float()`, or `.item()`.
8. Limit output to top 15 rows max using `.head(15)` or `.nlargest()`.

Example output format:
grouped = df.groupby("category")["revenue"].sum().reset_index().sort_values("revenue", ascending=False).head(10)
result = {{
    "data": grouped.to_dict(orient="records"),
    "summary_stats": {{
        "total_revenue": float(df["revenue"].sum()),
        "num_categories": int(df["category"].nunique()),
        "avg_revenue": float(df["revenue"].mean())
    }}
}}""",
    output_key="generated_code",
)
