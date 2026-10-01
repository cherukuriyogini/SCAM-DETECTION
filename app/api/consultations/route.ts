import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import ConsultationModel from "@/models/Consultation";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized access. Please sign in." }, { status: 401 });
    }

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({
        consultations: [],
        warning: "MongoDB is not connected yet.",
      });
    }

    // Role-based patient data isolation
    let query: Record<string, unknown> = {};

    if (user.role === "patient") {
      // Patients can ONLY see their own approved medical records
      query = {
        $or: [
          { "patient.name": new RegExp(`^${user.name.trim()}$`, "i") },
          ...(user.mrn ? [{ "patient.mrn": user.mrn }] : []),
        ],
        status: "Approved & Prescribed",
      };
    }

    const consultations = await ConsultationModel.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ consultations });
  } catch (error) {
    console.error("GET /api/consultations error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve clinical consultations." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized access. Please sign in." }, { status: 401 });
    }

    // Strict role check: Patients cannot create consultations
    if (user.role !== "doctor" && user.role !== "admin") {
      return NextResponse.json(
        { error: "Access denied. Only licensed physicians or administrators can record clinical consultations." },
        { status: 403 }
      );
    }

    const data = await req.json();
    if (!data || !data.id) {
      return NextResponse.json(
        { error: "Invalid consultation data." },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({
        success: true,
        savedToDb: false,
        warning: "MongoDB not connected. Consultation returned for client-side storage.",
        consultation: data,
      });
    }

    // Upsert consultation in MongoDB
    const consultation = await ConsultationModel.findOneAndUpdate(
      { id: data.id },
      { $set: data },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({
      success: true,
      savedToDb: true,
      consultation,
    });
  } catch (error) {
    console.error("POST /api/consultations error:", error);
    return NextResponse.json(
      { error: "Failed to save consultation to database." },
      { status: 500 }
    );
  }
}
