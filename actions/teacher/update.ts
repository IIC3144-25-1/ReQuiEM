'use server'

import { Teacher } from '@/models/Teacher'
import dbConnect from '@/lib/dbConnect'
import { z } from 'zod'

// 1) Esquema Zod para validar los datos
const updateTeacherSchema = z.object({
  _id: z.string().min(1, 'Teacher ID is required'),
  user: z.string().min(1, 'User ID is required'),
})

// 2) Server Action para actualizar un profesor
export async function updateTeacher(formData: FormData) {
  // 2.1) Conexión a BD
  await dbConnect()

  // 2.2) Extraer datos
  const teacherId = formData.get('_id')
  const userId = formData.get('user')

  if (!teacherId || typeof teacherId !== 'string') {
    throw new Error('Teacher ID (_id) is required')
  }
  if (!userId || typeof userId !== 'string') {
    throw new Error('User ID is required')
  }

  // 2.3) Rehidratar y validar
  const raw = { _id: teacherId, user: userId }
  const data = updateTeacherSchema.parse(raw)

  // 2.4) Actualizar
  const updated = await Teacher.findByIdAndUpdate(
    data._id,
    { user: data.user },
    { new: true }
  )

  if (!updated) {
    throw new Error(`Teacher with id=${data._id} not found`)
  }

  console.log('Updated teacher', updated)
  return JSON.parse(JSON.stringify(updated))
}
