'use server'

import { Teacher } from '@/models/Teacher'
import dbConnect from '@/lib/dbConnect'
import { Types } from 'mongoose'

// Server Action para eliminar un profesor
export async function deleteTeacher(id: string) {
  await dbConnect()

  if (!Types.ObjectId.isValid(id)) {
    throw new Error('ID inválido')
  }

  const deleted = await Teacher.findByIdAndUpdate(
    id,
    { deleted: true },
    { new: true }
  ).exec()
  // Si no se encuentra, lanzar error
  if (!deleted) {
    throw new Error('Profesor no encontrado')
  }

  return { success: true, message: 'Profesor eliminado correctamente' }
}
