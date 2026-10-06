from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class AnalyzeRequest(BaseModel):
    input_type: str = Field(default="message", description="'message', 'screenshot', or 'url'")
    text: Optional[str] = Field(default="", description="Text to analyze (e.g. SMS, WhatsApp, or OCR output)")
    url: Optional[str] = Field(default=None, description="Optional URL to analyze")
    use_llm: Optional[bool] = Field(default=True, description="Whether to attempt LLM enhancement if key is available")

class UrlAnalyzeRequest(BaseModel):
    url: str

class IndicatorItem(BaseModel):
    title: str
    severity: str  # "HIGH", "MEDIUM", "LOW"
    evidence: str
    explanation: str

class ExtractedEntities(BaseModel):
    phone_numbers: List[str] = []
    urls: List[str] = []
    amounts: List[str] = []
    organizations: List[str] = []
    keywords: List[str] = []

class RiskBreakdown(BaseModel):
    urgency: int = 0
    financial_request: int = 0
    identity_request: int = 0
    suspicious_language: int = 0
    url_risk: int = 0

class UrlSecurityAnalysis(BaseModel):
    domain: str = ""
    protocol: str = "HTTPS"
    suspicious_patterns_count: int = 0
    risk: str = "LOW"
    findings: List[str] = []

class AnalyzeResponse(BaseModel):
    id: Optional[str] = None
    input_type: str
    input_text: str
    risk_score: int  # 0 to 100
    risk_level: str  # "HIGH", "MEDIUM", "LOW", "SAFE"
    category: str
    confidence: int  # percentage
    summary: str
    indicators: List[IndicatorItem]
    risk_breakdown: RiskBreakdown
    recommended_actions: List[str]
    safety_tips: List[str]
    extracted_entities: ExtractedEntities
    url_security: Optional[UrlSecurityAnalysis] = None
    analysis_engine: str  # "Hybrid AI (LLM + NLP Patterns)" or "Pattern & Heuristic AI Engine"
    created_at: Optional[str] = None

class HistoryItem(BaseModel):
    id: str
    input_type: str
    input_text: str
    risk_score: int
    risk_level: str
    category: str
    confidence: int
    summary: str
    indicators: List[IndicatorItem]
    risk_breakdown: RiskBreakdown
    recommended_actions: List[str]
    safety_tips: List[str]
    extracted_entities: ExtractedEntities
    url_security: Optional[UrlSecurityAnalysis] = None
    analysis_engine: str
    created_at: str
