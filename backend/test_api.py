import urllib.request
import json
import sys

# Force UTF-8 encoding on Windows console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

BASE_URL = "http://127.0.0.1:8000/api"

def test_health():
    req = urllib.request.Request(f"{BASE_URL}/health")
    with urllib.request.urlopen(req) as resp:
        assert resp.getcode() == 200
        data = json.loads(resp.read().decode())
        print("[PASS] Health check passed:", data["status"])

def test_analyze_fake_job():
    payload = {
        "input_type": "message",
        "text": "Congratulations! You have been selected for a remote data entry position with a salary of ₹45,000/month. To activate your employee account, pay a refundable registration fee of ₹999 immediately. Send your Aadhaar, PAN and bank details to complete verification.",
        "url": "",
        "use_llm": False
    }
    req = urllib.request.Request(
        f"{BASE_URL}/analyze",
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        assert resp.getcode() == 200
        data = json.loads(resp.read().decode())
        print("[PASS] Fake job analysis passed:")
        print("  - Risk Score:", data["risk_score"])
        print("  - Risk Level:", data["risk_level"])
        print("  - Category:", data["category"])
        print("  - Indicators Count:", len(data["indicators"]))
        print("  - Extracted Amounts:", data["extracted_entities"]["amounts"])
        assert data["risk_level"] == "HIGH"
        assert "Fake Job" in data["category"]
        assert len(data["indicators"]) >= 3
        return data["id"]

def test_analyze_safe_message():
    payload = {
        "input_type": "message",
        "text": "Hi Mom, I will be home around 6 PM today. Let me know if you need anything from the grocery store.",
        "url": "",
        "use_llm": False
    }
    req = urllib.request.Request(
        f"{BASE_URL}/analyze",
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        assert resp.getcode() == 200
        data = json.loads(resp.read().decode())
        print("[PASS] Safe message analysis passed:")
        print("  - Risk Level:", data["risk_level"])
        print("  - Risk Score:", data["risk_score"])
        assert data["risk_level"] in ["SAFE", "LOW"]

def test_analyze_url():
    payload = {"url": "http://sbi-netbanking-verify.xyz/login"}
    req = urllib.request.Request(
        f"{BASE_URL}/analyze-url",
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        assert resp.getcode() == 200
        data = json.loads(resp.read().decode())
        print("[PASS] URL security analysis passed:")
        print("  - Domain:", data["domain"])
        print("  - Risk:", data["risk"])
        print("  - Findings:", len(data["findings"]))
        assert data["risk"] == "HIGH"

def test_history(item_id):
    req = urllib.request.Request(f"{BASE_URL}/history")
    with urllib.request.urlopen(req) as resp:
        assert resp.getcode() == 200
        data = json.loads(resp.read().decode())
        print(f"[PASS] History check passed ({len(data)} items in store)")
        assert any(h["id"] == item_id for h in data)

if __name__ == "__main__":
    print("Running integration tests...")
    test_health()
    item_id = test_analyze_fake_job()
    test_analyze_safe_message()
    test_analyze_url()
    test_history(item_id)
    print("\nALL 5 INTEGRATION TESTS PASSED SUCCESSFULLY! [OK]")
