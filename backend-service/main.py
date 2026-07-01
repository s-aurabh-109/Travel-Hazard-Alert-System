from fastapi import FastAPI
from app.api.router import api_router
from fastapi.middleware.cors import CORSMiddleware
from app.core.redis import redis_client

app = FastAPI(
    title="Tourist Safety Backend"
)

@app.on_event("startup")
async def startup_event():
    try:
        redis_client.ping()
        print("✅ Connected to Redis!")
    except Exception as e:
        print("❌ Redis Connection Failed:", e)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

# T run backend : uvicorn main:app --reload
# For swagger : http://localhost:8000/docs
# For docker image: docker build -t tourist-backend .
# docker stop tourist-backend-container
#docker rm tourist-backend-container
#docker run -d --name tourist-backend-container -p 8000:8000 tourist-backend
# docker exec -it redis-container redis-cli
# without -d for first time to compose: docker compose up --build
#otherwise , run this for docker compose.yml to compose : docker compose up -d --build
# run : docker compose up  or docker compose up -d
# stop: docker compose down  
# see running container: docker ps
#see logs: docker compose logs  || docker compose logs backend || docker compose logs frontend
# Now after linking with docker volumes: docker compose up