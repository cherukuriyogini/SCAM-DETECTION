import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import UserModel from "@/models/User";
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

    // Filter allowed fields for update
    const updateData: Record<string, unknown> = {};
    if (typeof body.isActive === "boolean") updateData.isActive = body.isActive;
    if (body.name) updateData.name = body.name;
    if (body.email) updateData.email = body.email.toLowerCase().trim();
    if (body.role) updateData.role = body.role;
    if (body.specialization !== undefined) updateData.specialization = body.specialization;
    if (body.contact !== undefined) updateData.contact = body.contact;
    if (body.licenseNumber !== undefined) updateData.licenseNumber = body.licenseNumber;
    if (body.mrn !== undefined) updateData.mrn = body.mrn;

    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).select("-passwordHash");

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User record not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("PATCH /api/admin/users/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update user." },
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

    const deleted = await UserModel.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE /api/admin/users/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete user." },
      { status: 500 }
    );
  }
}
