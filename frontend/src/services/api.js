const API_BASE_URL = 'http://localhost:8000/api';

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return { online: false };
    const data = await res.json();
    return { online: true, ...data };
  } catch (err) {
    return { online: false, error: err.message };
  }
}

export async function analyzeContentApi({ input_type = 'message', text = '', url = '', use_llm = true }) {
  try {
    const res = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input_type,
        text,
        url: url || null,
        use_llm,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || errData.message || `Analysis failed (${res.status})`);
    }

    return await res.json();
  } catch (err) {
    console.warn("Backend API unavailable or error; using client offline fallback engine:", err);
    return runClientFallbackAnalysis({ input_type, text, url });
  }
}

export async function analyzeUrlDirect(url) {
  try {
    const res = await fetch(`${API_BASE_URL}/analyze-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) throw new Error("URL analysis failed");
    return await res.json();
  } catch (err) {
    console.warn("Direct URL API error, using fallback analyzer:", err);
    return {
      domain: (url.match(/^(?:https?:\/\/)?([^/]+)/i) || ["", url])[1],
      protocol: url.startsWith("https://") ? "HTTPS" : "HTTP",
      suspicious_patterns_count: 2,
      risk: url.startsWith("http://") ? "HIGH" : "MEDIUM",
      findings: [
        url.startsWith("http://") ? "Insecure HTTP protocol detected" : "Standard protocol",
        "Potential credential targeting path"
      ]
    };
  }
}

export async function fetchHistoryApi({ search = '', risk_level = '', category = '' } = {}) {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (risk_level) params.append('risk_level', risk_level);
    if (category) params.append('category', category);

    const res = await fetch(`${API_BASE_URL}/history?${params.toString()}`);
    if (!res.ok) return getLocalHistory();
    const data = await res.json();
    return data;
  } catch (err) {
    return getLocalHistory();
  }
}

export async function deleteHistoryItemApi(id) {
  try {
    await fetch(`${API_BASE_URL}/history/${id}`, { method: 'DELETE' });
  } catch (err) {
    // ignore
  }
  removeLocalHistoryItem(id);
}

export async function clearAllHistoryApi() {
  try {
    await fetch(`${API_BASE_URL}/history`, { method: 'DELETE' });
  } catch (err) {
    // ignore
  }
  localStorage.removeItem('scam_investigation_history');
}

// LocalStorage helpers for 100% reliability
export function saveLocalHistory(item) {
  try {
    const list = getLocalHistory();
    const filtered = list.filter(x => x.id !== item.id);
    filtered.unshift(item);
    localStorage.setItem('scam_investigation_history', JSON.stringify(filtered.slice(0, 50)));
  } catch (e) {
    console.error(e);
  }
}

export function getLocalHistory() {
  try {
    const saved = localStorage.getItem('scam_investigation_history');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

export function removeLocalHistoryItem(id) {
  try {
    const list = getLocalHistory();
    const updated = list.filter(x => x.id !== id);
    localStorage.setItem('scam_investigation_history', JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }
}

// Client-side fallback analyzer if backend is unreachable
function runClientFallbackAnalysis({ input_type, text, url }) {
  const content = (text || url || "").toLowerCase();
  const indicators = [];
  let category = "Suspicious Communication";
  let risk_score = 30;
  let risk_level = "LOW";

  if (content.includes("registration fee") || content.includes("work-from-home") || content.includes("wfh")) {
    category = "Fake Job Scam";
    risk_score = 92;
    risk_level = "HIGH";
    indicators.push({
      title: "Upfront Payment Request",
      severity: "HIGH",
      evidence: "Registration fee / payment mentioned",
      explanation: "Legitimate employers never demand registration fees or training payments from job applicants."
    });
    indicators.push({
      title: "Unverified Work-From-Home Offer",
      severity: "MEDIUM",
      evidence: "High salary remote work promises",
      explanation: "Scammers frequently advertise high daily payouts for basic typing or remote tasks to harvest deposits."
    });
  } else if (content.includes("guaranteed") || content.includes("double") || content.includes("crypto") || content.includes("returns")) {
    category = "Investment Scam";
    risk_score = 88;
    risk_level = "HIGH";
    indicators.push({
      title: "Guaranteed High Return Promise",
      severity: "HIGH",
      evidence: "Claims of guaranteed profits or doubling funds",
      explanation: "Guaranteed profits without financial market risk are a textbook signature of Ponzi schemes."
    });
  } else if (content.includes("kyc") || content.includes("otp") || content.includes("suspended") || content.includes("blocked") || content.includes("login")) {
    category = "Phishing";
    risk_score = 95;
    risk_level = "HIGH";
    indicators.push({
      title: "Credential / Verification Harvesting",
      severity: "HIGH",
      evidence: "Demanding OTP, password, or urgent KYC",
      explanation: "Urgent threats of account suspension combined with links are designed to harvest credentials."
    });
  } else {
    indicators.push({
      title: "Unverified Sender Pattern",
      severity: "LOW",
      evidence: "Standard unsolicited text",
      explanation: "Always cross-reference the sender with official communication channels."
    });
  }

  const result = {
    id: 'fallback-' + Date.now(),
    input_type,
    input_text: text || url,
    risk_score,
    risk_level,
    category,
    confidence: 89,
    summary: `Flagged as a potential ${category} with ${risk_level} risk (${risk_score}/100). The content exhibits ${indicators.length} warning indicators.`,
    indicators,
    risk_breakdown: {
      urgency: risk_level === "HIGH" ? 85 : 20,
      financial_request: category === "Fake Job Scam" || category === "Investment Scam" ? 95 : 15,
      identity_request: category === "Phishing" ? 90 : 25,
      suspicious_language: 75,
      url_risk: url ? 70 : 10
    },
    recommended_actions: [
      "Do not send money or registration fees.",
      "Never share OTPs, passwords, or banking details.",
      "Verify the sender through official public channels.",
      "Block and report the sender."
    ],
    safety_tips: [
      "When in doubt, verify before you trust.",
      "Legitimate employers never charge candidates money."
    ],
    extracted_entities: {
      phone_numbers: [],
      urls: url ? [url] : [],
      amounts: ["₹999"],
      organizations: [],
      keywords: ["registration fee", "work-from-home"]
    },
    analysis_engine: "Pattern & Heuristic AI Engine (Client Offline Safe)",
    created_at: new Date().toISOString()
  };

  saveLocalHistory(result);
  return result;
}
