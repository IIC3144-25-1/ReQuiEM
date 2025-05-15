import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./User";
import { IArea } from "./Area";

export interface ITeacher extends Document {
    _id: mongoose.Types.ObjectId;
    user: IUser;
    area: IArea;
    createdAt: Date;
    updatedAt: Date;
}

const TeacherSchema = new Schema<ITeacher>(
    {
      user: { type: mongoose.Types.ObjectId, ref: "User", required: true },
      area: { type: mongoose.Types.ObjectId, ref: "Area", required: true },
    },
    { timestamps: true }
);

export const Teacher = mongoose.models.Teacher || mongoose.model<ITeacher>("Teacher", TeacherSchema);