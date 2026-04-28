# DataFlow AI — Multi-Agent Data Analyzer

A production-ready multi-agent data analysis system built with **Google ADK**, **OpenAI GPT-4o**, and **Next.js**. Upload any CSV dataset, ask analytical questions in natural language, and watch as five specialized AI agents collaborate in real-time to deliver insights, code, visualizations, and summaries.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![Google ADK](https://img.shields.io/badge/Google_ADK-1.0+-4285F4?logo=google)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?logo=openai)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Architecture

```
                    ┌──────────────────────────────────────────────┐
                    │              Next.js Frontend                │
                    │        (Chat UI + Chart Rendering)           │
                    └────────────────┬─────────────────────────────┘
                                     │ SSE Stream
                    ┌────────────────▼─────────────────────────────┐
                    │           FastAPI Backend                     │
                    │         (ADK Runner + Session)                │
                    └────────────────┬─────────────────────────────┘
                                     │
              ┌──────────────────────▼──────────────────────┐
              │          SequentialAgent Pipeline            │
              │                                             │
              │  ┌─────────┐  ┌─────────┐  ┌──────────┐   │
              │  │ Planner ├──► Coder   ├──► Analyzer │   │
              │  └─────────┘  └─────────┘  └────┬─────┘   │
              │                                  │         │
              │            ┌─────────────┐  ┌────▼──────┐  │
              │            │ Summarizer  ◄──┤Visualizer │  │
              │            └─────────────┘  └───────────┘  │
              └────────────────────────────────────────────┘
```

### The Agent Pipeline

| Agent | Role | Input | Output |
|-------|------|-------|--------|
| **Planner** | Analyzes the question and data schema to create a structured analysis plan | User query + data schema | Analysis plan (JSON) |
| **Code Generator** | Writes pandas code to execute the planned analysis | Analysis plan | Python code |
| **Analyzer** | Executes the generated code against the actual dataset | Code + raw data | Analysis results |
| **Visualizer** | Creates chart specifications from the analysis results | Results + plan | Recharts-compatible JSON |
| **Summarizer** | Synthesizes all findings into a readable narrative | All prior outputs | Markdown summary |

---

## Features

- **Multi-Agent Orchestration** — Five specialized AI agents coordinated via Google ADK's `SequentialAgent`
- **Real-Time Streaming** — Watch agents think and produce output in real-time via SSE
- **Interactive Visualizations** — Auto-generated charts (bar, line, pie, area, scatter) rendered with Recharts
- **Natural Language Queries** — Ask questions about your data in plain English
- **CSV Upload** — Drag-and-drop any CSV file for instant analysis
- **Agent Activity Timeline** — Visual pipeline showing which agent is currently active
- **Dark Glassmorphism UI** — Stunning, modern interface with smooth animations
- **Sample Dataset** — Included sales dataset to try immediately

---

## Quick Start

### Prerequisites

- **Python 3.10+** with pip
- **Node.js 18+** with npm
- **OpenAI API Key** ([get one here](https://platform.openai.com/api-keys))

### 1. Clone and setup

```bash
git clone https://github.com/YOUR_USERNAME/multiagent-data-analyzer.git
cd multiagent-data-analyzer
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```
OPENAI_API_KEY=sk-your-key-here
```

### 3. Start the backend

```bash
cd backend
pip install -r requirements.txt
python server.py
```

The API server starts at `http://localhost:8000`.

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

### 5. Try it out

1. Upload the included sample dataset (`data/sample_sales.csv`) or your own CSV
2. Ask a question like:
   - *"What are the top 5 products by total revenue?"*
   - *"Show me monthly sales trends over time"*
   - *"Which region has the highest profit margin?"*
   - *"What's the correlation between quantity and revenue by category?"*
3. Watch the agents collaborate in real-time!

---

## Project Structure

```
multiagent/
├── backend/
│   ├── agents/
│   │   ├── orchestrator.py      # SequentialAgent pipeline
│   │   ├── planner.py           # Analysis planning agent
│   │   ├── coder.py             # Code generation agent
│   │   ├── analyzer.py          # Code execution agent
│   │   ├── visualizer.py        # Chart spec generation agent
│   │   └── summarizer.py        # Insight summarization agent
│   ├── server.py                # FastAPI server with SSE
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js App Router pages
│   │   ├── components/          # React UI components
│   │   ├── hooks/               # Custom React hooks
│   │   └── lib/                 # Types, API client, utilities
│   └── package.json
├── data/
│   └── sample_sales.csv         # Sample dataset
├── vercel.json                  # Vercel deployment config
└── README.md
```

---

## Deployment

### Frontend → Vercel

1. Push your repo to GitHub
2. Import the project in [Vercel](https://vercel.com/new)
3. Set the root directory to `frontend`
4. Add environment variable: `NEXT_PUBLIC_API_URL` = your backend URL
5. Deploy

### Backend → Any Python host

The FastAPI backend can be deployed to:

- **Railway** — `railway up` from the `backend/` directory
- **Render** — Connect repo, set build command to `pip install -r requirements.txt`, start command to `uvicorn server:app --host 0.0.0.0 --port $PORT`
- **Google Cloud Run** — `gcloud run deploy` with a Dockerfile
- **Vercel Python Runtime** — Place backend files in `api/` directory

Set the `OPENAI_API_KEY` environment variable on your chosen platform.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Agent Framework | Google ADK (Agent Development Kit) |
| LLM | OpenAI GPT-4o via LiteLLM |
| Backend | FastAPI, Python 3.10+ |
| Frontend | Next.js 15, React 19 |
| Styling | TailwindCSS, Framer Motion |
| Charts | Recharts |
| Streaming | Server-Sent Events (SSE) |

---

## License

MIT License — see [LICENSE](LICENSE) for details.
