import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Add current directory to path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

# Load .env file if available
load_dotenv(dotenv_path=BASE_DIR / ".env")
load_dotenv(dotenv_path=BASE_DIR.parent / ".env.local")

from routes.analyze import router as analyze_router
from routes.history import router as history_router

app = FastAPI(
    title="ScamInvestigation AI API",
    description="Backend API for AI-powered scam detection, explanation, and threat mitigation.",
    version="1.0.0"
)

# Enable CORS for React Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global error handler so no raw unhandled traces leak
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred during security analysis. Please try again or simplify the input.",
            "detail": str(exc) if os.getenv("ENVIRONMENT") == "development" else "Security engine operational safeguard."
        }
    )

# Include Routers
app.include_router(analyze_router)
app.include_router(history_router)

@app.get("/api/health")
async def health_check():
    has_groq = bool(os.getenv("GROQ_API_KEY"))
    has_openai = bool(os.getenv("OPENAI_API_KEY"))
    
    return {
        "status": "online",
        "service": "ScamInvestigation AI Engine",
        "version": "1.0.0",
        "active_capabilities": {
            "heuristic_nlp": True,
            "url_reputation_analyzer": True,
            "entity_extractor": True,
            "llm_enrichment_enabled": has_groq or has_openai,
            "llm_provider": "Groq (OpenAI-compatible)" if has_groq else ("OpenAI" if has_openai else "None (Using Heuristic Rules)")
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
