from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from models.schemas import AnalyzeResponse, HistoryItem

router = APIRouter(prefix="/api/history", tags=["History"])

# In-memory history cache, easily swappable with PostgreSQL or SQLite
_history_store: List[HistoryItem] = []

def add_history_entry(item: AnalyzeResponse) -> HistoryItem:
    history_obj = HistoryItem(
        id=item.id,
        input_type=item.input_type,
        input_text=item.input_text,
        risk_score=item.risk_score,
        risk_level=item.risk_level,
        category=item.category,
        confidence=item.confidence,
        summary=item.summary,
        indicators=item.indicators,
        risk_breakdown=item.risk_breakdown,
        recommended_actions=item.recommended_actions,
        safety_tips=item.safety_tips,
        extracted_entities=item.extracted_entities,
        url_security=item.url_security,
        analysis_engine=item.analysis_engine,
        created_at=item.created_at
    )
    # Insert at top of list
    _history_store.insert(0, history_obj)
    # Keep last 100 entries in memory
    if len(_history_store) > 100:
        _history_store.pop()
    return history_obj

@router.get("", response_model=List[HistoryItem])
async def get_history(
    search: Optional[str] = Query(None, description="Search keyword in text or summary"),
    risk_level: Optional[str] = Query(None, description="Filter by HIGH, MEDIUM, LOW, SAFE"),
    category: Optional[str] = Query(None, description="Filter by scam category")
):
    results = _history_store
    if risk_level:
        results = [h for h in results if h.risk_level.upper() == risk_level.upper()]
    if category:
        results = [h for h in results if category.lower() in h.category.lower()]
    if search:
        s = search.lower()
        results = [
            h for h in results 
            if s in h.input_text.lower() or s in h.summary.lower() or s in h.category.lower()
        ]
    return results

@router.delete("/{item_id}")
async def delete_history_item(item_id: str):
    global _history_store
    initial_len = len(_history_store)
    _history_store = [h for h in _history_store if h.id != item_id]
    if len(_history_store) == initial_len:
        raise HTTPException(status_code=404, detail="History entry not found.")
    return {"success": True, "message": f"Deleted analysis {item_id}"}

@router.delete("")
async def clear_all_history():
    global _history_store
    _history_store = []
    return {"success": True, "message": "All history cleared."}
