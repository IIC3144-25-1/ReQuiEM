import mongoose, { Document, Schema } from "mongoose";
import { IResident } from "./Resident";
import { ITeacher } from "./Teacher";
import { ISurgery } from "./Surgery";

export interface IRecord extends Document {
    _id: mongoose.Types.ObjectId;
    resident: IResident | mongoose.Types.ObjectId;
    teacher: ITeacher | mongoose.Types.ObjectId;
    patientName: string;
    date: Date;
    surgery: ISurgery | mongoose.Types.ObjectId;
    steps: {
        name: string;
        description?: string;
        comment?: string;
        feedback?: string;
        rating?: number;
    }[]
    status: 'pending' | 'completed' | 'canceled';
    comment: string;
    feedback: string;
    createdAt: Date;
    updatedAt: Date;
}

const RecordSchema = new Schema<IRecord>(
    {
      resident: { type: mongoose.Types.ObjectId, ref: "Resident", required: true },
      teacher: { type: mongoose.Types.ObjectId, ref: "Teacher", required: true },
      patientName: { type: String, required: true, trim: true },
      date: { type: Date, required: true },
      surgery: { type: mongoose.Types.ObjectId, ref: "Surgery", required: true },
      steps: [
        {
          name: { type: String, required: true, trim: true },
          description: { type: String, trim: true },
          comment: { type: String, trim: true },
          feedback: { type: String, trim: true },
          rating: { type: Number, min: 1, max: 5 },
        },
      ],
      status: { type: String, enum: ['pending', 'completed', 'canceled'], default:'pending' },
      comment:{type:String},
      feedback:{type:String}
    },
    { timestamps: true }
);

export const Record = mongoose.models.Record || mongoose.model<IRecord>("Record", RecordSchema);