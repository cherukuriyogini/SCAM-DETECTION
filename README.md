# ScamInvestigation AI 🛡️
> **AI-Powered Protection Against Digital Scams**  
> *Detect. Explain. Protect.*

ScamInvestigation AI is an advanced, production-grade cybersecurity and fraud intelligence platform. It analyzes suspicious WhatsApp/SMS messages, screenshots, and URLs, deconstructs manipulative social engineering tactics, highlights specific trigger evidence, assigns a multi-dimensional risk score, and provides clear, actionable defensive protocols.

---

## 🌟 Why ScamInvestigation AI?
Most fraud detection tools return a simplistic, unhelpful binary verdict: `SAFE` or `SCAM`.  
**ScamInvestigation AI goes further:**
- **Deconstructs Threat Evidence**: Highlights exact quotes from the message (e.g. upfront registration fees, fake police threats, credential requests).
- **Explains the Psychology & Tactics**: Explains *why* the content is dangerous in plain, accessible language.
- **Calculates a Multi-Vector Risk Breakdown**: Scores urgency, financial demands, identity harvesting, social engineering, and URL risk separately.
- **Recommends Immediate Counter-Measures**: Clear, numbered steps to protect money, credentials, and digital identity.
- **Zero-Dependency Guarantee**: Contains an enterprise heuristic engine that runs 100% offline out-of-the-box, plus optional Groq/OpenAI LLM enhancement when configured.

---

## 🏗️ Architecture & Tech Stack

```text
User Input (Message / Screenshot / URL)
   │
   ├── Screenshot ───────► Tesseract.js / Backend OCR Engine
   │
   ├── URL Link ─────────► Zero-Visit Safe Security Sandbox
   │
   └── Text / Message ───► Heuristic NLP & Threat Pattern Engine
                                 │
                                 ▼ (Optional Hybrid LLM Enhancement)
                     Groq / OpenAI Llama-3 / GPT-OSS
                                 │
                                 ▼
                     Structured Scam Classification
                                 │
          ┌──────────────────────┼──────────────────────┐
          ▼                      ▼                      ▼
  Scam Risk Assessment    Forensic Evidence     Action Guidance
   (0-100 Score Dial)    (Why We Flagged This)   (Immediate Steps)
```

- **Frontend**: React 18, Vite, Tailwind CSS v4, Lucide React Icons, Tesseract.js
- **Backend**: Python 3.13, FastAPI, Pydantic, Uvicorn
- **Threat Intelligence**: Regex heuristics, NLP pattern detection, Brand spoofing detection, Zero-visit URL inspection
- **Persistence**: Dynamic local storage + PostgreSQL-ready REST API

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1-Click Startup
From the project root directory, run:
```bash
python run_app.py
```
*(On Windows, you can also double-click `start.bat`)*

Both services will start simultaneously:
- **Frontend Dashboard**: [http://localhost:5173](http://localhost:5173)
- **Backend API Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## ⚡ Manual Startup (Individual Terminals)

### Terminal 1: Backend
```bash
cd backend
python -m pip install -r requirements.txt   # or fastapi uvicorn pydantic python-multipart requests python-dotenv
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### Terminal 2: Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Environment Variables (Optional)

ScamInvestigation AI is engineered to work **100% reliably out of the box without any API keys**.  
If you want to enable external hybrid LLM enhancement, set the following in your environment or in `.env.local`:

```env
# Optional Groq API Key (OpenAI-compatible)
GROQ_API_KEY=gsk_...
GROQ_ANALYSIS_MODEL=openai/gpt-oss-120b

# Or OpenAI API Key
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

---

## 🏆 Hackathon Demo Flow (for Judges)

To demonstrate the full capability in under 2 minutes:

1. **Open the Application**: Navigate to [http://localhost:5173](http://localhost:5173).
2. **Review the Landing Hero**: Notice the cybersecurity dashboard aesthetic, real-time "AI Protection Active" indicator, and feature highlights (*Detect. Explain. Protect.*).
3. **Click a Demo Scenario**:
   - Click **"Fake Job Offer"** under *Try a Live Scam Demo*.
   - Watch the analyzer automatically pre-fill with realistic job fraud text.
4. **Click "Analyze for Scam"**:
   - Observe the step-by-step progress animation (*Checking scam indicators... Evaluating URL threat...*).
5. **Inspect the Forensic Result Dashboard**:
   - **Risk Gauge**: 98 / 100 🔴 HIGH RISK
   - **Category**: Fake Job Scam (95% Confidence)
   - **Why We Flagged This**: Notice 5 individual warning cards showing exact matched quotes (e.g. `Pay ₹999`, `registration fee`, `Send your Aadhaar`) paired with plain-language cybersecurity explanations.
   - **Risk Breakdown Bars**: Urgency (85%), Financial Request (95%), Identity Request (90%), Suspicious Language (80%).
   - **What Should I Do Now?**: Clear numbered defense steps (Never send money, never share OTP, verify officially).
   - **Extracted Entities**: Currency amounts (`₹45,000`, `₹999`) and keyword badges.
6. **Try URL Sandboxing**:
   - Switch to the **"Suspicious Link"** tab.
   - Enter `http://sbi-netbanking-verify.xyz/login`.
   - Click **Analyze for Scam** to view protocol warnings, unencrypted HTTP flags, high-risk `.xyz` TLD detection, and brand impersonation alerts — **without ever loading or opening the dangerous link**.
7. **Try Screenshot OCR**:
   - Upload any screenshot with suspicious text or vouchers to watch in-browser OCR transcribe and analyze it automatically.
8. **Check History & About**:
   - Click **History** in the top navigation to view the audit trail, filter by risk level, search, or reopen past scans.
   - Click **About** to inspect the architecture diagram and engineering blueprint.
