'use server'

import { Teacher, ITeacher } from '@/models/Teacher'
import dbConnect from '@/lib/dbConnect'

// Función para obtener todos los profesores
export async function getAllTeachers(): Promise<ITeacher[]> {
  await dbConnect()

  const teachers = await Teacher.find()
    .populate('user')
    .populate('area')
    .lean<ITeacher[]>()
    .exec()

  return JSON.parse(JSON.stringify(teachers))
}
