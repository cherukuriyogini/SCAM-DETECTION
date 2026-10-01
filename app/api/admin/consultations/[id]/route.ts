import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import ConsultationModel from "@/models/Consultation";
import { getUserFromRequest } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await getUserFromRequest(req);
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json(
        { error: "Access denied. Administrator privileges required." },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await req.json();

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json(
        { error: "Database not connected." },
        { status: 503 }
      );
    }

    const updated = await ConsultationModel.findOneAndUpdate(
      { $or: [{ id }, { _id: id }] },
      { $set: body },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Consultation record not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Consultation updated successfully by administrator.",
      consultation: updated,
    });
  } catch (error) {
    console.error("PATCH /api/admin/consultations/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update consultation record." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await getUserFromRequest(req);
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json(
        { error: "Access denied. Administrator privileges required." },
        { status: 403 }
      );
    }

    const { id } = params;
    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json(
        { error: "Database not connected." },
        { status: 503 }
      );
    }

    const deleted = await ConsultationModel.findOneAndDelete({
      $or: [{ id }, { _id: id }],
    });

    if (!deleted) {
      return NextResponse.json(
        { error: "Consultation record not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Consultation record deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE /api/admin/consultations/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete consultation record." },
      { status: 500 }
    );
  }
}
