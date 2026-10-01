import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import UserModel from "@/models/User";
import { signUserToken, COOKIE_NAME, AuthUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role, specialization, licenseNumber, contact } = body;

    // --- Validation ---
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Name, email, password, and role are required." },
        { status: 400 }
      );
    }

    if (!["doctor", "patient"].includes(role)) {
      return NextResponse.json(
        { error: "Role must be either 'doctor' or 'patient'. Admin accounts cannot be self-registered." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (role === "doctor" && !licenseNumber) {
      return NextResponse.json(
        { error: "Medical license number is required for doctor registration." },
        { status: 400 }
      );
    }

    // --- Database Operations ---
    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json(
        { error: "Database is not connected. Please configure MONGODB_URI and try again." },
        { status: 503 }
      );
    }

    // Check if email already exists
    const cleanEmail = email.trim().toLowerCase();
    const existing = await UserModel.findOne({ email: cleanEmail });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email address already exists. Please sign in." },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate MRN for patients
    const mrn = role === "patient"
      ? `MRN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
      : undefined;

    // Create user in MongoDB
    const newUser = await UserModel.create({
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      role,
      specialization: role === "doctor" ? (specialization || "General Medicine") : undefined,
      clinicName: role === "doctor" ? "Metro General Care Clinic" : undefined,
      licenseNumber: role === "doctor" ? licenseNumber?.trim() : undefined,
      mrn,
      contact: contact?.trim() || undefined,
    });

    // Build auth user payload
    const authUser: AuthUser = {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      specialization: newUser.specialization,
      clinicName: newUser.clinicName,
      licenseNumber: newUser.licenseNumber,
      mrn: newUser.mrn,
      contact: newUser.contact,
    };

    // Issue JWT session cookie
    const token = await signUserToken(authUser);

    const redirectTo =
      role === "patient" ? "/patient/dashboard" :
      role === "doctor" ? "/" : "/";

    const response = NextResponse.json({
      success: true,
      message: "Account created successfully.",
      user: authUser,
      redirectTo,
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration." },
      { status: 500 }
    );
  }
}
