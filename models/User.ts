import mongoose, { Schema, Model, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: "doctor" | "patient" | "admin";
  isActive: boolean;
  specialization?: string;
  clinicName?: string;
  licenseNumber?: string;
  mrn?: string;
  contact?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["doctor", "patient", "admin"],
      default: "doctor",
    },
    isActive: { type: Boolean, default: true },
    specialization: { type: String },
    clinicName: { type: String },
    licenseNumber: { type: String },
    mrn: { type: String },
    contact: { type: String },
  },
  { timestamps: true }
);

const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default UserModel;
