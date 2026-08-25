# Backend - Health-bridge AI

FastAPI backend for the Health-bridge AI preventive health coach.

## Directory Structure

```
backend/
├── app/
│   ├── api/          # API endpoints
│   │   └── routes/   # Route handlers (chat, profile, plans)
│   ├── core/
│   │   ├── rag/      # Embeddings, chunking, retrieval
│   │   ├── memory/   # Semantic memory manager
│   │   └── llm/      # LLM client wrappers
│   ├── agents/       # CrewAI agent definitions
│   │   └── tools/    # Agent tools
│   ├── models/       # Beanie/MongoDB models
│   ├── services/     # Business logic
│   └── config/       # Settings, database config
├── data/
│   └── guidelines/   # WHO & MoH documents
├── tests/            # Test suite
├── requirements.txt
└── .env.example
```

## Setup

```bash
# 1. Create a virtual environment
python -m venv venv

# 2. Activate the virtual environment
# For Windows Git Bash:
source venv/Scripts/activate
# For Windows PowerShell:
.\venv\Scripts\activate
# For macOS/Linux:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env
```

## Run Development Server

Ensure your virtual environment is activated, then run:

```bash
uvicorn app.main:app --reload
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/session` | Create chat session |
| POST | `/api/chat/message` | Send message |
| GET | `/api/profile` | Get health profile |
| PUT | `/api/profile` | Update profile |
| GET | `/api/plans/current` | Get current plan |
| POST | `/api/plans/feedback` | Submit feedback |
