import { ClinicalSummary } from "@/types/clinical";

export interface SampleCase {
  id: string;
  title: string;
  patientName: string;
  complaint: string;
  tag: string;
  audioDuration: string;
  transcript: string;
  summary: ClinicalSummary;
}

export const SAMPLE_CASES: SampleCase[] = [
  {
    id: "case-urti-01",
    title: "Upper Respiratory Infection (Fever & Cough)",
    patientName: "Rahul Sharma",
    complaint: "Fever, sore throat and dry cough for 3 days",
    tag: "Respiratory / General Medicine",
    audioDuration: "2m 14s",
    transcript: `Doctor: What brings you in today?
Patient: I've had a fever for about three days. It started with a sore throat and then I developed a dry cough. The fever is around 101 degrees Fahrenheit, mostly in the evening.
Doctor: Any shortness of breath, chest pain, or vomiting?
Patient: No chest pain or vomiting. I feel tired and have some body aches.
Doctor: Are you taking any medication currently?
Patient: Just paracetamol occasionally.
Doctor: Based on your symptoms, this appears consistent with an upper respiratory infection. I'll prescribe paracetamol 500 mg three times daily after food for three days and cetirizine 10 mg once at night for five days. Drink plenty of fluids and get adequate rest.
Doctor: Come back if the fever persists beyond three days, symptoms worsen, or you develop breathing difficulty.`,
    summary: {
      id: "case-urti-01",
      patient: {
        name: "Rahul Sharma",
        age: "28",
        gender: "Male",
        contact: "+91 98765 43210",
        mrn: "MRN-2026-0841",
      },
      consultation: {
        id: "CONS-0841",
        date: "2026-10-01",
        time: "10:15 AM",
        doctorName: "Dr. Sarah Jenkins, MD",
        specialization: "General Physician & Internal Medicine",
        clinicName: "Metro General Care Clinic",
        doctorLicense: "MED-LIC-84920",
      },
      chiefComplaint: "Fever, sore throat and dry cough for 3 days.",
      chiefComplaintEvidence: "I've had a fever for about three days. It started with a sore throat and then I developed a dry cough.",
      symptoms: [
        {
          id: "sym-1",
          name: "Fever (up to 101°F, evening spike)",
          duration: "3 days",
          severity: "Moderate",
          status: "Active",
          evidence: "The fever is around 101 degrees Fahrenheit, mostly in the evening.",
          sourceSentence: "The fever is around 101 degrees Fahrenheit, mostly in the evening.",
        },
        {
          id: "sym-2",
          name: "Dry cough",
          duration: "3 days",
          severity: "Moderate",
          status: "Active",
          evidence: "and then I developed a dry cough.",
          sourceSentence: "and then I developed a dry cough.",
        },
        {
          id: "sym-3",
          name: "Sore throat",
          duration: "3 days",
          severity: "Mild",
          status: "Resolving",
          evidence: "It started with a sore throat",
          sourceSentence: "It started with a sore throat",
        },
        {
          id: "sym-4",
          name: "Body aches & Fatigue",
          duration: "3 days",
          severity: "Mild",
          status: "Active",
          evidence: "I feel tired and have some body aches.",
          sourceSentence: "I feel tired and have some body aches.",
        },
      ],
      diagnoses: [
        {
          id: "diag-1",
          name: "Upper Respiratory Tract Infection (URTI)",
          certainty: "mentioned",
          icd10: "J06.9",
          evidence: "Based on your symptoms, this appears consistent with an upper respiratory infection.",
          sourceSentence: "Based on your symptoms, this appears consistent with an upper respiratory infection.",
        },
      ],
      medications: [
        {
          id: "med-1",
          name: "Paracetamol",
          dosage: "500 mg",
          frequency: "Three times daily (TDS)",
          duration: "3 days",
          route: "Oral",
          instructions: "After food",
          evidence: "I'll prescribe paracetamol 500 mg three times daily after food for three days",
          sourceSentence: "I'll prescribe paracetamol 500 mg three times daily after food for three days",
        },
        {
          id: "med-2",
          name: "Cetirizine",
          dosage: "10 mg",
          frequency: "Once at night (OD HS)",
          duration: "5 days",
          route: "Oral",
          instructions: "At bedtime with water",
          evidence: "and cetirizine 10 mg once at night for five days.",
          sourceSentence: "and cetirizine 10 mg once at night for five days.",
        },
      ],
      dietaryAdvice: [
        "Drink plenty of fluids (warm water, broths, electrolyte hydration)",
        "Eat light, warm, freshly prepared meals",
      ],
      clinicalAdvice: [
        "Adequate bed rest and avoidance of physical exertion",
        "Salt water gargling 2-3 times daily for soothing sore throat",
      ],
      followUp: "Follow-up review in 3 days if fever persists, symptoms worsen, or breathing difficulty develops.",
      warnings: [
        "Seek emergency medical evaluation immediately if shortness of breath or persistent chest discomfort occurs.",
      ],
      summaryText:
        "28-year-old male presenting with a 3-day history of moderate fever (up to 101°F), sore throat, dry cough, and fatigue. No reported chest pain, shortness of breath, or vomiting. Clinical impression is consistent with an acute viral upper respiratory tract infection. Managed conservatively with antipyretic analgesia and antihistamine support with hydration advice.",
      transcript: `Doctor: What brings you in today?
Patient: I've had a fever for about three days. It started with a sore throat and then I developed a dry cough. The fever is around 101 degrees Fahrenheit, mostly in the evening.
Doctor: Any shortness of breath, chest pain, or vomiting?
Patient: No chest pain or vomiting. I feel tired and have some body aches.
Doctor: Are you taking any medication currently?
Patient: Just paracetamol occasionally.
Doctor: Based on your symptoms, this appears consistent with an upper respiratory infection. I'll prescribe paracetamol 500 mg three times daily after food for three days and cetirizine 10 mg once at night for five days. Drink plenty of fluids and get adequate rest.
Doctor: Come back if the fever persists beyond three days, symptoms worsen, or you develop breathing difficulty.`,
      status: "AI Draft",
      mode: "demo",
      processedAt: "2026-10-01 10:17 AM",
    },
  },
  {
    id: "case-migraine-02",
    title: "Throbbing Headache & Photophobia",
    patientName: "Priya Patel",
    complaint: "Severe throbbing unilateral headache with light sensitivity for 24 hours",
    tag: "Neurology / Primary Care",
    audioDuration: "3m 05s",
    transcript: `Doctor: Hello Priya, please tell me what you are experiencing.
Patient: Doctor, I have had a severe throbbing headache on the right side of my head since yesterday afternoon. Any bright light or loud noise makes it much worse, and I feel nauseous.
Doctor: Have you had headaches like this before in the past?
Patient: Yes, maybe once a month during stressful work weeks, but this one is particularly intense.
Doctor: Any vision changes, numbness, weakness, or fever?
Patient: No numbness or fever, but I noticed some flickering spots in my vision right before the pain began.
Doctor: That sounds very characteristic of a migraine episode with aura. I want you to take Sumatriptan 50 mg as soon as migraine symptoms start, and Naproxen 250 mg twice daily with food for two days to reduce neurovascular inflammation.
Doctor: Rest in a dark, quiet room, keep well hydrated, and maintain a headache trigger diary. Please follow up in two weeks, or immediately if the headache changes in pattern or becomes unprecedented in severity.`,
    summary: {
      id: "case-migraine-02",
      patient: {
        name: "Priya Patel",
        age: "34",
        gender: "Female",
        contact: "+91 97123 45678",
        mrn: "MRN-2026-0914",
      },
      consultation: {
        id: "CONS-0914",
        date: "2026-10-01",
        time: "11:30 AM",
        doctorName: "Dr. Sarah Jenkins, MD",
        specialization: "General Physician & Internal Medicine",
        clinicName: "Metro General Care Clinic",
        doctorLicense: "MED-LIC-84920",
      },
      chiefComplaint: "Severe throbbing unilateral right-sided headache with photophobia and nausea for 24 hours.",
      chiefComplaintEvidence:
        "I have had a severe throbbing headache on the right side of my head since yesterday afternoon. Any bright light or loud noise makes it much worse, and I feel nauseous.",
      symptoms: [
        {
          id: "sym-1",
          name: "Unilateral throbbing headache (right-sided)",
          duration: "24 hours",
          severity: "Severe",
          status: "Active",
          evidence: "I have had a severe throbbing headache on the right side of my head since yesterday afternoon.",
          sourceSentence: "I have had a severe throbbing headache on the right side of my head since yesterday afternoon.",
        },
        {
          id: "sym-2",
          name: "Photophobia & Phonophobia",
          duration: "24 hours",
          severity: "Moderate",
          status: "Active",
          evidence: "Any bright light or loud noise makes it much worse",
          sourceSentence: "Any bright light or loud noise makes it much worse",
        },
        {
          id: "sym-3",
          name: "Nausea",
          duration: "24 hours",
          severity: "Moderate",
          status: "Active",
          evidence: "and I feel nauseous.",
          sourceSentence: "and I feel nauseous.",
        },
        {
          id: "sym-4",
          name: "Visual aura (flickering spots)",
          duration: "Prior to onset",
          severity: "Mild",
          status: "Resolving",
          evidence: "I noticed some flickering spots in my vision right before the pain began.",
          sourceSentence: "I noticed some flickering spots in my vision right before the pain began.",
        },
      ],
      diagnoses: [
        {
          id: "diag-1",
          name: "Acute Migraine with visual aura",
          certainty: "mentioned",
          icd10: "G43.109",
          evidence: "That sounds very characteristic of a migraine episode with aura.",
          sourceSentence: "That sounds very characteristic of a migraine episode with aura.",
        },
      ],
      medications: [
        {
          id: "med-1",
          name: "Sumatriptan",
          dosage: "50 mg",
          frequency: "At onset of attack (SOS, may repeat once after 2 hours if needed)",
          duration: "As needed (SOS)",
          route: "Oral",
          instructions: "Take at first sign of migraine; maximum 100 mg in 24 hours",
          evidence: "take Sumatriptan 50 mg as soon as migraine symptoms start",
          sourceSentence: "take Sumatriptan 50 mg as soon as migraine symptoms start",
        },
        {
          id: "med-2",
          name: "Naproxen",
          dosage: "250 mg",
          frequency: "Twice daily (BD)",
          duration: "2 days",
          route: "Oral",
          instructions: "With food or a glass of milk",
          evidence: "and Naproxen 250 mg twice daily with food for two days",
          sourceSentence: "and Naproxen 250 mg twice daily with food for two days",
        },
      ],
      dietaryAdvice: [
        "Avoid known dietary triggers such as aged cheeses, monosodium glutamate (MSG), and excessive caffeine",
        "Maintain consistent hydration throughout the day",
      ],
      clinicalAdvice: [
        "Rest in a dark, quiet, well-ventilated room during acute episodes",
        "Maintain a headache diary tracking duration, triggers, and sleep patterns",
      ],
      followUp:
        "Routine follow-up in 2 weeks. Seek emergency care immediately if experiencing 'thunderclap' sudden severe headache or neurological deficits.",
      warnings: [
        "Return immediately if accompanied by neck stiffness, high fever, speech difficulty, or focal limb weakness.",
      ],
      summaryText:
        "34-year-old female presenting with episodic severe unilateral throbbing headache accompanied by nausea, photophobia, and preceding visual aura. History consistent with migraine with aura triggered by stress. Prescribed abortive triptan and NSAID anti-inflammatory therapy with dark room rest and trigger avoidance.",
      transcript: `Doctor: Hello Priya, please tell me what you are experiencing.
Patient: Doctor, I have had a severe throbbing headache on the right side of my head since yesterday afternoon. Any bright light or loud noise makes it much worse, and I feel nauseous.
Doctor: Have you had headaches like this before in the past?
Patient: Yes, maybe once a month during stressful work weeks, but this one is particularly intense.
Doctor: Any vision changes, numbness, weakness, or fever?
Patient: No numbness or fever, but I noticed some flickering spots in my vision right before the pain began.
Doctor: That sounds very characteristic of a migraine episode with aura. I want you to take Sumatriptan 50 mg as soon as migraine symptoms start, and Naproxen 250 mg twice daily with food for two days to reduce neurovascular inflammation.
Doctor: Rest in a dark, quiet room, keep well hydrated, and maintain a headache trigger diary. Please follow up in two weeks, or immediately if the headache changes in pattern or becomes unprecedented in severity.`,
      status: "AI Draft",
      mode: "demo",
      processedAt: "2026-10-01 11:34 AM",
    },
  },
  {
    id: "case-gerd-03",
    title: "Epigastric Pain, Acid Reflux & Nausea",
    patientName: "Vikram Mehta",
    complaint: "Burning chest and stomach discomfort with nausea after meals for 5 days",
    tag: "Gastroenterology / Outpatient",
    audioDuration: "2m 45s",
    transcript: `Doctor: Good morning Vikram. What issues have you been having?
Patient: Good morning Doctor. For the past five days, I have had a burning feeling right in the middle of my upper stomach that rises up into my chest. It gets worse after heavy dinner and when I lie down to sleep. I also feel mildly nauseous in the mornings.
Doctor: Have you noticed any difficulty swallowing, unexplained weight loss, or black stools?
Patient: No, none of those. Just a sour acidic taste in my mouth and frequent burping.
Doctor: These symptoms point strongly toward gastroesophageal reflux disease, or acid reflux with mild gastritis. I will start you on Pantoprazole 40 mg once daily, taken 30 minutes before breakfast for fourteen days. Also take an antacid gel, 10 ml after lunch and dinner as needed for symptomatic relief.
Doctor: Avoid eating spicy foods, citrus, late-night dinners, and coffee. Elevate the head of your bed slightly. If symptoms do not improve in one week or if you develop severe abdominal pain or vomiting, come back right away.`,
    summary: {
      id: "case-gerd-03",
      patient: {
        name: "Vikram Mehta",
        age: "45",
        gender: "Male",
        contact: "+91 98220 11223",
        mrn: "MRN-2026-1033",
      },
      consultation: {
        id: "CONS-1033",
        date: "2026-10-01",
        time: "02:40 PM",
        doctorName: "Dr. Sarah Jenkins, MD",
        specialization: "General Physician & Internal Medicine",
        clinicName: "Metro General Care Clinic",
        doctorLicense: "MED-LIC-84920",
      },
      chiefComplaint: "Epigastric burning sensation radiating retrosternally, acid regurgitation, and morning nausea for 5 days.",
      chiefComplaintEvidence:
        "For the past five days, I have had a burning feeling right in the middle of my upper stomach that rises up into my chest. It gets worse after heavy dinner and when I lie down to sleep.",
      symptoms: [
        {
          id: "sym-1",
          name: "Epigastric burning & heartburn",
          duration: "5 days",
          severity: "Moderate",
          status: "Active",
          evidence: "I have had a burning feeling right in the middle of my upper stomach that rises up into my chest.",
          sourceSentence: "I have had a burning feeling right in the middle of my upper stomach that rises up into my chest.",
        },
        {
          id: "sym-2",
          name: "Acid regurgitation / sour taste",
          duration: "5 days",
          severity: "Moderate",
          status: "Active",
          evidence: "Just a sour acidic taste in my mouth and frequent burping.",
          sourceSentence: "Just a sour acidic taste in my mouth and frequent burping.",
        },
        {
          id: "sym-3",
          name: "Morning nausea",
          duration: "5 days",
          severity: "Mild",
          status: "Active",
          evidence: "I also feel mildly nauseous in the mornings.",
          sourceSentence: "I also feel mildly nauseous in the mornings.",
        },
      ],
      diagnoses: [
        {
          id: "diag-1",
          name: "Gastroesophageal Reflux Disease (GERD) with mild gastritis",
          certainty: "mentioned",
          icd10: "K21.9",
          evidence:
            "These symptoms point strongly toward gastroesophageal reflux disease, or acid reflux with mild gastritis.",
          sourceSentence:
            "These symptoms point strongly toward gastroesophageal reflux disease, or acid reflux with mild gastritis.",
        },
      ],
      medications: [
        {
          id: "med-1",
          name: "Pantoprazole",
          dosage: "40 mg",
          frequency: "Once daily (OD)",
          duration: "14 days",
          route: "Oral",
          instructions: "30 minutes before breakfast on empty stomach",
          evidence: "Pantoprazole 40 mg once daily, taken 30 minutes before breakfast for fourteen days.",
          sourceSentence: "Pantoprazole 40 mg once daily, taken 30 minutes before breakfast for fourteen days.",
        },
        {
          id: "med-2",
          name: "Antacid Gel (Magaldrate + Simethicone)",
          dosage: "10 ml",
          frequency: "Twice daily after meals / SOS",
          duration: "7 days",
          route: "Oral",
          instructions: "Post meals as needed for heartburn",
          evidence: "take an antacid gel, 10 ml after lunch and dinner as needed for symptomatic relief.",
          sourceSentence: "take an antacid gel, 10 ml after lunch and dinner as needed for symptomatic relief.",
        },
      ],
      dietaryAdvice: [
        "Avoid spicy, oily foods, citrus juices, chocolate, and caffeinated beverages",
        "Eat dinner at least 2-3 hours before lying down to sleep",
      ],
      clinicalAdvice: [
        "Elevate head of bed by 6 inches or use a wedge pillow",
        "Avoid tight abdominal garments and eat smaller, more frequent meals",
      ],
      followUp: "Review after 1 week if symptoms persist or do not respond to proton pump inhibitor therapy.",
      warnings: [
        "Seek immediate emergency care if experiencing difficulty swallowing, persistent vomiting, or black/tarry stools.",
      ],
      summaryText:
        "45-year-old male presenting with typical symptoms of gastroesophageal reflux disease and mild dyspepsia exacerbated postprandially and in recumbent position. Red flag symptoms negative. Initiated on a 14-day trial of oral proton pump inhibitor with adjunctive antacid suspension alongside dietary and lifestyle modification.",
      transcript: `Doctor: Good morning Vikram. What issues have you been having?
Patient: Good morning Doctor. For the past five days, I have had a burning feeling right in the middle of my upper stomach that rises up into my chest. It gets worse after heavy dinner and when I lie down to sleep. I also feel mildly nauseous in the mornings.
Doctor: Have you noticed any difficulty swallowing, unexplained weight loss, or black stools?
Patient: No, none of those. Just a sour acidic taste in my mouth and frequent burping.
Doctor: These symptoms point strongly toward gastroesophageal reflux disease, or acid reflux with mild gastritis. I will start you on Pantoprazole 40 mg once daily, taken 30 minutes before breakfast for fourteen days. Also take an antacid gel, 10 ml after lunch and dinner as needed for symptomatic relief.
Doctor: Avoid eating spicy foods, citrus, late-night dinners, and coffee. Elevate the head of your bed slightly. If symptoms do not improve in one week or if you develop severe abdominal pain or vomiting, come back right away.`,
      status: "AI Draft",
      mode: "demo",
      processedAt: "2026-10-01 02:45 PM",
    },
  },
];
