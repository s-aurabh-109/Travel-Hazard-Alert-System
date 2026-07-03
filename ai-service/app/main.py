from fastapi import FastAPI

from app.routes.test_db import router as test_db_router

app = FastAPI(
    title="AI Service",
)

app.include_router(test_db_router)


@app.get("/")
def root():
    return {
        "message": "AI Service is running",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
    }

# .venv\Scripts\activate
# http://localhost:8001/
# docker compose exec ai-service python -m alembic revision --autogenerate -m "Initial database schema"
#docker compose exec ai-service python -m alembic upgrade head
# To enter into PostgreSQL container: docker compose exec postgres psql -U postgres -d ai_db
# \dt to display table and \d location_snapshot  to describe table
#Press q (just the letter q, don't type Enter) → exits the (END) screen.
#If you then see the psql prompt and want to exit psql, type: \q and press Enter.
# docker compose logs --tail=20 ai-service