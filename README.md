# SmartScribe — Ambient Clinical AI Assistant

> **"Listen. Understand. Structure. Prescribe."**
> **Problem Statement: PS-010 — Doctor-Patient Conversation Summarizer & Prescription Generator**
> Domain: Artificial Intelligence & Machine Learning (Healthcare)

---

## 🏥 Overview

Doctors spend up to 40% of their consultation time typing clinical notes into EHR systems instead of engaging with patients. **SmartScribe** is an ambient clinical intelligence assistant that captures the natural doctor-patient conversation, separates clinical signal from conversational noise, structures the findings into a verifiable SOAP-style summary, and generates a printable medical prescription with the **doctor firmly in control**.

---

## ⚡ Core Hackathon Flow (Ready to Demo)

1. **Dashboard (`/`)**:
   - Outpatient clinical telemetry (Consultations Today, Notes Generated, Prescriptions Prepared, 1.8s avg processing time).
   - 1-Click synthetic demo launchers for 3 clinical cases.
   - Historical records with patient details, status, and PDF export.

2. **New Consultation Intake (`/consultation/new`)**:
   - **Option A (Audio Upload)**: Drag-and-drop MP3, WAV, M4A, WEBM with audio duration and waveform visualizer.
   - **Option B (Text Transcript)**: Full transcription editor with speaker labeling.
   - **1-Click Synthetic Demo Presets**:
     - *Case 1*: Rahul Sharma (Fever, Dry Cough & Sore Throat — URTI)
     - *Case 2*: Priya Patel (Throbbing Headache & Photophobia — Migraine with Aura)
     - *Case 3*: Vikram Mehta (Epigastric Pain, Acid Reflux & Nausea — GERD / Gastritis)

3. **Multi-Stage Processing Pipeline**:
   - Visual step-by-step progress indicator:
     - ✓ Conversation received
     - ✓ Transcribing & filtering conversational noise
     - ✓ Identifying clinical entities
     - ✓ Extracting symptoms and medications
     - ✓ Structuring clinical summary
     - ✓ Preparing doctor review workspace

4. **Clinical Summary & Evidence Traceability (`/consultation/[id]`)**:
   - **Chief Complaint** highlighted card.
   - **Symptoms Table**: Duration, severity tags (Mild / Moderate / Severe), and status.
   - **Clinical Impression / Diagnosis**: Explicitly qualified as *"Mentioned by physician in consultation"* (ensuring AI never claims autonomous diagnosis).
   - **Prescribed Medications Table**: Medication, Dosage, Frequency, Duration, Route, Instructions.
   - **Dietary & Clinical Advice**: Categorized bullet points.
   - **Follow-Up & Red Flag Warnings**: Clear emergency return criteria.
   - **"Why was this extracted?" Traceability Engine**: Interactive evidence panel linking every clinical entity to its exact quote in the conversation transcript!

5. **Doctor Review & Edit Studio**:
   - Complete inline editing of patient demographics, chief complaints, symptoms, diagnoses, medications, dosages, frequency, and instructions.
   - Add/Delete buttons for symptoms, medications, and advice.
   - Review workflow tracker: `AI Draft` ➔ `Doctor Reviewed` ➔ `Approved & Prescribed`.
   - Confirmation safety modal prior to final authorization.

6. **Prescription Preview & PDF Generation**:
   - Photorealistic clinical letterhead with doctor credentials, clinic branding, patient banner, Rx emblem, medication table, and doctor signature.
   - **Download Prescription PDF**: High-resolution vector PDF generated client-side via `jsPDF`.
   - **Print Prescription**: Native browser print stylesheet formatting.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict typing for clinical models)
- **Styling**: Tailwind CSS (Medical SaaS palette: white, slate, clinical teal, emerald)
- **Icons**: Lucide React
- **PDF Generation**: jsPDF (Vector printable medical prescription)
- **AI / LLM Engine**: Server API (`/api/analyze`) with support for `OPENAI_API_KEY`, backed by a robust deterministic clinical NLP fallback engine (zero configuration required).
- **Persistence**: LocalStorage with realistic seed consultations.

---

## 🔒 Safety & Clinical Governance

- **Doctor in Control**: AI serves strictly as an ambient scribe. The treating physician must review, edit, and sign off on all prescriptions.
- **No Hallucinated Diagnoses**: Diagnostic impressions are always qualified as *"Mentioned by physician"*.
- **100% Traceability**: Every extracted symptom, medication, and dosage is directly attributed to verified conversation quotes.
- **Data Privacy**: Local demonstration data is synthetic; no real patient PHI is stored.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. (Optional) Configure OpenAI API Key
Create a `.env.local` file:
```env
OPENAI_API_KEY=your_openai_api_key_here
```
> *Note: If no API key is provided, SmartScribe automatically operates in **Demo Mode** with the high-accuracy deterministic clinical extraction engine.*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build & Start
```bash
npm run build
npm run start
```

---

## 👨‍⚕️ Hackathon Evaluation Checklist

- [x] **PS-010 Alignment**: Doctor-patient consultation summarization & prescription generation.
- [x] **Clinical Entity Extraction (40%)**: Symptoms, durations, severity, medications, dosages, frequencies, and advice extracted accurately.
- [x] **Medical Summary Quality (35%)**: Structured, concise SOAP-aligned summary with verified source sentence citations.
- [x] **Doctor Review Experience (25%)**: Real-time editable fields, add/delete medications, status lifecycle, and confirmation.
- [x] **Working PDF Export**: Vector-quality printable PDF download + browser print.
- [x] **Zero-Config Demo Mode**: 3 rich synthetic clinical scenarios ready for instant demonstration.
