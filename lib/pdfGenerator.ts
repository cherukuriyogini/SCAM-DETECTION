import { jsPDF } from "jspdf";
import { ClinicalSummary } from "@/types/clinical";

export function generatePrescriptionPDF(summary: ClinicalSummary): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  // Header Background Banner
  doc.setFillColor(240, 249, 250); // Light teal tint
  doc.rect(0, 0, pageWidth, 42, "F");

  // Top Border Accent Line
  doc.setFillColor(15, 118, 110); // Medical Teal #0f766e
  doc.rect(0, 0, pageWidth, 4, "F");

  // Clinic & Doctor Branding
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(15, 118, 110);
  doc.text("SMARTSCRIBE CLINICAL CARE", margin, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("Ambient Clinical Intelligence & Outpatient Care", margin, 20);

  // Clinic Details (Right Aligned)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(summary.consultation.clinicName, pageWidth - margin, 14, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(summary.consultation.doctorName, pageWidth - margin, 19, { align: "right" });
  doc.text(summary.consultation.specialization, pageWidth - margin, 24, { align: "right" });
  doc.text(`Reg / License No: ${summary.consultation.doctorLicense}`, pageWidth - margin, 29, { align: "right" });
  doc.text("Ph: +1 (800) 555-0199 | outpatient@smartscribe.health", pageWidth - margin, 34, { align: "right" });

  // Divider Line
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(margin, 42, pageWidth - margin, 42);

  // Patient Info Card Container
  let y = 48;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, "FD");

  // Patient Details
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("PATIENT NAME:", margin + 4, y + 6);
  doc.setFont("helvetica", "normal");
  doc.text(summary.patient.name, margin + 35, y + 6);

  doc.setFont("helvetica", "bold");
  doc.text("AGE / GENDER:", margin + 85, y + 6);
  doc.setFont("helvetica", "normal");
  doc.text(`${summary.patient.age} yrs / ${summary.patient.gender}`, margin + 115, y + 6);

  doc.setFont("helvetica", "bold");
  doc.text("DATE:", pageWidth - margin - 45, y + 6);
  doc.setFont("helvetica", "normal");
  doc.text(summary.consultation.date, pageWidth - margin - 4, y + 6, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.text("MRN / ID:", margin + 4, y + 14);
  doc.setFont("helvetica", "normal");
  doc.text(summary.patient.mrn || "MRN-2026-N/A", margin + 35, y + 14);

  doc.setFont("helvetica", "bold");
  doc.text("CONSULT REF:", margin + 85, y + 14);
  doc.setFont("helvetica", "normal");
  doc.text(summary.consultation.id, margin + 115, y + 14);

  doc.setFont("helvetica", "bold");
  doc.text("STATUS:", pageWidth - margin - 45, y + 14);
  doc.setTextColor(15, 118, 110);
  doc.setFont("helvetica", "bold");
  doc.text("Doctor Approved", pageWidth - margin - 4, y + 14, { align: "right" });

  // Section 1: Chief Complaint & Diagnosis
  y += 28;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Chief Complaint & Symptoms:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  y += 5;
  const ccLines = doc.splitTextToSize(summary.chiefComplaint, contentWidth - 4);
  doc.text(ccLines, margin + 2, y);
  y += ccLines.length * 4.5 + 2;

  // Diagnosis Box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, contentWidth, 12, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 118, 110);
  doc.text("Clinical Impression / Diagnosis:", margin + 4, y + 7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  const diagText = summary.diagnoses.map((d) => `${d.name} (${d.certainty})`).join(", ") || "Clinical evaluation";
  doc.text(diagText, margin + 65, y + 7.5);
  y += 18;

  // Rx Symbol & Prescribed Medications Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(15, 118, 110);
  doc.text("Rx", margin, y);

  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Prescribed Medications", margin + 12, y - 2);

  y += 4;

  // Table Header
  const colX = {
    no: margin + 2,
    med: margin + 12,
    dose: margin + 65,
    freq: margin + 95,
    dur: margin + 130,
    inst: margin + 155,
  };

  doc.setFillColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 7, "F");

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("#", colX.no, y + 5);
  doc.text("Medicine Name", colX.med, y + 5);
  doc.text("Dosage", colX.dose, y + 5);
  doc.text("Frequency", colX.freq, y + 5);
  doc.text("Duration", colX.dur, y + 5);
  doc.text("Instructions", colX.inst, y + 5);

  y += 8;

  // Table Rows
  summary.medications.forEach((med, idx) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);

    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y - 1, contentWidth, 7.5, "F");
    }

    doc.setFont("helvetica", "bold");
    doc.text(`${idx + 1}`, colX.no, y + 4);
    doc.text(med.name, colX.med, y + 4);
    doc.setFont("helvetica", "normal");
    doc.text(med.dosage, colX.dose, y + 4);
    doc.text(med.frequency, colX.freq, y + 4);
    doc.text(med.duration, colX.dur, y + 4);
    doc.text(med.instructions || "As advised", colX.inst, y + 4);

    y += 8;
  });

  y += 4;

  // Advice & Instructions
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("Dietary & Clinical Advice:", margin, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  const allAdvice = [...summary.dietaryAdvice, ...summary.clinicalAdvice];
  allAdvice.forEach((adv) => {
    doc.text(`•  ${adv}`, margin + 3, y);
    y += 4.5;
  });

  y += 2;

  // Follow up & Red Flags
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 118, 110);
  doc.text("Follow-Up & Red Flag Warnings:", margin, y);
  y += 4.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`•  ${summary.followUp}`, margin + 3, y);
  y += 4.5;

  if (summary.warnings && summary.warnings.length > 0) {
    summary.warnings.forEach((warn) => {
      doc.setTextColor(185, 28, 28); // subtle red
      doc.text(`!  ${warn}`, margin + 3, y);
      y += 4.5;
    });
  }

  // Footer & Doctor Signature
  const footerY = pageHeight - 34;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  // Doctor Signature
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Attending Physician Signature:", pageWidth - margin - 60, footerY + 8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(summary.consultation.doctorName, pageWidth - margin - 60, footerY + 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Verified & Signed on ${summary.consultation.date}`, pageWidth - margin - 60, footerY + 21);

  // Disclaimer / AI Notice
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "SmartScribe Ambient AI Assistant — Clinical documentation generated with doctor in the loop.",
    margin,
    footerY + 10
  );
  doc.text(
    "Final approval and prescription issuance executed exclusively by the treating licensed medical practitioner.",
    margin,
    footerY + 15
  );

  return doc;
}
