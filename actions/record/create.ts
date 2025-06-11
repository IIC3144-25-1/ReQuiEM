"use server";

import { Record } from "@/models/Record";
import { Surgery } from "@/models/Surgery";
import { Teacher } from "@/models/Teacher";
import { Resident } from "@/models/Resident";
import dbConnect from "@/lib/dbConnect";
import { emailService } from "@/lib/email/email.service";

export async function createRecord(formData: FormData) {
  await dbConnect();
  const resident = formData.get("resident");
  const teacher = formData.get("teacher");
  const patientId = formData.get("patientId");
  const date = formData.get("date");
  const surgeryId = formData.get("surgery");
  const residentsYear = formData.get("residentsYear");

  if (!surgeryId || typeof surgeryId !== "string") {
    throw new Error("Surgery is required");
  }
  if (!teacher || typeof teacher !== "string") {
    throw new Error("Teacher ID is required");
  }
  if (!resident || typeof resident !== "string") {
    throw new Error("Resident ID is required");
  }

  const dateObj = new Date(date as string);
  const surgery = await Surgery.findById(surgeryId);

  // const steps = surgery.steps.map((step: string) => ({
  //     name: step,
  //     residentDone: false,
  //     teacherDone: false,
  //     score: 'a',
  // }));

  const osats = surgery.osats.map(
    (osat: {
      item: string;
      scale: { punctuation: number; description?: string }[];
    }) => ({
      item: osat.item,
      scale: osat.scale.map((scaleItem) => ({
        punctuation: scaleItem.punctuation,
        description: scaleItem.description,
      })),
      obtained: osat.scale[0].punctuation,
    })
  );

  const newRecord = new Record({
    resident: resident,
    teacher: teacher,
    patientId: patientId,
    date: dateObj,
    surgery: surgeryId,
    status: "pending",
    residentsYear: Number(residentsYear),
    // steps: steps,
    osats: osats,
    residentJudgment: 4,
    teacherJudgment: 4,
    summaryScale: "A",
    feedback: "",
  });

  // console.log("savedRecord", newRecord);
  const record = await newRecord.save();
  // const savedRecord = await newRecord.save();

  // Get teacher and resident info for the email
  const [teacherDoc, residentDoc] = await Promise.all([
    Teacher.findById(teacher).populate("user"),
    Resident.findById(resident).populate("user"),
  ]);

  if (!teacherDoc?.user || !residentDoc?.user) {
    console.error("Could not find teacher or resident for email notification");
    return record._id.toString();
  }

  // Send email notification to teacher
  try {
    await emailService.sendRecordPendingReviewEmail(teacherDoc.user.email, {
      user: {
        id: teacherDoc.user._id.toString(),
        name: teacherDoc.user.name || "Profesor",
        email: teacherDoc.user.email,
        image: teacherDoc.user.image,
      },
      record: {
        id: record._id.toString(),
        title: surgery.name,
        studentName: residentDoc.user.name || "Residente",
        studentEmail: residentDoc.user.email,
        createdAt: record.date.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error sending record pending review email:", error);
    // Don't throw the error, as the record was created successfully
  }

  return record._id.toString();
}
