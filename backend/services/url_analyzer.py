import re
from urllib.parse import urlparse
from typing import Dict, Any, List

SUSPICIOUS_TLDS = {
    "xyz", "top", "work", "click", "buzz", "cam", "fit", "live", "rest", "tk", "ml", "ga", 
    "cf", "gq", "icu", "monster", "fun", "uno", "link", "party", "website", "space", "online"
}

SUSPICIOUS_PATH_KEYWORDS = [
    "login", "signin", "sign-in", "log-in", "verify", "verification", "kyc", "pan", "aadhaar",
    "secure", "banking", "update", "confirm", "claim", "reward", "bonus", "free", "gift",
    "winner", "lottery", "crypto", "telegram", "whatsapp", "payment", "pay", "checkout", "apk"
]

HIGH_PROFILE_BRANDS = [
    "sbi", "hdfc", "icici", "axis", "paytm", "phonepe", "gpay", "google", "apple", "paypal",
    "amazon", "netflix", "whatsapp", "telegram", "facebook", "instagram", "microsoft", "binance"
]

SHORTENER_DOMAINS = {
    "bit.ly", "tinyurl.com", "is.gd", "t.co", "cutt.ly", "rb.gy", "ow.ly", "v.gd", "shorturl.at"
}

def analyze_url_security(raw_url: str) -> Dict[str, Any]:
    url = raw_url.strip()
    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url

    findings: List[str] = []
    risk_score = 0

    try:
        parsed = urlparse(url)
        domain = parsed.hostname or parsed.netloc or ""
        scheme = parsed.scheme.lower()
        path = parsed.path.lower()
        query = parsed.query.lower()
    except Exception as e:
        return {
            "domain": raw_url,
            "protocol": "UNKNOWN",
            "suspicious_patterns_count": 1,
            "risk": "HIGH",
            "findings": [f"Malformed or unparseable URL structure: {str(e)}"],
            "risk_score": 75
        }

    # 1. Scheme Check
    if scheme == "http":
        findings.append("Insecure Protocol: URL uses unencrypted HTTP instead of HTTPS.")
        risk_score += 25
    elif scheme != "https":
        findings.append(f"Unusual URI Scheme: {scheme}:// detected.")
        risk_score += 35

    # 2. IP Address as Host
    ip_pattern = r"^(\d{1,3}\.){3}\d{1,3}$"
    if re.match(ip_pattern, domain):
        findings.append("Direct IP Host: The URL uses a numeric IP address instead of a registered domain name, common in phishing and malware hosting.")
        risk_score += 45

    # 3. URL Shorteners
    domain_lower = domain.lower()
    for shortener in SHORTENER_DOMAINS:
        if domain_lower == shortener or domain_lower.endswith("." + shortener):
            findings.append(f"URL Shortener ({shortener}): Masks the real destination server. Scammers frequently obscure destinations using shorteners.")
            risk_score += 25
            break

    # 4. Punycode / Homograph attacks
    if "xn--" in domain_lower:
        findings.append("Punycode Detected: Internationalized domain name (xn--) might be impersonating a legitimate brand using lookalike characters.")
        risk_score += 40

    # 5. Suspicious TLD
    domain_parts = domain_lower.split(".")
    if len(domain_parts) > 1:
        tld = domain_parts[-1]
        if tld in SUSPICIOUS_TLDS:
            findings.append(f"High-Risk TLD (.{tld}): This top-level domain has statistically elevated rates of abuse, spam, and fraud.")
            risk_score += 20

    # 6. Excessive Subdomains
    if len(domain_parts) >= 4:
        findings.append(f"Excessive Subdomains ({len(domain_parts)} parts): Attackers often prepend trusted brand names in subdomains to trick victims.")
        risk_score += 25

    # 7. Brand Spoofing in Domain or Subdomain
    matched_brands = []
    for brand in HIGH_PROFILE_BRANDS:
        # Check if brand appears in domain, but domain isn't the actual official domain
        if brand in domain_lower:
            # Check if it's the exact legitimate domain (e.g. google.com, sbi.co.in, paytm.com)
            official_domains = [f"{brand}.com", f"{brand}.co.in", f"{brand}.in", f"{brand}.org", f"{brand}.net"]
            is_legit = any(domain_lower == od or domain_lower.endswith("." + od) for od in official_domains)
            if not is_legit:
                matched_brands.append(brand)

    if matched_brands:
        findings.append(f"Brand Impersonation in Hostname: URL mentions brand names ({', '.join(matched_brands)}) outside of their verified official domains.")
        risk_score += 40

    # 8. Suspicious Path/Query Keywords
    found_keywords = []
    for kw in SUSPICIOUS_PATH_KEYWORDS:
        if kw in path or kw in query:
            found_keywords.append(kw)
    if found_keywords:
        findings.append(f"Credential/Financial Target in Path: Contains sensitive keywords ({', '.join(set(found_keywords[:5]))}).")
        risk_score += 20

    # 9. Special Characters / Obfuscation
    if "@" in raw_url:
        findings.append("Authentication credential separator '@' found in URL; this can be used to redirect victims to a different host.")
        risk_score += 40
    if "-" in domain_lower and domain_lower.count("-") >= 2:
        findings.append(f"Multiple Hyphens in Domain ({domain_lower}): Scammers frequently combine brand names with hyphens (e.g. sbi-bank-verify).")
        risk_score += 15

    # 10. APK download
    if path.endswith(".apk"):
        findings.append("Direct Android APK Download: Attempting to download an external app package directly, bypassing app stores.")
        risk_score += 50

    # Normalize score
    final_score = min(100, max(0, risk_score))
    
    if final_score >= 60:
        risk_level = "HIGH"
    elif final_score >= 25:
        risk_level = "MEDIUM"
    elif final_score > 0:
        risk_level = "LOW"
    else:
        risk_level = "SAFE"
        findings.append("Standard HTTPS protocol and conventional domain structure detected.")

    return {
        "domain": domain,
        "protocol": scheme.upper(),
        "suspicious_patterns_count": len([f for f in findings if not f.startswith("Standard")]),
        "risk": risk_level,
        "risk_score": final_score,
        "findings": findings
    }
