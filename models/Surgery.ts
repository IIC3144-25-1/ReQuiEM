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
        scale: {
            punctuation: string;
            description?: string;
        }[];
      }[];
    createdAt: Date;
    updatedAt: Date;
    deleted?: boolean;
}

const SurgerySchema = new Schema<ISurgery>(
    {
      name: { type: String, required: true, trim: true },
      description: { type: String, trim: true },
      area: { type: mongoose.Types.ObjectId, required: true, ref: "Area" },
      steps: [{ type: String, required: true, trim: true }],
      osats: [
        {
          item: { type: String, required: true, trim: true },
          scale: [
            {
              punctuation: { type: String, required: true },
              description: { type: String, trim: true, required: false },
            },
          ],
        },
      ],
      deleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export const Surgery = mongoose.models.Surgery || mongoose.model<ISurgery>("Surgery", SurgerySchema);