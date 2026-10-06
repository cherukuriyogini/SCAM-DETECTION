"""
ScamInvestigation AI — Unified Development & Demo Launcher
Starts both FastAPI backend (port 8000) and Vite React frontend (port 5173).
"""

import subprocess
import sys
import os
import time
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"
FRONTEND_DIR = ROOT_DIR / "frontend"

def main():
    print("=" * 65)
    print("  🛡  ScamInvestigation AI — Starting Application")
    print("     Detect. Explain. Protect.")
    print("=" * 65)

    # Start FastAPI Backend
    print("[1/2] Starting FastAPI Backend on http://localhost:8000...")
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000"],
        cwd=str(BACKEND_DIR)
    )

    # Start Vite Frontend
    print("[2/2] Starting React Vite Frontend on http://localhost:5173...")
    frontend_proc = subprocess.Popen(
        "npm run dev -- --host 127.0.0.1 --port 5173",
        shell=True,
        cwd=str(FRONTEND_DIR)
    )

    time.sleep(2)
    print("\n" + "=" * 65)
    print("  ✅ ScamInvestigation AI is LIVE and Running!")
    print("  🌐 Frontend URL:      http://localhost:5173")
    print("  📡 Backend API:       http://localhost:8000")
    print("  📚 API Documentation: http://localhost:8000/docs")
    print("  💓 Health Check:      http://localhost:8000/api/health")
    print("=" * 65)
    print("\nPress Ctrl+C to terminate both servers.\n")

    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nShutting down servers...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("Done.")

if __name__ == "__main__":
    main()
