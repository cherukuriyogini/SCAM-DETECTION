import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, UploadFile, File
from models.schemas import (
    AnalyzeRequest,
    AnalyzeResponse,
    UrlAnalyzeRequest,
    UrlSecurityAnalysis
)
from services.scam_detector import analyze_patterns
from services.url_analyzer import analyze_url_security
from services.ai_service import enhance_with_llm
from services.ocr_service import extract_text_from_image
from .history import add_history_entry

router = APIRouter(prefix="/api", tags=["Analysis"])

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_content(req: AnalyzeRequest):
    input_text = (req.text or "").strip()
    input_url = (req.url or "").strip() if req.url else None

    if not input_text and not input_url:
        raise HTTPException(status_code=400, detail="Please provide either message text, OCR content, or a URL to analyze.")

    # Run core pattern and heuristic analysis
    analysis_data = analyze_patterns(input_text, direct_url=input_url)

    # If LLM requested and available, attempt enhancement
    if req.use_llm and input_text:
        analysis_data = enhance_with_llm(analysis_data, input_text)

    # Attach metadata
    analysis_id = str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()

    response = AnalyzeResponse(
        id=analysis_id,
        input_type=req.input_type,
        input_text=input_text or input_url or "",
        risk_score=analysis_data["risk_score"],
        risk_level=analysis_data["risk_level"],
        category=analysis_data["category"],
        confidence=analysis_data["confidence"],
        summary=analysis_data["summary"],
        indicators=analysis_data["indicators"],
        risk_breakdown=analysis_data["risk_breakdown"],
        recommended_actions=analysis_data["recommended_actions"],
        safety_tips=analysis_data["safety_tips"],
        extracted_entities=analysis_data["extracted_entities"],
        url_security=analysis_data.get("url_security"),
        analysis_engine=analysis_data.get("analysis_engine", "Pattern & Heuristic AI Engine"),
        created_at=now_iso
    )

    # Automatically store into history store
    add_history_entry(response)

    return response

@router.post("/analyze-url")
async def analyze_url_endpoint(req: UrlAnalyzeRequest):
    url = (req.url or "").strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL cannot be empty.")
    
    result = analyze_url_security(url)
    return result

@router.post("/ocr")
async def perform_ocr(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files (PNG, JPG, JPEG, WebP) are supported.")
    
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="Image size exceeds the 10MB limit.")

    result = extract_text_from_image(contents, file.filename)
    return result
