import mongoose, { Document, Schema } from "mongoose";
import { IResident } from "./Resident";
import { ITeacher } from "./Teacher";
import { ISurgery } from "./Surgery";

export interface IRecord extends Document {
    _id: mongoose.Types.ObjectId;
    resident: IResident | mongoose.Types.ObjectId;
    teacher: ITeacher | mongoose.Types.ObjectId;
    patientId: string;      // RUT del paciente
    date: Date;
    surgery: ISurgery | mongoose.Types.ObjectId;
    status: 'pending' | 'corrected' | 'reviewed' | 'canceled';
    residentsYear: number;
    steps: {
        name: string;
        residentDone: boolean;
        teacherDone: boolean;
        score: number;
    }[]
    osats: {
        item: string;
        scale: {
            punctuation: number;
            description?: string;
        }[];
        obtained: number;
    }
    residentJudgment: number;
    teacherJudgment: number;
    summaryScale: string;
    feedback: string;
    createdAt: Date;
    updatedAt: Date;
}

const RecordSchema = new Schema<IRecord>(
    {
      resident: { type: mongoose.Types.ObjectId, ref: "Resident", required: true },
      teacher: { type: mongoose.Types.ObjectId, ref: "Teacher", required: true },
      patientId: { type: String, required: true, trim: true },
      date: { type: Date, required: true },
      surgery: { type: mongoose.Types.ObjectId, ref: "Surgery", required: true },
      status: { type: String, enum: ['pending', 'corrected', 'reviewed', 'canceled'], default:'pending' },
      residentsYear: { type: Number, required: true },
      steps: [
        {
          name: { type: String, required: true, trim: true },
          residentDone: { type: Boolean, default: false },
          teacherDone: { type: Boolean, default: false },
          score: { type: Number, default: 0 },
        },
      ],
      osats: [
        {
          item: { type: String, required: true, trim: true },
          scale: [
            {
              punctuation: { type: Number, required: true },
              description: { type: String, trim: true, required: false },
            },
          ],
          obtained: { type: Number, default: 0 },
        },
      ],
      residentJudgment: { type: Number, default: 0 },
      teacherJudgment: { type: Number, default: 0 },
      summaryScale: { type: String, trim: true },
      feedback: { type: String, trim: true }
    },
    { timestamps: true }
);

export const Record = mongoose.models.Record || mongoose.model<IRecord>("Record", RecordSchema);