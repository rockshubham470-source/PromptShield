from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from prometheus_fastapi_instrumentator import Instrumentator

from app.core.config import settings
from app.core.database import engine
from app.models import Base

from app.api import (
    auth,
    detections,
    stats,
    rules,
    applications,
    application_keys,
    telemetry,
)

# -----------------------------
# DB INIT
# -----------------------------
Base.metadata.create_all(bind=engine)

# -----------------------------
# APP INIT
# -----------------------------
app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    description="PromptShield Enterprise API",
)

# -----------------------------
# RATE LIMITING
# -----------------------------
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# -----------------------------
# CORS (IMPORTANT FIX)
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        # dev tunnel (optional)
        "https://51xkwxc6-3000.inc1.devtunnels.ms",

        # Vercel frontend (ADD YOUR REAL URL HERE)
        "https://prompt-shield-etdz.vercel.app",
        "https://prompt-shield-etdz-4phyz8i1t-rockshubham470-sources-projects.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# TRUSTED HOSTS (optional safety)
# -----------------------------
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=[
        "localhost",
        "127.0.0.1",
        "*.render.com",
        "*.vercel.app",
        "*.inc1.devtunnels.ms",
    ],
)

# -----------------------------
# METRICS
# -----------------------------
Instrumentator().instrument(app).expose(app)

# -----------------------------
# ROUTER SETUP
# -----------------------------
api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(detections.router)
api_router.include_router(stats.router)
api_router.include_router(rules.router)
api_router.include_router(applications.router)
api_router.include_router(application_keys.router)
api_router.include_router(telemetry.router)

app.include_router(api_router)

# -----------------------------
# HEALTH CHECK
# -----------------------------
@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": settings.api_version}

# -----------------------------
# ROOT
# -----------------------------
@app.get("/")
async def root():
    return {
        "message": "PromptShield API",
        "version": settings.api_version,
        "docs": "/docs",
        "health": "/health",
    }

# -----------------------------
# RUN (LOCAL ONLY)
# -----------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)