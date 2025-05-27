import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    name?: string;
    email: string;
    image?: string;
    emailVerified?: Date | null;
    rut?: string;
    phone?: string;
    birthdate?: Date;
    admin: boolean;
    createdAt: Date;
    updatedAt: Date;
    deleted?: boolean;
}

const UserSchema = new Schema<IUser>(
    {
      name: { type: String, trim: true },
      email: { type: String, required: true, unique: true, trim: true },
      image: { type: String },
      emailVerified: { type: Date, default: null },
      rut: { type: String, trim: true },
      phone: { type: String, trim: true },
      birthdate: { type: Date },
      admin: { type: Boolean, default: false },
      deleted: { type: Boolean, default: false }
    },
    { timestamps: true }
  );
  
export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);