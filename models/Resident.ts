import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./User";
import {ITeacher} from "./Teacher";

export interface IResident extends Document {
    _id: mongoose.Types.ObjectId;
    user: IUser | mongoose.Types.ObjectId;
    teachers: ITeacher[] | mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const ResidentSchema = new Schema<IResident>(
    {
      user: { type: mongoose.Types.ObjectId, ref: "User", required: true },
      teachers: [{ type: mongoose.Types.ObjectId, ref: "Teacher" }],
    },
    { timestamps: true }
);

export const Resident = mongoose.models.Resident || mongoose.model<IResident>("Resident", ResidentSchema);