'use server'

import dbConnect from '@/lib/dbConnect'
import { Resident } from '@/models/Resident'
import { User } from '@/models/User'
import { createUser } from '../user/create'
import { z } from 'zod'

// 1) Esquema Zod para validar la forma final
const residentSchema = z.object({
  user: z.string().min(1, 'User ID is required'),
  teachers: z
    .array(z.string().min(1, 'Each teacher ID is required'))
    .optional(),
})

type ResidentRaw = z.infer<typeof residentSchema>

// 2) Server Action
export async function createResident(formData: FormData) {
  // 2.1) Conexión a BD
  await dbConnect()

  // 2.2) Extraer email del form
  const email = formData.get('email')?.toString()
  if (!email) {
    throw new Error('Email is required to create or link User')
  }

  // 2.3) Buscar User existente por email
  let user = await User.findOne({ email }).exec()

  if (!user) {
    // 2.4) Si no existe, crear nuevo User
    user = await createUser(formData)
    if (!user || !user._id) {
      throw new Error('Failed to create new User')
    }
  }

  // 2.5) Obtener el userId para asignar al Resident
  const userId = user._id.toString()

  // 2.6) Recopilar índices de teachers
  const teacherIdxs = new Set<number>()
  for (const key of formData.keys()) {
    const m = key.match(/^teachers\.(\d+)$/)
    if (m) teacherIdxs.add(Number(m[1]))
  }

  // 2.7) Construir array de teachers
  const teachers = Array.from(teacherIdxs)
    .sort((a, b) => a - b)
    .map((i) => {
      const t = formData.get(`teachers.${i}`)
      if (!t || typeof t !== 'string') {
        throw new Error(`Teacher ID at index ${i} is required`)
      }
      return t
    })

  // 2.8) Raw payload para Resident
  const raw: ResidentRaw = {
    user: userId,
    // teachers: teachers.length > 0 ? teachers : undefined,
  }

  // 3) Validación Zod
  const data = residentSchema.parse(raw)

  // 4) Crear documento Mongoose
  const doc = await Resident.create(data)

  console.log('Created resident', doc)
  // 5) Devolver POJO serializable
  return JSON.parse(JSON.stringify(doc))
}