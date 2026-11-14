from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import auth, comments, issues, projects


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Demo app: create the tables on startup instead of using migrations.
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="DevBoard API",
    description="Developer issue and project tracker — demo app for the Docker Sandboxes lab",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(issues.router)
app.include_router(comments.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
