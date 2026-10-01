import { NextRequest, NextResponse } from "next/server";
import { ClinicalSummary } from "@/types/clinical";
import { getUserFromRequest } from "@/lib/auth";

interface PatientDetailsInput {
  name?: string;
  age?: string;
  gender?: string;
  mrn?: string;
}

interface AnalyzeRequestBody {
  transcript?: string;
  audioFileName?: string;
  audioDuration?: string;
  patientDetails?: PatientDetailsInput;
}

interface RawSymptom {
  id?: string;
  name: string;
  duration?: string;
  severity?: string;
  status?: string;
  evidence?: string;
}

interface RawDiagnosis {
  id?: string;
  name: string;
  certainty?: string;
  evidence?: string;
}

interface RawMedication {
  id?: string;
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  route?: string;
  instructions?: string;
  evidence?: string;
}

export async function POST(req: NextRequest) {
  let body: AnalyzeRequestBody | null = null;
  try {
    const raw = await req.text();
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload provided." },
      { status: 400 }
    );
  }

  const { transcript, audioFileName, audioDuration, patientDetails } = body || {};

  if (!transcript || typeof transcript !== "string" || transcript.trim().length === 0) {
    return NextResponse.json(
      { error: "A valid consultation transcript is required for clinical analysis." },
      { status: 400 }
    );
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey.trim() === "" || apiKey === "your_groq_api_key_here") {
    return NextResponse.json(
      {
        error:
          "AI Clinical Analysis service is not configured. Please add GROQ_API_KEY to .env.local. Get a free key at https://console.groq.com/keys",
      },
      { status: 401 }
    );
  }

  // Identify attending physician from session
  const sessionUser = await getUserFromRequest(req);
  const attendingDoctorName = sessionUser?.name || "Dr. Sarah Jenkins, MD";
  const doctorSpecialization = sessionUser?.specialization || "General Physician & Internal Medicine";
  const clinicName = sessionUser?.clinicName || "Metro General Care Clinic";
  const doctorLicense = sessionUser?.licenseNumber || "MED-LIC-84920";

  const systemPrompt = `You are SmartScribe, an ambient clinical AI documentation assistant for medical doctors.
Your job is to convert real doctor-patient consultation transcripts into a structured, verifiable clinical summary.

CRITICAL CLINICAL & ANTI-HALLUCINATION RULES:
1. ONLY extract information that is explicitly stated or discussed in the provided transcript.
2. DO NOT hallucinate, assume, or invent medications, dosages, symptoms, durations, frequencies, advice, or diagnoses.
3. If an entity is not mentioned in the transcript, set its value to an empty string or empty array.
4. If NO medications are discussed in the conversation, the "medications" array MUST be strictly empty: [].
5. If dosage, frequency, or duration is not stated for a medication, leave that field as an empty string. DO NOT substitute default or standard doses.
6. For every extracted symptom, diagnosis, and medication, you MUST populate the "evidence" field with the exact sentence or short excerpt from the transcript that directly supports it.
7. In "diagnoses", set "certainty" to "mentioned", "suspected", or "confirmed" based on how the physician phrased it. Never claim autonomous medical diagnosis.

Respond ONLY with valid JSON conforming to this schema:
{
  "patient": {
    "name": "string (or empty if not mentioned)",
    "age": "string",
    "gender": "string"
  },
  "chiefComplaint": "string",
  "chiefComplaintEvidence": "string",
  "symptoms": [
    {
      "id": "sym-1",
      "name": "string",
      "duration": "string",
      "severity": "Mild|Moderate|Severe",
      "status": "Active|Resolving|Resolved",
      "evidence": "Exact quote from transcript"
    }
  ],
  "diagnoses": [
    {
      "id": "diag-1",
      "name": "string",
      "certainty": "mentioned|suspected|confirmed",
      "evidence": "Exact quote from transcript"
    }
  ],
  "medications": [
    {
      "id": "med-1",
      "name": "string",
      "dosage": "string",
      "frequency": "string",
      "duration": "string",
      "route": "Oral|Inhalation|Topical|Nasal",
      "instructions": "string",
      "evidence": "Exact quote from transcript"
    }
  ],
  "dietaryAdvice": ["string"],
  "clinicalAdvice": ["string"],
  "followUp": "string",
  "warnings": ["string"],
  "summary": "string"
}`;

  const primaryModel =
    process.env.GROQ_ANALYSIS_MODEL || "openai/gpt-oss-120b";
  const fallbackModel = "openai/gpt-oss-20b";

  try {
    let response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: primaryModel,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Here is the doctor-patient consultation transcript:\n\n"""\n${transcript}\n"""\n\nExtract the structured clinical summary with exact evidence citations for each item.`,
          },
        ],
        temperature: 0.1,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok && primaryModel !== fallbackModel) {
      console.warn(`Primary model ${primaryModel} failed (${response.status}). Retrying with fallback: ${fallbackModel}`);
      response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: fallbackModel,
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Here is the doctor-patient consultation transcript:\n\n"""\n${transcript}\n"""\n\nExtract the structured clinical summary with exact evidence citations for each item.`,
            },
          ],
          temperature: 0.1,
          response_format: { type: "json_object" },
        }),
      });
    }

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const msg = errBody?.error?.message || `HTTP ${response.status} from Groq`;
      console.error("Groq Analysis Error:", msg);
      return NextResponse.json(
        { error: `Clinical AI analysis failed: ${msg}` },
        { status: response.status }
      );
    }

    const aiData = await response.json();
    const parsed = JSON.parse(aiData.choices[0].message.content);

    // Resolve patient details (Prioritize explicit intake, fallback to AI extracted, then defaults)
    const finalPatientName =
      patientDetails?.name?.trim() ||
      parsed.patient?.name?.trim() ||
      "Consultation Patient";

    const finalPatientAge =
      patientDetails?.age?.trim() ||
      parsed.patient?.age?.trim() ||
      "Adult";

    const finalPatientGender =
      patientDetails?.gender?.trim() ||
      parsed.patient?.gender?.trim() ||
      "Unspecified";

    const finalPatientMrn =
      patientDetails?.mrn?.trim() ||
      `MRN-${Math.floor(1000 + Math.random() * 9000)}`;

    const fullSummary: ClinicalSummary = {
      id: `smartscribe-${Date.now()}`,
      patient: {
        name: finalPatientName,
        age: finalPatientAge,
        gender: finalPatientGender,
        mrn: finalPatientMrn,
      },
      consultation: {
        id: `CONS-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        doctorName: attendingDoctorName,
        specialization: doctorSpecialization,
        clinicName,
        doctorLicense,
      },
      chiefComplaint: parsed.chiefComplaint || "Medical consultation",
      chiefComplaintEvidence: parsed.chiefComplaintEvidence || "",
      symptoms: (parsed.symptoms || []).map((s: RawSymptom, idx: number) => ({
        id: s.id || `sym-${idx + 1}`,
        name: s.name,
        duration: s.duration || "",
        severity: s.severity || "Moderate",
        status: s.status || "Active",
        evidence: s.evidence || "",
      })),
      diagnoses: (parsed.diagnoses || []).map((d: RawDiagnosis, idx: number) => ({
        id: d.id || `diag-${idx + 1}`,
        name: d.name,
        certainty: d.certainty || "mentioned",
        evidence: d.evidence || "",
      })),
      // STRICT ANTI-HALLUCINATION: No filler dosage, no filler frequency.
      medications: (parsed.medications || []).map((m: RawMedication, idx: number) => ({
        id: m.id || `med-${idx + 1}`,
        name: m.name,
        dosage: m.dosage || "",
        frequency: m.frequency || "",
        duration: m.duration || "",
        route: m.route || "Oral",
        instructions: m.instructions || "",
        evidence: m.evidence || "",
      })),
      dietaryAdvice: parsed.dietaryAdvice || [],
      clinicalAdvice: parsed.clinicalAdvice || [],
      followUp: parsed.followUp || "",
      warnings: parsed.warnings || [],
      summaryText: parsed.summary || "",
      transcript,
      audioFileName,
      audioDuration,
      status: "AI Draft",
      mode: "ai",
      processedAt: new Date().toLocaleString(),
    };

    return NextResponse.json(fullSummary);
  } catch (error) {
    console.error("Clinical analysis exception:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during clinical analysis." },
      { status: 500 }
    );
  }
}
