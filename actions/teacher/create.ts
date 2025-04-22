'use server'

import { Teacher } from "@/models/Teacher";
import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";

interface CreateTeacherInput {
  user: string;
}

export async function createTeacher(data: CreateTeacherInput) {
  await dbConnect();

  if (!mongoose.Types.ObjectId.isValid(data.user)) {
    throw new Error("ID de usuario inválido");
  }

  const newTeacher = new Teacher({
    user: new mongoose.Types.ObjectId(data.user),
  });

  const savedTeacher = await Teacher.create(newTeacher);

  return savedTeacher;
}
