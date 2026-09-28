from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.routes import health, chat, memory

app = FastAPI(
    title=settings.app_name,
    description="Incident Triage & Diagnostic Intelligence with Hindsight Persistent Memory",
    version="1.0.0"
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins if settings.cors_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Route Blueprints
app.include_router(health.router)
app.include_router(chat.router)
app.include_router(memory.router)

@app.get("/")
def root():
    return {
        "message": "OpsHindsight API is running.",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=settings.port, reload=True)
