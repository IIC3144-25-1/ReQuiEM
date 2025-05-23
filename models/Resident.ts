import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./User";
import { IArea } from "./Area";

export interface IResident extends Document {
    _id: mongoose.Types.ObjectId;
    user: IUser;
    area: IArea;
    createdAt: Date;
    updatedAt: Date;
}

const ResidentSchema = new Schema<IResident>(
    {
      user: { type: mongoose.Types.ObjectId, ref: "User", required: true },
      area: { type: mongoose.Types.ObjectId, ref: "Area", required: true },
    },
    { timestamps: true }
);

export const Resident = mongoose.models.Resident || mongoose.model<IResident>("Resident", ResidentSchema);