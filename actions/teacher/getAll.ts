'use server'

import { Teacher, ITeacher } from '@/models/Teacher'
import dbConnect from '@/lib/dbConnect'

// Función para obtener todos los profesores
export async function getTeachers(): Promise<ITeacher[]> {
  await dbConnect()

  const teachers = await Teacher.find()
    .populate('user')
    .lean<ITeacher[]>()
    .exec()

  return JSON.parse(JSON.stringify(teachers))
}
