import { NextRequest, NextResponse } from "next/server";
import { extractFromTranscript } from "@/lib/extractionEngine";
import { ClinicalSummary } from "@/types/clinical";

interface AnalyzeRequestBody {
  transcript?: string;
  audioFileName?: string;
  audioDuration?: string;
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

  const { transcript, audioFileName, audioDuration } = body || {};

  if (!transcript || typeof transcript !== "string" || transcript.trim().length === 0) {
    return NextResponse.json(
      { error: "Transcript is required for analysis." },
      { status: 400 }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;

  // If an OpenAI API key is configured, query LLM
  if (apiKey && apiKey.trim() !== "") {
    try {
      const systemPrompt = `You are SmartScribe, an ambient clinical AI documentation assistant for doctors.
Your job is to convert natural doctor-patient conversation transcripts into a structured clinical summary.
CRITICAL CLINICAL RULES:
1. Extract ONLY facts explicitly spoken in the conversation.
2. DO NOT invent or hallucinate symptoms, medications, dosages, frequency, duration, or diagnoses.
3. If an item is unmentioned, set it to "Not mentioned" or leave the array empty.
4. For every extracted entity (symptom, diagnosis, medication, advice), you MUST provide the exact "sourceSentence" from the transcript for traceability.
5. Diagnoses must be qualified with certainty ("mentioned", "suspected", or "confirmed"). Never present AI inference as an autonomous medical diagnosis.

Respond ONLY with valid JSON following this exact structure:
{
  "patient": {
    "name": "string",
    "age": "string",
    "gender": "string"
  },
  "chiefComplaint": "string",
  "chiefComplaintSource": "string",
  "symptoms": [
    {
      "id": "sym-1",
      "name": "string",
      "duration": "string",
      "severity": "Mild|Moderate|Severe",
      "status": "Active|Resolving|Resolved",
      "sourceSentence": "string"
    }
  ],
  "diagnoses": [
    {
      "id": "diag-1",
      "name": "string",
      "certainty": "mentioned|suspected|confirmed",
      "icd10": "string",
      "sourceSentence": "string"
    }
  ],
  "medications": [
    {
      "id": "med-1",
      "name": "string",
      "dosage": "string",
      "frequency": "string",
      "duration": "string",
      "route": "Oral|Inhalation|Topical",
      "instructions": "string",
      "sourceSentence": "string"
    }
  ],
  "dietaryAdvice": ["string"],
  "clinicalAdvice": ["string"],
  "followUp": "string",
  "warnings": ["string"],
  "summaryText": "string"
}`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Here is the doctor-patient consultation transcript:\n\n${transcript}` },
          ],
          temperature: 0.1,
        }),
      });

      if (response.ok) {
        const aiData = await response.json();
        const parsed = JSON.parse(aiData.choices[0].message.content);

        const fullSummary: ClinicalSummary = {
          id: `smartscribe-${Date.now()}`,
          patient: {
            name: parsed.patient?.name || "Patient",
            age: parsed.patient?.age || "Adult",
            gender: parsed.patient?.gender || "Unspecified",
            mrn: `MRN-${Math.floor(1000 + Math.random() * 9000)}`,
          },
          consultation: {
            id: `CONS-${Math.floor(1000 + Math.random() * 9000)}`,
            date: new Date().toISOString().split("T")[0],
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            doctorName: "Dr. Sarah Jenkins, MD",
            specialization: "General Physician & Internal Medicine",
            clinicName: "Metro General Care Clinic",
            doctorLicense: "MED-LIC-84920",
          },
          chiefComplaint: parsed.chiefComplaint || "General consultation",
          chiefComplaintSource: parsed.chiefComplaintSource || "",
          symptoms: parsed.symptoms || [],
          diagnoses: parsed.diagnoses || [],
          medications: parsed.medications || [],
          dietaryAdvice: parsed.dietaryAdvice || [],
          clinicalAdvice: parsed.clinicalAdvice || [],
          followUp: parsed.followUp || "Follow up as clinically indicated.",
          warnings: parsed.warnings || [],
          summaryText: parsed.summaryText || "Consultation notes synthesized.",
          transcript,
          audioFileName: audioFileName || undefined,
          audioDuration: audioDuration || undefined,
          status: "AI Draft",
          mode: "ai",
          processedAt: new Date().toLocaleString(),
        };

        return NextResponse.json(fullSummary);
      }
    } catch (aiError) {
      console.warn("AI API request failed or timed out. Falling back to deterministic clinical engine.", aiError);
    }
  }

  // Fallback or Demo Mode (Deterministic, accurate extraction engine)
  const summary = extractFromTranscript(transcript, audioFileName, audioDuration);
  return NextResponse.json(summary);
}
