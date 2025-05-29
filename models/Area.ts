import mongoose, { Document, Schema } from "mongoose";
import { IResident } from "./Resident";
import { ITeacher } from "./Teacher";

export interface IArea extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    residents: IResident[];
    teachers: ITeacher[];
    createdAt: Date;
    updatedAt: Date;
    deleted?: boolean;
}
const AreaSchema = new Schema<IArea>(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        residents: { type: [{ type: mongoose.Types.ObjectId, ref: "Resident" }], default: [] },
        teachers: { type: [{ type: mongoose.Types.ObjectId, ref: "Teacher" }], default: [] },
        deleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);
export const Area = mongoose.models.Area || mongoose.model<IArea>("Area", AreaSchema);