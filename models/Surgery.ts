import mongoose, { Document, Schema } from "mongoose";

export interface ISurgery extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    area: string;
    steps: {
        name: string;
        description?: string;
        guideline: {
          name: string;
          maxRating: number;
        }
    }[];
    osats: {
        name: string;
        description?: string;
        maxRating: number;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const SurgerySchema = new Schema<ISurgery>(
    {
      name: { type: String, required: true, trim: true },
      description: { type: String, trim: true },
      area: { type: String, required: true, trim: true },
      steps: [
        {
          name: { type: String, required: true, trim: true },
          description: { type: String, trim: true },
          guideline: {
            name: { type: String, required: true, trim: true },
            maxRating: { type: Number, required: true, min: 1, default: 5 },
          },
        },
      ],
    },
    { timestamps: true }
);

export const Surgery = mongoose.models.Surgery || mongoose.model<ISurgery>("Surgery", SurgerySchema);