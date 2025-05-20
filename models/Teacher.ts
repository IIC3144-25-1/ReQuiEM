import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./User";

export interface ITeacher extends Document {
    _id: mongoose.Types.ObjectId;
    user: IUser | mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const TeacherSchema = new Schema<ITeacher>(
    {
      user: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

export const Teacher = mongoose.models.Teacher || mongoose.model<ITeacher>("Teacher", TeacherSchema);