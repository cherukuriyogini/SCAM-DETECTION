import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import UserModel from "@/models/User";
import { getUserFromRequest, ALL_DEFAULT_USERS } from "@/lib/auth";

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
      // Return default accounts if DB not connected
      return NextResponse.json({
        users: ALL_DEFAULT_USERS.map((e) => ({
          ...e.user,
          isActive: true,
          createdAt: new Date().toISOString(),
        })),
      });
    }

    // Auto-seed default users in DB if empty so admin can manage them immediately
    for (const entry of ALL_DEFAULT_USERS) {
      const existing = await UserModel.findOne({ email: entry.user.email });
      if (!existing) {
        await UserModel.create({
          name: entry.user.name,
          email: entry.user.email,
          passwordHash: "$2a$12$e6m7xP94Qk7E3q88lVlZCe2kF1dC7gY2xQZlZCe2kF1dC7gY2xQZl", // dummy/seeded hash
          role: entry.user.role,
          isActive: true,
          specialization: entry.user.specialization,
          clinicName: entry.user.clinicName,
          licenseNumber: entry.user.licenseNumber,
          mrn: entry.user.mrn,
          contact: entry.user.contact,
        }).catch(() => {});
      }
    }

    const users = await UserModel.find({})
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ users });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user directory." },
      { status: 500 }
    );
  }
}
