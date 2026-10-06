import io
from typing import Dict, Any

def extract_text_from_image(image_bytes: bytes, filename: str = "") -> Dict[str, Any]:
    """
    Extracts text from image bytes using pytesseract or PIL if available.
    If OCR engine is not installed, gracefully returns an informative fallback message.
    """
    try:
        from PIL import Image
        import pytesseract
        
        image = Image.open(io.BytesIO(image_bytes))
        text = pytesseract.image_to_string(image)
        cleaned_text = text.strip()
        if cleaned_text:
            return {
                "success": True,
                "text": cleaned_text,
                "message": f"Successfully extracted {len(cleaned_text)} characters from screenshot."
            }
        else:
            return {
                "success": True,
                "text": "",
                "message": "No readable text detected in the image."
            }
    except ImportError:
        return {
            "success": False,
            "text": "",
            "message": "Screenshot text extraction unavailable — please paste the message manually or utilize in-browser OCR."
        }
    except Exception as e:
        return {
            "success": False,
            "text": "",
            "message": f"Screenshot text extraction unavailable ({str(e)}) — please paste the message manually."
        }
