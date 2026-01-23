# Documentation - Health-bridge AI

## Architecture Documents

- See `implementation_plan.md` in the artifacts folder for detailed architecture
- See `task.md` for project task breakdown

## Key Design Decisions

### Multi-Agent Architecture

The system uses CrewAI for agent orchestration with 6 specialized agents:

1. Supervisor Agent - Routes and coordinates
2. Intake & Profile Agent - Collects user data
3. Risk & Guideline Agent - RAG-based risk assessment
4. Context & SDOH Agent - Social determinants of health
5. Habit Coach Agent - Generates 4-week plans
6. Safety & Policy Agent - Ensures safe responses

### RAG Design

- ChromaDB for vector storage
- Curated WHO + MoH guideline corpus
- Query rewriting for better retrieval
- Corrective RAG critic for accuracy

### Semantic Memory

- User-specific memories in ChromaDB
- Types: Profile, Constraints, Habit Plans, Outcomes
- Enables personalized follow-up sessions

### Safety

- No diagnosis or medication dosing
- Clear escalation for red flags
- Safety agent reviews all responses
