import { Schema, model, Document } from "mongoose";

export interface EmployerDocument extends Document {
  name: string;
  contactEmail?: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

const employerSchema = new Schema<EmployerDocument>(
  {
    name: { type: String, required: true },
    contactEmail: { type: String },
    phone: { type: String },
    address: { type: String },
  },
  { timestamps: true }
);

const Employer = model<EmployerDocument>("Employer", employerSchema);

export default Employer;
