import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    name?: string;
    email: string;
    image?: string;
    emailVerified?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
      name: { type: String, trim: true },
      email: { type: String, required: true, unique: true, trim: true },
      image: { type: String },
      emailVerified: { type: Date, default: null },
    },
    { timestamps: true }
  );
  
export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);