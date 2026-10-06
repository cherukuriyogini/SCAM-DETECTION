import re
from typing import Dict, Any, List, Tuple
from .url_analyzer import analyze_url_security

# Regex patterns for Entity Extraction
PHONE_REGEX = re.compile(r'(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}\b')
URL_REGEX = re.compile(r'https?://[^\s<>"]+|www\.[^\s<>"]+|[a-zA-Z0-9.-]+\.(?:com|org|net|xyz|top|in|co|io|app|live|tk|ga|cf|ml)[^\s<>"]*')
AMOUNT_REGEX = re.compile(r'(?:[₹$€£]|Rs\.?|INR|USD|EUR)\s?[\d,]+(?:\.\d{1,2})?|\b[\d,]+(?:\.\d{1,2})?\s?(?:rupees|inr|dollars|usdt|bucks)\b', re.IGNORECASE)

KNOWN_ORGS = [
    "State Bank of India", "SBI", "HDFC Bank", "HDFC", "ICICI Bank", "ICICI", "Axis Bank",
    "Paytm", "PhonePe", "Google Pay", "GPay", "PayPal", "Amazon", "Netflix", "WhatsApp",
    "Telegram", "FedEx", "DHL", "India Post", "Income Tax Department", "CBI", "Mumbai Police",
    "Delhi Police", "Reserve Bank of India", "RBI", "Kaun Banega Crorepati", "KBC",
    "Microsoft Support", "Apple Support"
]

def extract_entities(text: str) -> Dict[str, List[str]]:
    phones = set()
    for m in PHONE_REGEX.finditer(text):
        cleaned = m.group().strip()
        # Filter out numbers that are too short to be real phones
        digits_only = re.sub(r'\D', '', cleaned)
        if len(digits_only) >= 10:
            phones.add(cleaned)

    urls = set()
    for m in URL_REGEX.finditer(text):
        u = m.group().strip().rstrip('.,;:)')
        urls.add(u)

    amounts = set()
    for m in AMOUNT_REGEX.finditer(text):
        amounts.add(m.group().strip())

    found_orgs = set()
    text_lower = text.lower()
    for org in KNOWN_ORGS:
        # Match whole word
        pattern = r'\b' + re.escape(org.lower()) + r'\b'
        if re.search(pattern, text_lower):
            found_orgs.add(org)

    return {
        "phone_numbers": sorted(list(phones)),
        "urls": sorted(list(urls)),
        "amounts": sorted(list(amounts)),
        "organizations": sorted(list(found_orgs))
    }

def analyze_patterns(text: str, direct_url: str = None) -> Dict[str, Any]:
    text_clean = text or ""
    text_lower = text_clean.lower()
    
    indicators: List[Dict[str, str]] = []
    category_scores: Dict[str, int] = {
        "Fake Job Scam": 0,
        "Investment Scam": 0,
        "Phishing": 0,
        "Impersonation": 0,
        "Payment Scam": 0,
        "Lottery/Prize Scam": 0,
        "AI-Generated/Social Engineering": 0
    }

    # Breakdown metrics (0 - 100)
    urgency_score = 0
    financial_score = 0
    identity_score = 0
    language_score = 0
    url_risk_score = 0
    detected_keywords: List[str] = []

    # 1. Fake Job Scam Patterns
    job_patterns = [
        (r'\b(registration fee|joining fee|training fee|processing fee|security deposit|refundable fee)\b',
         "Upfront Payment for Employment", "HIGH",
         "Legitimate employers never demand registration fees, training charges, or security deposits from job applicants."),
        (r'\b(work[\s-]from[\s-]home|part[\s-]time job|remote job|data entry|typing work|online job)\b',
         "Unrealistic Job / WFH Offer", "MEDIUM",
         "Common lures for task fraud, remote data entry scams, and click-farming operations."),
        (r'\b(daily salary|earn \d+ (?:daily|per day)|salary of ₹?\d+|guaranteed income)\b',
         "Guaranteed High Earnings Without Interview", "HIGH",
         "Promising guaranteed daily payouts or disproportionate salaries without proper interviews or qualification screening."),
        (r'\b(selected for (?:a|the) job|hired immediately|urgent joining|no experience required)\b',
         "Instant Unverified Selection", "MEDIUM",
         "Scammers offer instantaneous hiring without standard background checks or interview rounds.")
    ]

    for pat, title, severity, explanation in job_patterns:
        m = re.search(pat, text_lower)
        if m:
            category_scores["Fake Job Scam"] += 35
            match_text = text_clean[m.start():m.end()]
            indicators.append({
                "title": title,
                "severity": severity,
                "evidence": f'"{match_text}"',
                "explanation": explanation
            })
            detected_keywords.append(m.group(0))
            if severity == "HIGH":
                financial_score = max(financial_score, 85)

    # 2. Investment Scam Patterns
    invest_patterns = [
        (r'\b(guaranteed returns?|guaranteed profit|double your money|100% risk free|daily profit)\b',
         "Guaranteed High Returns", "HIGH",
         "No legitimate financial investment can legally or practically guarantee 100% risk-free profits or doubled returns."),
        (r'\b(crypto|bitcoin|usdt|forex trading|binary trading|trading bot|mining pool)\b',
         "High-Risk Crypto / Forex Scheme", "MEDIUM",
         "Fraudulent investment schemes frequently leverage cryptocurrency or binary trading buzzwords to solicit deposits."),
        (r'\b(limited[- ]time investment|exclusive opportunity|slots? filling fast|vip group)\b',
         "Artificial Scarcity in Investment", "MEDIUM",
         "Inducing FOMO (fear of missing out) to rush victims into transferring money before verifying the credentials.")
    ]

    for pat, title, severity, explanation in invest_patterns:
        m = re.search(pat, text_lower)
        if m:
            category_scores["Investment Scam"] += 35
            match_text = text_clean[m.start():m.end()]
            indicators.append({
                "title": title,
                "severity": severity,
                "evidence": f'"{match_text}"',
                "explanation": explanation
            })
            detected_keywords.append(m.group(0))
            financial_score = max(financial_score, 90)

    # 3. Phishing / Credential Harvesting
    phish_patterns = [
        (r'\b(enter your (?:otp|password|pin|cvv)|share (?:the )?otp|do not share your otp with anyone but)\b',
         "Direct Credential / OTP Solicitation", "HIGH",
         "Official financial institutions will never instruct you to share an OTP, password, or security PIN via text or chat."),
        (r'\b(account (?:suspended|blocked|locked|deactivated)|pan (?:card )?(?:expired|blocked)|kyc (?:expired|suspended|pending|update))\b',
         "Account Suspension / KYC Coercion", "HIGH",
         "Scammers manufacture panic by threatening that your bank account, SIM card, or PAN will be immediately blocked."),
        (r'\b(click here to (?:verify|login|update|activate)|log\s?in to your account|update your kyc)\b',
         "Suspicious Verification Link", "HIGH",
         "Unsolicited messages urging you to click a link to perform sensitive verification or login are a prime phishing tactic.")
    ]

    for pat, title, severity, explanation in phish_patterns:
        m = re.search(pat, text_lower)
        if m:
            category_scores["Phishing"] += 35
            match_text = text_clean[m.start():m.end()]
            indicators.append({
                "title": title,
                "severity": severity,
                "evidence": f'"{match_text}"',
                "explanation": explanation
            })
            detected_keywords.append(m.group(0))
            identity_score = max(identity_score, 90)

    # 4. Impersonation
    impersonate_patterns = [
        (r'\b(income tax|customs department|mumbai police|delhi police|cbi|rbi|cyber crime branch|narcotics)\b',
         "Government / Law Enforcement Impersonation", "HIGH",
         "Impersonating law enforcement or tax authorities to intimidate citizens with bogus warrants or tax evasion claims."),
        (r'\b(parcel (?:seized|held|confiscated)|illegal package|drugs found in parcel|customs duty)\b',
         "Courier / Parcel Scam", "HIGH",
         "Scammers falsely claim a courier contains illegal items to extract 'clearance fees' or digital arrest payments."),
        (r'\b(bank manager|customer support executive|fraud prevention team)\b',
         "Authority / Executive Impersonation", "MEDIUM",
         "Pretending to hold managerial authority to compel uncritical compliance.")
    ]

    for pat, title, severity, explanation in impersonate_patterns:
        m = re.search(pat, text_lower)
        if m:
            category_scores["Impersonation"] += 35
            match_text = text_clean[m.start():m.end()]
            indicators.append({
                "title": title,
                "severity": severity,
                "evidence": f'"{match_text}"',
                "explanation": explanation
            })
            detected_keywords.append(m.group(0))
            language_score = max(language_score, 80)

    # 5. Payment & UPI Scams
    payment_patterns = [
        (r'\b(scan (?:this )?qr|scan qr code to receive|enter (?:upi )?pin to receive (?:money|payment))\b',
         "Reverse Payment / QR Code Trap", "HIGH",
         "You NEVER need to enter your UPI PIN or scan a QR code to receive money. PIN is strictly required only to SEND money."),
        (r'\b(pay (?:₹|\$|rs\.?|inr)?\s?[\d,]+|send (?:money|payment)|advance payment|refund fee)\b',
         "Direct Financial Transfer Request", "HIGH",
         "Direct request for advance financial remittance without formal contractual verification."),
        (r'\b(overpaid|mistakenly sent|refund immediately|reverse transaction)\b',
         "Refund / Overpayment Deception", "HIGH",
         "Scammers show fake credit screenshots and demand that you 'return' funds that were never actually deposited.")
    ]

    for pat, title, severity, explanation in payment_patterns:
        m = re.search(pat, text_lower)
        if m:
            category_scores["Payment Scam"] += 35
            match_text = text_clean[m.start():m.end()]
            indicators.append({
                "title": title,
                "severity": severity,
                "evidence": f'"{match_text}"',
                "explanation": explanation
            })
            detected_keywords.append(m.group(0))
            financial_score = max(financial_score, 95)

    # 6. Lottery & Prize Scam
    lottery_patterns = [
        (r'\b(congratulations|you have won|lottery winner|lucky draw|selected winner|cash prize)\b',
         "Unsolicited Lottery / Prize Claim", "HIGH",
         "Claims that you won a lottery or lucky draw you never entered are classic fee-advance scam vectors."),
        (r'\b(kbc lottery|cheque of ₹?\d+|claim your (?:gift|reward|car|prize))\b',
         "Bogus Contest Reward", "HIGH",
         "Exploiting popular TV shows (e.g. KBC) or brand promotions to lure users into paying clearance fees.")
    ]

    for pat, title, severity, explanation in lottery_patterns:
        m = re.search(pat, text_lower)
        if m:
            category_scores["Lottery/Prize Scam"] += 40
            match_text = text_clean[m.start():m.end()]
            indicators.append({
                "title": title,
                "severity": severity,
                "evidence": f'"{match_text}"',
                "explanation": explanation
            })
            detected_keywords.append(m.group(0))
            financial_score = max(financial_score, 80)

    # 7. Urgency & Social Engineering Tactics
    urgency_patterns = [
        (r'\b(immediately|urgent|within (?:24|12|2|1) hours?|today only|expires today|act now|last chance)\b',
         "Manufactured Urgency", "MEDIUM",
         "Scammers intentionally generate time pressure to short-circuit critical thinking and prevent independent verification."),
        (r'\b(arrest warrant|police complaint|legal action|fir registered|court summon)\b',
         "Fear-Inducing Legal Threats", "HIGH",
         "Fabricated threats of prosecution, arrest, or penalties designed to coerce desperate compliance."),
        (r'\b(send your (?:aadhaar|pan|bank details|card details|identity proof))\b',
         "Sensitive Personal Identity Request", "HIGH",
         "Demanding sensitive government identity cards (Aadhaar/PAN) or banking records enables identity theft and loan fraud.")
    ]

    for pat, title, severity, explanation in urgency_patterns:
        m = re.search(pat, text_lower)
        if m:
            category_scores["AI-Generated/Social Engineering"] += 25
            match_text = text_clean[m.start():m.end()]
            indicators.append({
                "title": title,
                "severity": severity,
                "evidence": f'"{match_text}"',
                "explanation": explanation
            })
            detected_keywords.append(m.group(0))
            urgency_score = max(urgency_score, 85)
            if "aadhaar" in text_lower or "bank details" in text_lower or "pan" in text_lower:
                identity_score = max(identity_score, 90)

    # Entity extraction
    entities = extract_entities(text_clean)
    if direct_url:
        entities["urls"].append(direct_url)
    entities["keywords"] = list(set(detected_keywords))

    # URL Security Analysis
    url_security_result = None
    urls_to_test = list(set(entities["urls"]))
    if direct_url and direct_url not in urls_to_test:
        urls_to_test.insert(0, direct_url)

    if urls_to_test:
        target_url = urls_to_test[0]
        url_security_result = analyze_url_security(target_url)
        url_risk_score = url_security_result["risk_score"]
        
        if url_security_result["risk"] in ["HIGH", "MEDIUM"]:
            category_scores["Phishing"] += 20
            indicators.append({
                "title": f"Suspicious URL Detected: {url_security_result['domain']}",
                "severity": "HIGH" if url_security_result["risk"] == "HIGH" else "MEDIUM",
                "evidence": f'"{target_url}"',
                "explanation": " ; ".join(url_security_result["findings"][:2])
            })

    # Adjust breakdown scores if indicators exist
    if not indicators:
        risk_score = 5
        risk_level = "SAFE"
        category = "Legitimate Content"
        confidence = 94
        summary = "No recognized scam patterns, high-pressure urgency tactics, or malicious URL signatures were detected in this content."
    else:
        # Determine highest scoring category
        best_cat = max(category_scores.items(), key=lambda x: x[1])
        if best_cat[1] == 0:
            category = "Suspicious Communication"
        else:
            category = best_cat[0]

        # Calculate composite risk score (0 - 100)
        high_count = sum(1 for i in indicators if i["severity"] == "HIGH")
        med_count = sum(1 for i in indicators if i["severity"] == "MEDIUM")
        
        computed_score = (high_count * 28) + (med_count * 14) + int(url_risk_score * 0.25)
        risk_score = min(98, max(45 if high_count > 0 else 25, computed_score))
        
        if risk_score >= 65:
            risk_level = "HIGH"
        elif risk_score >= 35:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        confidence = min(98, 75 + (len(indicators) * 4))

        # Dynamic breakdown values
        urgency_score = urgency_score or (75 if "urgency" in str(indicators).lower() else 20)
        financial_score = financial_score or (85 if any("fee" in str(i).lower() or "pay" in str(i).lower() for i in indicators) else 15)
        identity_score = identity_score or (70 if any("aadhaar" in str(i).lower() or "pan" in str(i).lower() or "otp" in str(i).lower() for i in indicators) else 10)
        language_score = language_score or (80 if len(indicators) >= 2 else 35)

        summary = f"Flagged as a potential {category} with {risk_level} risk ({risk_score}/100). The content exhibits {len(indicators)} prominent threat indicators including {indicators[0]['title'].lower()}."

    # Standard recommendations and safety tips
    recommended_actions = [
        "Do not send money, advance deposits, or registration fees.",
        "Do not share OTPs, UPI PINs, passwords, or banking credentials.",
        "Do not click on unverified links or download unexpected files.",
        "Independently verify the organization using their official, verified website or public telephone directory.",
        "Block and report the sender's account on WhatsApp/SMS."
    ]

    safety_tips = [
        "When in doubt, verify before you trust.",
        "No genuine company charges an application or training fee for employment.",
        "Banks will never ask for your full card number, CVV, or OTP over chat.",
        "You never need to enter a UPI PIN to receive incoming money."
    ]

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "category": category,
        "confidence": confidence,
        "summary": summary,
        "indicators": indicators,
        "risk_breakdown": {
            "urgency": urgency_score,
            "financial_request": financial_score,
            "identity_request": identity_score,
            "suspicious_language": language_score,
            "url_risk": url_risk_score
        },
        "recommended_actions": recommended_actions,
        "safety_tips": safety_tips,
        "extracted_entities": entities,
        "url_security": url_security_result,
        "analysis_engine": "Pattern & Heuristic AI Engine"
    }
