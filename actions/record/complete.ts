"use server";

import { Record } from "@/models/Record";
import dbConnect from "@/lib/dbConnect";
import { Teacher } from "@/models/Teacher";
import { Resident } from "@/models/Resident";
import { emailService } from "@/lib/email/email.service";

export async function completeRecord(formData: FormData) {
  await dbConnect();
  const recordId = formData.get("recordId");
  const residentJudgment = formData.get("residentJudgment");
  const residentComment = formData.get("residentComment");

  const stepsIdxs = new Set<number>();
  for (const key of formData.keys()) {
    const m = key.match(/^steps\.(\d+)\./);
    if (m) stepsIdxs.add(Number(m[1]));
  }

  const steps = Array.from(stepsIdxs)
    .sort((a, b) => a - b)
    .map((i) => ({
      name: String(formData.get(`steps.${i}.name`) ?? ""),
      residentDone: Boolean(formData.get(`steps.${i}.residentDone`) === "true"),
    }));

  const raw = { residentJudgment, residentComment, steps };
  console.log(raw);

  const doc = await Record.findByIdAndUpdate(recordId, raw);

  // Send email notification to teacher
  try {
    const teacherDoc = await Teacher.findById(doc.teacher._id).populate("user");
    const residentDoc = await Resident.findById(doc.resident._id).populate(
      "user"
    );
    if (!teacherDoc?.user || !residentDoc?.user) {
      console.error(
        "Could not find teacher or resident for email notification"
      );
      return JSON.parse(JSON.stringify(doc));
    }
    await emailService.sendRecordPendingReviewEmail(teacherDoc.user.email, {
      user: {
        id: teacherDoc.user._id.toString(),
        name: teacherDoc.user.name || "Profesor",
        email: teacherDoc.user.email,
        image: teacherDoc.user.image,
      },
      record: {
        id: doc._id.toString(),
        title: doc.surgery.name,
        studentName: residentDoc.user.name || "Residente",
        studentEmail: residentDoc.user.email,
        createdAt: doc.date.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error sending record pending review email:", error);
    // Don't throw the error, as the record was updated successfully
  }

  return JSON.parse(JSON.stringify(doc));
}
