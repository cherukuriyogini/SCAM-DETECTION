import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import ConsultationModel from "@/models/Consultation";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const adminUser = await getUserFromRequest(req);
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json(
        { error: "Access denied. Administrator privileges required." },
        { status: 403 }
      );
    }

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({
        consultations: [],
        warning: "MongoDB is not connected.",
      });
    }

    const consultations = await ConsultationModel.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ consultations });
  } catch (error) {
    console.error("GET /api/admin/consultations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch consultation records." },
      { status: 500 }
    );
  }
}
