import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import ConsultationModel from "@/models/Consultation";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized access. Please sign in." }, { status: 401 });
    }

    const { id } = params;
    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json(
        { error: "Database not connected.", consultation: null },
        { status: 404 }
      );
    }

    const consultation = await ConsultationModel.findOne({ id }).lean();
    if (!consultation) {
      return NextResponse.json(
        { error: "Consultation record not found." },
        { status: 404 }
      );
    }

    // Patient Privacy Enforcement: Patient cannot access another patient's consultation
    if (user.role === "patient") {
      const isOwner =
        consultation.patient.name.toLowerCase().trim() === user.name.toLowerCase().trim() ||
        (user.mrn && consultation.patient.mrn === user.mrn);

      if (!isOwner) {
        return NextResponse.json(
          { error: "Access denied. You are only authorized to view your own clinical records." },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ consultation });
  } catch (error) {
    console.error("GET /api/consultations/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve consultation." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized access. Please sign in." }, { status: 401 });
    }

    // Role check: Only doctors and admins can edit consultations
    if (user.role !== "doctor" && user.role !== "admin") {
      return NextResponse.json(
        { error: "Access denied. Patients are not permitted to modify clinical records." },
        { status: 403 }
      );
    }

    const { id } = params;
    const updates = await req.json();

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({
        success: true,
        savedToDb: false,
        warning: "MongoDB not connected. Changes preserved in client storage.",
        consultation: updates,
      });
    }

    const updated = await ConsultationModel.findOneAndUpdate(
      { id },
      { $set: updates },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Consultation record not found for update." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, consultation: updated });
  } catch (error) {
    console.error("PATCH /api/consultations/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update consultation." },
      { status: 500 }
    );
  }
}
