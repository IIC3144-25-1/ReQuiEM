'use server'

import { Record } from "@/models/Record"
import { Surgery } from "@/models/Surgery"
import dbConnect from "@/lib/dbConnect"

export async function createRecord(formData: FormData) {
    await dbConnect()
    const resident = formData.get("resident")
    const teacher = formData.get("teacher")
    const patientId = formData.get("patientId")
    const date = formData.get("date")
    const surgeryId = formData.get("surgery")
    const residentsYear = formData.get("residentsYear")

    if (!surgeryId || typeof surgeryId !== "string") {
        throw new Error("Surgery is required")
    }
    if (!teacher || typeof teacher !== "string") {
        throw new Error("Teacher ID is required")
    }
    
    const dateObj = new Date(date as string);
    const surgery = await Surgery.findById(surgeryId);
    
    const steps = surgery.steps.map((step: string) => ({
        name: step,
        residentDone: false,
        teacherDone: false,
        score: 0,
    }));

    const osats = surgery.osats.map((osat: { item: string; scale: { punctuation: number; description?: string }[] }) => ({
        item: osat.item,
        scale: osat.scale.map((scaleItem) => ({
            punctuation: scaleItem.punctuation,
            description: scaleItem.description,
        })),
        obtained: 0,
    }));

    const newRecord = new Record({
        resident: resident,
        teacher: teacher,
        patientId: patientId,
        date: dateObj,
        surgery: surgeryId,
        status: "pending",
        residentsYear: Number(residentsYear),
        steps: steps,
        osats: osats,
        residentJudgment: 0,
        teacherJudgment: 0,
        summaryScale: "",
        feedback: "",
    });

    const record = await newRecord.save();
    // const savedRecord = await newRecord.save();
    // console.log("savedRecord", savedRecord);
    return record._id.toString();
}
