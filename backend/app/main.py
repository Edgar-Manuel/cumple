"""Aplicación principal FastAPI"""
import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from starlette.responses import JSONResponse
from app.config import settings
from app.database import Base, engine
from app.limiter import limiter
from app.routers import auth, contacts, events, gifts, ai

# Inicializar tablas solo si no hay migraciones configuradas
# En producción, usar: alembic upgrade head
if not os.getenv("SKIP_DB_INIT"):
    Base.metadata.create_all(bind=engine)

# Crear aplicación
app = FastAPI(
    title="CUMPLE API",
    description="API para la plataforma CUMPLE de gestión de cumpleaños",
    version="1.0.0",
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach rate limiter
app.state.limiter = limiter

# Manejar errores de rate limiting
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Demasiadas solicitudes. Intenta de nuevo más tarde."},
    )

# Registrar routers
app.include_router(auth.router)
app.include_router(contacts.router)
app.include_router(events.router)
app.include_router(gifts.router)
app.include_router(ai.router)

@app.get("/")
def read_root():
    """Endpoint raíz"""
    return {
        "message": "CUMPLE API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }

@app.get("/health")
def health_check():
    """Health check"""
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
    )
