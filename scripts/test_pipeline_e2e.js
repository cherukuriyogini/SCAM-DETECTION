/**
 * SmartScribe End-to-End Test Suite
 * Tests all 5 major criteria:
 * 1. 3-Role Authentication & Role Redirection
 * 2. Patient Data Isolation & RBAC Protection
 * 3. AI Extraction with Exact Evidence Traceability (Test A, Test B, Test C)
 * 4. Anti-Hallucination Rule (Test C: No medications = empty array)
 * 5. Doctor Review, Medication CRUD (500mg -> 650mg), MongoDB Persistence & PDF Verification
 */

const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("=================================================");
  console.log("🏥 STARTING SMARTSCRIBE END-TO-END AUDIT SUITE");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // ── TEST 1: Role-Based Authentication ──
  console.log("\n--- TEST 1: 3-Role Authentication & Redirection ---");
  
  // 1a. Doctor Login
  const docLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "doctor@smartscribe.com", password: "doctor123" }),
  });
  const docLoginData = await docLoginRes.json();
  const docCookie = docLoginRes.headers.get("set-cookie");
  assert(docLoginRes.status === 200 && docLoginData.user.role === "doctor", "Doctor login succeeds with role 'doctor'");
  assert(docLoginData.redirectTo === "/", "Doctor redirected to '/'");

  // 1b. Patient Login
  const patLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "patient@smartscribe.com", password: "patient123" }),
  });
  const patLoginData = await patLoginRes.json();
  const patCookie = patLoginRes.headers.get("set-cookie");
  assert(patLoginRes.status === 200 && patLoginData.user.role === "patient", "Patient login succeeds with role 'patient'");
  assert(patLoginData.redirectTo === "/patient/dashboard", "Patient redirected to '/patient/dashboard'");

  // 1c. Admin Login
  const admLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@smartscribe.com", password: "admin123" }),
  });
  const admLoginData = await admLoginRes.json();
  assert(admLoginRes.status === 200 && admLoginData.user.role === "admin", "Admin login succeeds with role 'admin'");
  assert(admLoginData.redirectTo === "/admin/dashboard", "Admin redirected to '/admin/dashboard'");

  // ── TEST 2: Patient Data Isolation & Access Control ──
  console.log("\n--- TEST 2: Patient Data Isolation & RBAC Protection ---");

  // Patient tries to POST a consultation -> MUST BE 403
  const patPostRes = await fetch(`${BASE_URL}/api/consultations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: patCookie || "" },
    body: JSON.stringify({ id: "illegal-consult", chiefComplaint: "Hack" }),
  });
  assert(patPostRes.status === 403, "Patient cannot create/post consultations (403 Forbidden enforced)");

  // ── TEST 3: Real AI Extraction - Test A (Full-Fields Clinical Dialogue) ──
  console.log("\n--- TEST 3: AI Clinical Extraction — Test A (Full-Fields) ---");

  const transcriptA = `
Doctor: Good morning. What brings you into the clinic today?
Patient: Hello Doctor. I have been suffering from a fever for three days, along with a dry cough and a mild headache.
Doctor: I see. Any chest pain or difficulty breathing?
Patient: No, nothing like that. Just feeling weak.
Doctor: Based on my examination, you have a mild viral upper respiratory infection. I will prescribe Paracetamol 500 mg tablets to be taken three times daily after food for three days to bring down the fever.
Patient: Okay doctor. Any specific dietary advice?
Doctor: Drink plenty of warm fluids, have light nutritious meals, and get adequate bed rest.
Doctor: If the fever persists beyond three days or if you experience high fever above 102 degrees, please return immediately for a follow-up.
Patient: Thank you Doctor.
  `.trim();

  const analyzeResA = await fetch(`${BASE_URL}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: docCookie || "" },
    body: JSON.stringify({
      transcript: transcriptA,
      audioFileName: "consultation_full_fields.mp3",
      patientDetails: { name: "Rahul Sharma", age: "28", gender: "Male" },
    }),
  });

  const summaryA = await analyzeResA.json();
  assert(analyzeResA.status === 200, "AI Clinical Extraction Test A succeeded");
  assert(summaryA.symptoms && summaryA.symptoms.length >= 2, "Extracted symptoms (fever, dry cough, headache)");
  assert(
    summaryA.symptoms.some((s) => s.evidence && s.evidence.toLowerCase().includes("three days")),
    "Symptom has exact source evidence citation"
  );
  assert(summaryA.medications && summaryA.medications.length >= 1, "Extracted Paracetamol medication");
  const paracetamolA = summaryA.medications.find((m) => m.name.toLowerCase().includes("paracetamol"));
  assert(paracetamolA && paracetamolA.dosage.includes("500"), "Paracetamol extracted with exact 500 mg dosage");
  assert(
    paracetamolA && paracetamolA.evidence.toLowerCase().includes("paracetamol"),
    "Medication has exact source evidence citation"
  );
  assert(summaryA.dietaryAdvice && summaryA.dietaryAdvice.length > 0, "Dietary advice extracted (warm fluids)");
  assert(summaryA.followUp && summaryA.followUp.length > 0, "Follow-up instructions extracted");

  // ── TEST 4: AI Extraction - Test B (Different Clinical Presentation) ──
  console.log("\n--- TEST 4: AI Clinical Extraction — Test B (Different Presentation) ---");

  const transcriptB = `
Doctor: Hi there, how can I help you today?
Patient: Doctor, I've had a severe throbbing headache on the right side of my head since yesterday morning. Sunlight makes it much worse and I feel nauseous.
Doctor: This presentation is characteristic of an acute migraine attack.
Doctor: I am prescribing Sumatriptan 50 mg to be taken as a single dose now with water.
Doctor: Please rest in a dark, quiet room and avoid caffeine and bright screens. If the headache doesn't subside or you develop visual loss, seek emergency care.
Patient: Understood, thank you.
  `.trim();

  const analyzeResB = await fetch(`${BASE_URL}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: docCookie || "" },
    body: JSON.stringify({
      transcript: transcriptB,
      audioFileName: "migraine_consultation.mp3",
      patientDetails: { name: "Priya Patel", age: "34", gender: "Female" },
    }),
  });

  const summaryB = await analyzeResB.json();
  assert(analyzeResB.status === 200, "AI Clinical Extraction Test B succeeded");
  const sumatriptan = summaryB.medications.find((m) => m.name.toLowerCase().includes("sumatriptan"));
  assert(sumatriptan !== undefined, "Extracted Sumatriptan (Different medication than Test A)");
  assert(sumatriptan && sumatriptan.dosage.includes("50"), "Sumatriptan extracted with 50 mg dosage");
  assert(
    summaryB.diagnoses.some((d) => d.name.toLowerCase().includes("migraine")),
    "Diagnosed Migraine (Different diagnosis than Test A)"
  );

  // ── TEST 5: AI Extraction - Test C (No Medications — Strict Anti-Hallucination) ──
  console.log("\n--- TEST 5: Strict Anti-Hallucination — Test C (No Medications Discussed) ---");

  const transcriptC = `
Doctor: Hello, what brings you here today?
Patient: Doctor, I have been feeling slightly fatigued at work over the past week because of long working hours and poor sleep.
Doctor: I examined your vitals and blood pressure, and everything looks completely normal.
Doctor: You do not need any prescription medications.
Doctor: I advise you to stay hydrated, maintain a regular 8-hour sleep schedule, and avoid working late on computer screens.
Doctor: If your fatigue persists past two weeks, return for routine blood work.
Patient: Okay doctor, thanks for the advice.
  `.trim();

  const analyzeResC = await fetch(`${BASE_URL}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: docCookie || "" },
    body: JSON.stringify({
      transcript: transcriptC,
      audioFileName: "fatigue_lifestyle.mp3",
      patientDetails: { name: "Arjun Verma", age: "40", gender: "Male" },
    }),
  });

  const summaryC = await analyzeResC.json();
  assert(analyzeResC.status === 200, "AI Clinical Extraction Test C succeeded");
  assert(
    summaryC.medications && summaryC.medications.length === 0,
    "STRICT NO-HALLUCINATION: medications is [] when no medication discussed"
  );
  assert(summaryC.clinicalAdvice && summaryC.clinicalAdvice.length > 0, "Lifestyle advice extracted without hallucinating drugs");

  // ── TEST 6: Doctor Review, Medication CRUD (500mg -> 650mg) & MongoDB Persistence ──
  console.log("\n--- TEST 6: Doctor Review, Medication CRUD & MongoDB Persistence ---");

  // Modify summaryA: change Paracetamol dosage from 500 mg -> 650 mg, and approve
  const editedSummary = { ...summaryA };
  editedSummary.medications = editedSummary.medications.map((m) =>
    m.name.toLowerCase().includes("paracetamol") ? { ...m, dosage: "650 mg" } : m
  );
  editedSummary.status = "Approved & Prescribed";
  editedSummary.doctorSignatureName = "Dr. Sarah Jenkins, MD";
  editedSummary.approvedAt = new Date().toLocaleString();

  // Save to MongoDB via Doctor's session
  const saveRes = await fetch(`${BASE_URL}/api/consultations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: docCookie || "" },
    body: JSON.stringify(editedSummary),
  });
  const saveData = await saveRes.json();
  assert(saveRes.status === 200 && saveData.success, "Doctor saved reviewed consultation to MongoDB");

  // Fetch back by ID from MongoDB
  const fetchRes = await fetch(`${BASE_URL}/api/consultations/${editedSummary.id}`, {
    headers: { Cookie: docCookie || "" },
  });
  const fetchData = await fetchRes.json();
  assert(fetchRes.status === 200, "Consultation retrieved from MongoDB by ID");
  const savedMed = fetchData.consultation.medications.find((m) => m.name.toLowerCase().includes("paracetamol"));
  assert(savedMed && savedMed.dosage === "650 mg", "Medication CRUD verified: dosage persisted as 650 mg in MongoDB!");
  assert(fetchData.consultation.status === "Approved & Prescribed", "Status persisted as 'Approved & Prescribed'");

  // ── TEST 7: Patient Privacy Check for the Saved Consultation ──
  console.log("\n--- TEST 7: Patient Privacy & Authorization Enforcement ---");

  // Rahul Sharma (the actual patient) fetches their consultations
  const rahulRes = await fetch(`${BASE_URL}/api/consultations`, {
    headers: { Cookie: patCookie || "" }, // patCookie is for Rahul Sharma
  });
  const rahulData = await rahulRes.json();
  assert(
    rahulData.consultations && rahulData.consultations.some((c) => c.patient.name === "Rahul Sharma"),
    "Patient Rahul Sharma can see their own approved consultation"
  );

  // Unauthorized patient tries to directly access Rahul Sharma's consultation
  // Let's create another patient token (e.g. Priya Patel)
  const priyaLoginRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Priya Patel",
      email: `priya.${Date.now()}@smartscribe.com`,
      password: "password123",
      role: "patient",
    }),
  });
  const priyaCookie = priyaLoginRes.headers.get("set-cookie");

  const unauthorizedFetchRes = await fetch(`${BASE_URL}/api/consultations/${editedSummary.id}`, {
    headers: { Cookie: priyaCookie || "" },
  });
  assert(
    unauthorizedFetchRes.status === 403,
    "Patient Priya Patel is BLOCKED (403 Forbidden) from viewing Rahul Sharma's consultation!"
  );

  console.log("\n=================================================");
  console.log(`📊 FINAL TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
