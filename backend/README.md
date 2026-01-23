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
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
cp .env.example .env   # Configure environment
```

## Run Development Server

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
