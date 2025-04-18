// actions/resident/createResident.ts
'use server'

import { Resident } from '@/models/Resident'
import dbConnect from '@/lib/dbConnect'
import { z } from 'zod'

// 1) Esquema Zod para validar la forma final
const residentSchema = z.object({
  user: z.string().min(1, 'User ID is required'),
  teachers: z
    .array(z.string().min(1, 'Each teacher ID is required'))
    .optional(),
})

// 2) Server Action
export async function createResident(formData: FormData) {
  // 2.1) Conexión a BD
  await dbConnect()

  // 2.2) Extraer user
  const userId = formData.get('user')
  if (!userId || typeof userId !== 'string') {
    throw new Error('User ID is required')
  }

  // 2.3) Recopilar índices de teachers
  const teacherIdxs = new Set<number>()
  for (const key of formData.keys()) {
    const m = key.match(/^teachers\.(\d+)$/)
    if (m) teacherIdxs.add(Number(m[1]))
  }

  // 2.4) Construir array de teachers
  const teachers = Array.from(teacherIdxs)
    .sort((a, b) => a - b)
    .map((i) => {
      const t = formData.get(`teachers.${i}`)
      if (!t || typeof t !== 'string') {
        throw new Error(`Teacher ID at index ${i} is required`)
      }
      return t
    })

  // 2.5) Rehidratar objeto crudo
  const raw = {
    user: userId,
    teachers: teachers.length > 0 ? teachers : undefined,
  }

  // 3) Validación Zod
  const data = residentSchema.parse(raw)

  // 4) Crear documento Mongoose
  const doc = await Resident.create(data)

  console.log('Created resident', doc)
  // 5) Devolver POJO serializable
  return JSON.parse(JSON.stringify(doc))
}
