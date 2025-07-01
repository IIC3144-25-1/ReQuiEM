'use server'

import { ITeacher, Teacher } from '@/models/Teacher'
import { User } from '@/models/User'
import dbConnect from '@/lib/dbConnect'
import { z } from 'zod'
import { deleteTeacherFromArea } from '../area/deleteTeacher'
import { addTeacherToArea } from '../area/addTeacher'

// Esquema Zod para validación de entrada
const updateTeacherSchema = z.object({
  _id: z.string().min(1, 'Teacher ID is required'),
  user: z.string().min(1, 'User ID is required'),
  email: z.string().email('Email inválido'),
  area: z.string().min(1, 'Área es requerida'),
  name: z.string().min(1, 'Nombre es requerido'),
  admin: z.boolean(),
})

// Función para actualizar un profesor y su usuario
export async function updateTeacher(formData: FormData): Promise<ITeacher> {
  await dbConnect()

  // Extraer y validar datos
  const raw = {
    _id: formData.get('_id')?.toString() || '',
    user: formData.get('user')?.toString() || '',
    email: formData.get('email')?.toString() || '',
    name: formData.get('name')?.toString() || '',
    area: formData.get('area')?.toString() || '',
    admin: formData.get('admin') === 'true',
  }

  const data = updateTeacherSchema.parse(raw)

  // Actualizar el email del usuario
  await User.findByIdAndUpdate(
    data.user,
    { name: data.name, email: data.email, admin: data.admin },
    { new: true }
  )

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

  await deleteTeacherFromArea(data._id)
  await addTeacherToArea(data.area, data._id)

  console.log('Profesor actualizado:', updatedTeacher)
  return JSON.parse(JSON.stringify(updatedTeacher))
}
