'use server'

import dbConnect from '@/lib/dbConnect'
import { ITeacher, Teacher } from '@/models/Teacher'
import { User } from '@/models/User'
import { createUser } from '../user/create'
import { addTeacherToArea } from '../area/addTeacher'

// Acción para crear un profesor y asociarlo a un área
export async function createTeacher(formData: FormData): Promise<ITeacher> {
  await dbConnect()

  const email = formData.get('email')?.toString() || ''
  const areaId = formData.get('area')?.toString()

  if (!email || !areaId) {
    throw new Error('Email y área son obligatorios')
  }

  // 1. Buscar si el usuario ya existe
  let user = await User.findOne({ email })

  if (!user) {
    // 2. Crear nuevo usuario si no existe
    user = await createUser(formData)
    if (!user || !user._id) {
      throw new Error('No se pudo crear el usuario')
    }
  }

  // 3. Verificar si ya existe un Teacher para ese usuario
  const existingTeacher = await Teacher.findOne({ user: user._id })
  if (existingTeacher) {
    throw new Error('Este usuario ya está registrado como profesor')
  }

  // 4. Crear el nuevo Teacher con el área asociada
  const teacher = await Teacher.create({
    user: user._id,
    area: areaId,
  })

  await addTeacherToArea(areaId, teacher._id)

  return JSON.parse(JSON.stringify(teacher))
}
