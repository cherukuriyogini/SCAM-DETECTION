import mongoose, { Schema, Model, Document } from "mongoose";

export interface IDoctor extends Document {
  name: string;
  email: string;
  passwordHash: string;
  specialization: string;
  clinicName: string;
  licenseNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema = new Schema<IDoctor>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    specialization: { type: String, default: "General Physician & Internal Medicine" },
    clinicName: { type: String, default: "Metro General Care Clinic" },
    licenseNumber: { type: String, default: "MED-LIC-84920" },
  },
  { timestamps: true }
);

const DoctorModel: Model<IDoctor> =
  mongoose.models.Doctor || mongoose.model<IDoctor>("Doctor", DoctorSchema);

export default DoctorModel;
