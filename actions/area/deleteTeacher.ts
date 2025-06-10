'use server'

import dbConnect from "@/lib/dbConnect";
import { Area } from "@/models/Area";

export async function deleteTeacherFromArea(teacherId: string): Promise<void> {
    await dbConnect();

    await Area.findOneAndUpdate(
        { teachers: teacherId }, // Include soft delete check
        { $pull: { teachers: teacherId } }
    );

}