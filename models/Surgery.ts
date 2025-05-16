import mongoose, { Document, Schema } from "mongoose";
import { IArea } from "./Area";

export interface ISurgery extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    area: IArea;
    steps: string[];
    osats: {
        item: string;
        maxPunctuation: number;
      }[];
    createdAt: Date;
    updatedAt: Date;
}

const SurgerySchema = new Schema<ISurgery>(
    {
      name: { type: String, required: true, trim: true },
      description: { type: String, trim: true },
      area: { type: Schema.Types.ObjectId, ref: "Area", required: true },
      steps: [{ type: String, required: true, trim: true }],
      osats: [
        {
          item: { type: String, required: true, trim: true },
          maxPunctuation: { type: Number, required: true },
        },
      ],
    },
    { timestamps: true }
);

export const Surgery = mongoose.models.Surgery || mongoose.model<ISurgery>("Surgery", SurgerySchema);