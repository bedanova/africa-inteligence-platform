from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse
from app.core.config import get_settings
from app.api.v1.router import router as v1_router

settings = get_settings()

app = FastAPI(
    title="Africa Intelligence Platform API",
    version="0.1.0",
    docs_url="/docs" if settings.environment != "production" else None,
    redoc_url="/redoc" if settings.environment != "production" else None,
    default_response_class=ORJSONResponse,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(v1_router)


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok", "version": "0.1.0", "environment": settings.environment}
