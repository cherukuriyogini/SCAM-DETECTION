import os
import json
import requests
from typing import Dict, Any, Optional

def enhance_with_llm(base_analysis: Dict[str, Any], text: str) -> Dict[str, Any]:
    """
    Attempts to enhance the heuristic analysis with an OpenAI/Groq compatible LLM API.
    If no key is configured or an error occurs, cleanly returns the base heuristic analysis
    without falsely claiming LLM was used.
    """
    # Check for Groq or OpenAI credentials
    groq_api_key = os.getenv("GROQ_API_KEY")
    openai_api_key = os.getenv("OPENAI_API_KEY")

    api_key = groq_api_key or openai_api_key
    if not api_key:
        # No external LLM key provided; transparently keep heuristic engine label
        return base_analysis

    # Determine endpoint and model
    if groq_api_key:
        api_url = "https://api.groq.com/openai/v1/chat/completions"
        model_name = os.getenv("GROQ_ANALYSIS_MODEL", "openai/gpt-oss-120b")
    else:
        api_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1") + "/chat/completions"
        model_name = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "User-Agent": "ScamInvestigationAI/1.0"
    }

    prompt = f"""
You are an expert digital scam investigator and cybersecurity analyst.
Analyze the following user-submitted message or extracted text for digital scams, fraud, phishing, or social engineering:

--- USER CONTENT ---
{text}
--- END USER CONTENT ---

Baseline Heuristic Findings:
Category: {base_analysis.get('category')}
Risk Score: {base_analysis.get('risk_score')} / 100
Risk Level: {base_analysis.get('risk_level')}

Produce a refined, structured JSON output matching this schema:
{{
  "risk_score": <number 0-100>,
  "risk_level": "HIGH" | "MEDIUM" | "LOW" | "SAFE",
  "category": "Fake Job Scam" | "Investment Scam" | "Phishing" | "Impersonation" | "Payment Scam" | "Lottery/Prize Scam" | "AI-Generated/Social Engineering" | "Legitimate Content",
  "confidence": <number 50-99>,
  "summary": "<2-3 sentence plain English breakdown of why this was flagged>",
  "indicators": [
    {{
      "title": "<Indicator name>",
      "severity": "HIGH" | "MEDIUM" | "LOW",
      "evidence": "<exact quote from text>",
      "explanation": "<why this indicator indicates scam risk>"
    }}
  ],
  "recommended_actions": ["<action 1>", "<action 2>", "<action 3>", "<action 4>"],
  "safety_tips": ["<tip 1>", "<tip 2>"]
}}
Return ONLY raw valid JSON, no markdown codeblocks, no explanations outside the JSON.
"""

    payload = {
        "model": model_name,
        "messages": [
            {"role": "system", "content": "You are a cybersecurity scam detection engine that outputs valid JSON only."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.1,
        "max_tokens": 1000
    }

    try:
        response = requests.post(api_url, headers=headers, json=payload, timeout=6)
        if response.status_code == 200:
            data = response.json()
            raw_content = data["choices"][0]["message"]["content"].strip()
            # Clean markdown formatting if present
            if raw_content.startswith("```json"):
                raw_content = raw_content[7:]
            if raw_content.startswith("```"):
                raw_content = raw_content[3:]
            if raw_content.endswith("```"):
                raw_content = raw_content[:-3]
            
            parsed = json.loads(raw_content.strip())
            
            # Merge with base analysis preserving entities and breakdown
            base_analysis["risk_score"] = parsed.get("risk_score", base_analysis["risk_score"])
            base_analysis["risk_level"] = parsed.get("risk_level", base_analysis["risk_level"])
            base_analysis["category"] = parsed.get("category", base_analysis["category"])
            base_analysis["confidence"] = parsed.get("confidence", base_analysis["confidence"])
            base_analysis["summary"] = parsed.get("summary", base_analysis["summary"])
            if parsed.get("indicators"):
                base_analysis["indicators"] = parsed["indicators"]
            if parsed.get("recommended_actions"):
                base_analysis["recommended_actions"] = parsed["recommended_actions"]
            if parsed.get("safety_tips"):
                base_analysis["safety_tips"] = parsed["safety_tips"]
            
            base_analysis["analysis_engine"] = "Hybrid AI (LLM + NLP Patterns)"
            return base_analysis
        else:
            # Non-200 response; log and retain base analysis
            return base_analysis
    except Exception:
        # Fallback without disruption
        return base_analysis
