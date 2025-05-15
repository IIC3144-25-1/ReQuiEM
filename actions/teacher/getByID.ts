'use server'

import { Teacher, ITeacher } from '@/models/Teacher'
import dbConnect from '@/lib/dbConnect'
import { Types } from 'mongoose'

// Función para obtener un profesor por su ID
export async function getTeacherByID(id: string): Promise<ITeacher | null> {
  await dbConnect()

  // Validar si el ID es válido
  if (!Types.ObjectId.isValid(id)) {
    throw new Error('ID inválido')
  }

  // Buscar y retornar el profesor con el user populado
  const teacher = await Teacher.findById(id)
    .populate('user')
    .lean()
    .exec()

  console.log('TEACHEE')
  console.log(teacher)

  return teacher ? JSON.parse(JSON.stringify(teacher)) : null
}
