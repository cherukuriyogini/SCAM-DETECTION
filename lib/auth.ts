import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export const COOKIE_NAME = "smartscribe_auth_token";

const JWT_SECRET_STRING =
  process.env.JWT_SECRET || "smartscribe_super_secret_clinical_jwt_key_2026";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

export type AuthRole = "doctor" | "patient" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
  isActive?: boolean;
  specialization?: string;
  clinicName?: string;
  licenseNumber?: string;
  mrn?: string;
  contact?: string;
}

// Backward-compatible alias for doctor
export type AuthDoctor = AuthUser;

export async function signUserToken(user: AuthUser): Promise<string> {
  return await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export const signDoctorToken = signUserToken;

export async function verifyUserToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
      role: (payload.role as AuthRole) || "doctor",
      isActive: payload.isActive !== false,
      specialization: payload.specialization as string | undefined,
      clinicName: payload.clinicName as string | undefined,
      licenseNumber: payload.licenseNumber as string | undefined,
      mrn: payload.mrn as string | undefined,
      contact: payload.contact as string | undefined,
    };
  } catch {
    return null;
  }
}

export const verifyDoctorToken = verifyUserToken;

export async function getSessionUser(): Promise<AuthUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyUserToken(token);
}

export const getSessionDoctor = getSessionUser;

export async function getUserFromRequest(req: NextRequest): Promise<AuthUser | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyUserToken(token);
}

export const getDoctorFromRequest = getUserFromRequest;

// 1. DOCTOR CREDENTIALS
export const DEFAULT_DOCTOR: AuthUser = {
  id: "doc-01",
  name: process.env.DOCTOR_NAME || "Dr. Sarah Jenkins, MD",
  email: (process.env.DOCTOR_EMAIL || "doctor@smartscribe.com").toLowerCase(),
  role: "doctor",
  isActive: true,
  specialization: "General Physician & Internal Medicine",
  clinicName: "Metro General Care Clinic",
  licenseNumber: "MED-LIC-84920",
};
export const DEFAULT_DOCTOR_PASSWORD = process.env.DOCTOR_PASSWORD || "doctor123";

// 2. PATIENT CREDENTIALS
export const DEFAULT_PATIENT: AuthUser = {
  id: "pat-01",
  name: "Rahul Sharma",
  email: "patient@smartscribe.com",
  role: "patient",
  isActive: true,
  mrn: "MRN-2026-0841",
  contact: "+91 98765 43210",
};
export const DEFAULT_PATIENT_PASSWORD = "patient123";

// 3. ADMIN CREDENTIALS
export const DEFAULT_ADMIN: AuthUser = {
  id: "adm-01",
  name: "Chief Clinical Admin John",
  email: "admin@smartscribe.com",
  role: "admin",
  isActive: true,
  clinicName: "Metro General Hospital System",
};
export const DEFAULT_ADMIN_PASSWORD = "admin123";

// All 3 Default Users List
export const ALL_DEFAULT_USERS = [
  { user: DEFAULT_DOCTOR, password: DEFAULT_DOCTOR_PASSWORD },
  { user: DEFAULT_PATIENT, password: DEFAULT_PATIENT_PASSWORD },
  { user: DEFAULT_ADMIN, password: DEFAULT_ADMIN_PASSWORD },
];
