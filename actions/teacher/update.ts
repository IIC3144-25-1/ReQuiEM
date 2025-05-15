'use server'

import { Teacher } from '@/models/Teacher'
import { User } from '@/models/User'
import dbConnect from '@/lib/dbConnect'
import { z } from 'zod'

// Esquema Zod para validación de entrada
const updateTeacherSchema = z.object({
  _id: z.string().min(1, 'Teacher ID is required'),
  user: z.string().min(1, 'User ID is required'),
  email: z.string().email('Email inválido'),
  area: z.string().min(1, 'Área es requerida'),
})

// Función para actualizar un profesor y su usuario
export async function updateTeacher(formData: FormData) {
  await dbConnect()

  // Extraer y validar datos
  const raw = {
    _id: formData.get('_id')?.toString() || '',
    user: formData.get('user')?.toString() || '',
    email: formData.get('email')?.toString() || '',
    area: formData.get('area')?.toString() || '',
  }

  const data = updateTeacherSchema.parse(raw)

  // Actualizar el email del usuario
  await User.findByIdAndUpdate(data.user, { email: data.email })

  // Actualizar el Teacher (user y área)
  const updatedTeacher = await Teacher.findByIdAndUpdate(
    data._id,
    {
      user: data.user,
      area: data.area,
    },
    { new: true }
  )

  if (!updatedTeacher) {
    throw new Error(`No se encontró el profesor con ID: ${data._id}`)
  }

  console.log('Profesor actualizado:', updatedTeacher)
  return JSON.parse(JSON.stringify(updatedTeacher))
}
