import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import UserModel from "@/models/User";
import DoctorModel from "@/models/Doctor";
import {
  signUserToken,
  COOKIE_NAME,
  ALL_DEFAULT_USERS,
  AuthUser,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    let authenticatedUser: AuthUser | null = null;

    // Check if user exists in MongoDB first (to enforce activation status)
    try {
      const db = await connectToDatabase();
      if (db) {
        const userRecord = await UserModel.findOne({ email: cleanEmail });
        if (userRecord) {
          if (userRecord.isActive === false) {
            return NextResponse.json(
              { error: "Your account has been deactivated by hospital administration. Please contact the administrator." },
              { status: 403 }
            );
          }
          const isValid = await bcrypt.compare(password, userRecord.passwordHash);
          if (isValid) {
            authenticatedUser = {
              id: userRecord._id.toString(),
              name: userRecord.name,
              email: userRecord.email,
              role: userRecord.role,
              isActive: userRecord.isActive,
              specialization: userRecord.specialization,
              clinicName: userRecord.clinicName,
              licenseNumber: userRecord.licenseNumber,
              mrn: userRecord.mrn,
              contact: userRecord.contact,
            };
          }
        } else {
          // Check legacy doctor collection
          const doctorRecord = await DoctorModel.findOne({ email: cleanEmail });
          if (doctorRecord) {
            const isValid = await bcrypt.compare(password, doctorRecord.passwordHash);
            if (isValid) {
              authenticatedUser = {
                id: doctorRecord._id.toString(),
                name: doctorRecord.name,
                email: doctorRecord.email,
                role: "doctor",
                isActive: true,
                specialization: doctorRecord.specialization,
                clinicName: doctorRecord.clinicName,
                licenseNumber: doctorRecord.licenseNumber,
              };
            }
          }
        }
      }
    } catch (dbErr) {
      console.warn("MongoDB user auth check warning:", dbErr);
    }

    // If not matched via database, check predefined default demo accounts
    if (!authenticatedUser) {
      const matchedDefault = ALL_DEFAULT_USERS.find(
        (entry) =>
          entry.user.email.toLowerCase() === cleanEmail &&
          entry.password === password
      );

      if (matchedDefault) {
        authenticatedUser = matchedDefault.user;
      }
    }

    if (!authenticatedUser) {
      return NextResponse.json(
        { error: "Invalid credentials. Please verify your email and password." },
        { status: 401 }
      );
    }

    // Determine target dashboard based on role
    let redirectTo = "/";
    if (authenticatedUser.role === "patient") {
      redirectTo = "/patient/dashboard";
    } else if (authenticatedUser.role === "admin") {
      redirectTo = "/admin/dashboard";
    }

    // Generate JWT token containing role & active status
    const token = await signUserToken(authenticatedUser);

    const response = NextResponse.json({
      success: true,
      user: authenticatedUser,
      redirectTo,
    });

    // Set HttpOnly cookie for secure session
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
    console.error("Login route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during login." },
      { status: 500 }
    );
  }
}
