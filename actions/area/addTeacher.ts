'use server'

import { Area } from "@/models/Area"
import dbConnect from "@/lib/dbConnect"
import { Teacher } from "@/models/Teacher"

export async function addTeacherToArea(areaId: string, teacherId: string): Promise<void> {
    await dbConnect()

    const area = await Area.findById(areaId);
  const teacher = await Teacher.findById(teacherId);

  if (!area || !teacher) {
    throw new Error("Area or teacher not found");
  }

  // Avoid adding the teacher again if already present
  const isAlreadyteacher = area.teachers.some(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (r : any) => r.toString() === teacher._id.toString()
  );

  if (!isAlreadyteacher) {
    area.teachers.push(teacher._id);
    await area.save();
  }

  return;
}