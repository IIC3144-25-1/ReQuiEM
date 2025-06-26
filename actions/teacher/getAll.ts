'use server'

import { Teacher, ITeacher } from '@/models/Teacher'
import dbConnect from '@/lib/dbConnect'
import { Area } from '@/models/Area'
import { User } from '@/models/User'

// Función para obtener todos los profesores
export async function getAllTeachers(): Promise<ITeacher[]> {
  await dbConnect()

  const teachers = await Teacher.find({ deleted: false })
    .populate({ path: 'user', model: User })
    .populate({ path: 'area', model: Area })
    .lean<ITeacher[]>()
    .exec()

  return JSON.parse(JSON.stringify(teachers))
}
