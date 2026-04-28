from google.adk.agents import SequentialAgent

from .planner import planner_agent
from .coder import coder_agent
from .analyzer import analyzer_agent
from .visualizer import visualizer_agent
from .summarizer import summarizer_agent

analysis_pipeline = SequentialAgent(
    name="analysis_pipeline",
    description="End-to-end data analysis pipeline that plans, codes, executes, visualizes, and summarizes.",
    sub_agents=[
        planner_agent,
        coder_agent,
        analyzer_agent,
        visualizer_agent,
        summarizer_agent,
    ],
)

root_agent = analysis_pipeline
