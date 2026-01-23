# Health-bridge AI

A preventive health coach focused on hypertension and type 2 diabetes risk in low-resource African settings.

## Project Structure

```
HEALTH-BRIDGE/
├── backend/          # FastAPI Backend (Python)
│   ├── app/
│   │   ├── api/      # API routes
│   │   ├── core/     # RAG, Memory, LLM utilities
│   │   ├── agents/   # Multi-agent system (CrewAI)
│   │   ├── models/   # Database models
│   │   └── services/ # Business logic
│   └── data/         # Guidelines corpus
├── frontend/         # React Frontend (Vite)
│   └── src/
│       ├── components/
│       ├── features/
│       ├── pages/
│       └── services/
└── docs/             # Documentation
```

## Tech Stack

### Backend

- **Framework**: FastAPI (Python 3.11+)
- **Database**: MongoDB (Beanie ODM)
- **Vector DB**: ChromaDB
- **Agents**: CrewAI
- **Auth**: Firebase Admin SDK

### Frontend

- **Framework**: React 18 + Vite
- **Styling**: TailwindCSS
- **State**: Redux Toolkit
- **Auth**: Firebase

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Multi-Agent Architecture

| Agent | Purpose |
|-------|---------|
| **Supervisor** | Routes conversation, coordinates agents |
| **Intake & Profile** | Collects health data |
| **Risk & Guideline** | Estimates risk bands via RAG |
| **Context & SDOH** | Captures constraints |
| **Habit Coach** | Designs 4-week plans |
| **Safety & Policy** | Final safety review |
