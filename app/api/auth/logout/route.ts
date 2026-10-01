import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json(
    { success: true, message: "Logged out successfully." },
    { status: 200 }
  );

  // Clear the auth cookie — must match exactly how it was set
  response.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0), // Epoch = immediately expired
    maxAge: 0,
  });

  return response;
}

// Also support GET for direct browser navigation logout
export async function GET() {
  const response = NextResponse.redirect(
    new URL("/login", process.env.NEXTAUTH_URL || "http://localhost:3000")
  );

  response.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
    maxAge: 0,
  });

  return response;
}
