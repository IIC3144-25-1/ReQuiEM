import mongoose, { Document, Schema } from "mongoose";
import { IResident } from "./Resident";
import { ITeacher } from "./Teacher";

export interface IArea extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    residents: IResident[] | mongoose.Types.ObjectId[];
    teachers: ITeacher[] | mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}
const AreaSchema = new Schema<IArea>(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        residents: { type: [{ type: mongoose.Types.ObjectId, ref: "Resident" }], default: [] },
        teachers: { type: [{ type: mongoose.Types.ObjectId, ref: "Teacher" }], default: [] },
    },
    { timestamps: true }
);
export const Area = mongoose.models.Area || mongoose.model<IArea>("Area", AreaSchema);