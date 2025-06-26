"use server";

import { Record } from "@/models/Record";
import { Teacher } from "@/models/Teacher";
import { Resident } from "@/models/Resident";
import dbConnect from "@/lib/dbConnect";
import { emailService } from "@/lib/email/email.service";
import { auth } from "@/auth";
import { User } from "@/models/User";
import { Surgery } from "@/models/Surgery";

export async function reviewRecord(formData: FormData) {
  await dbConnect();
  const recordId = formData.get("recordId");
  const feedback = formData.get("feedback");
  const teacherJudgment = formData.get("teacherJudgment");
  const summaryScale = formData.get("summaryScale");
  const osats = formData.get("osats");

  if (!recordId || typeof recordId !== "string") {
    throw new Error("Record ID is required");
  }

  // Get current user (teacher) for the email
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const teacher = await Teacher.findOne({ user: session.user.id }).populate(
    {path: "user", model: User}
  );
  if (!teacher) {
    throw new Error("Teacher not found");
  }

  // Update record
  const record = await Record.findById(recordId).populate({
    path: "surgery",
    model: Surgery
  });
  if (!record) {
    throw new Error("Record not found");
  }

  record.status = "corrected";
  if (feedback) record.feedback = feedback.toString();
  if (teacherJudgment) record.teacherJudgment = Number(teacherJudgment);
  if (summaryScale) record.summaryScale = summaryScale.toString();
  if (osats) record.osats = JSON.parse(osats.toString());

  const stepsIdxs = new Set<number>();
  for (const key of formData.keys()) {
    const m = key.match(/^steps\.(\d+)\./);
    if (m) stepsIdxs.add(Number(m[1]));
  }
  const osatsIdxs = new Set<number>();
  for (const key of formData.keys()) {
    const m = key.match(/^osats\.(\d+)\./);
    if (m) osatsIdxs.add(Number(m[1]));
  }

  const steps = Array.from(stepsIdxs)
    .sort((a, b) => a - b)
    .map((i) => ({
      name: String(formData.get(`steps.${i}.name`) ?? ""),
      teacherDone: Boolean(formData.get(`steps.${i}.teacherDone`) === "true"),
      score: String(formData.get(`steps.${i}.score`) ?? "n/a"),
    }));
  const osatsArray = Array.from(osatsIdxs)
    .sort((a, b) => a - b)
    .map((i) => ({
      item: String(formData.get(`osats.${i}.item`) ?? ""),
      obtained: Number(formData.get(`osats.${i}.obtained`) ?? 0),
    }));

  for (let i = 0; i < record.steps.length; i++) {
    const newStep = steps.find((s) => s.name === record.steps[i].name);
    if (newStep) {
      record.steps[i].teacherDone = newStep.teacherDone;
      record.steps[i].score = newStep.score;
    }
  }

  for (let i = 0; i < record.osats.length; i++) {
    const newOsat = osatsArray.find((o) => o.item === record.osats[i].item);
    if (newOsat) {
      record.osats[i].obtained = newOsat.obtained;
    }
  }

  await record.save();

  // Get resident info for the email
  const resident = await Resident.findById(record.resident).populate({
    path: "user",
    model: User
  });
  if (!resident?.user) {
    console.error("Could not find resident for email notification");
    return record._id.toString();
  }
  
  // Send email notification to resident
  try {
    await emailService.sendRecordCorrectedEmail(resident.user.email, {
      user: {
        id: resident.user._id.toString(),
        name: resident.user.name || "Residente",
        email: resident.user.email,
        image: resident.user.image,
      },
      record: {
        id: record._id.toString(),
        title: record.surgery.name.toString(), // You might want to populate this
        teacherName: teacher.user.name || "Profesor",
        teacherEmail: teacher.user.email,
        correctedAt: new Date().toISOString(),
        comments: record.feedback,
      },
    });
  } catch (error) {
    console.error("Error sending record corrected email:", error);
    // Don't throw the error, as the record was updated successfully
  }

  return record._id.toString();
}
