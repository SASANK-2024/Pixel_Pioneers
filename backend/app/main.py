from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.routes import health, chat, memory, meetings

app = FastAPI(
    title="Meeting Memory AI — Executive Preparation with Hindsight Memory",
    description="Evidence-backed meeting briefings, commitment tracking, and relationship memory powered by Hindsight.",
    version="2.0.0"
)

# Comprehensive CORS origins for local Vite dev ports (5173, 5174, 5175, etc.)
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Meeting Memory AI Routes (Primary)
app.include_router(meetings.router)

# Register Route Blueprints (Health & Diagnostics)
app.include_router(health.router)
app.include_router(chat.router)
app.include_router(memory.router)

@app.get("/")
def root():
    return {
        "product": "Meeting Memory AI",
        "description": "Pre-meeting executive briefings powered by Hindsight persistent memory.",
        "status": "operational",
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "contacts": "/api/contacts",
            "meetings": "/api/meetings",
            "prepare": "/api/meetings/{id}/prepare",
            "demo_reset": "/api/demo/reset"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=settings.port, reload=True)
