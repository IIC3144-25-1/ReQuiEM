// actions/resident/updateResident.ts
'use server'

import { Resident } from '@/models/Resident'
import dbConnect from '@/lib/dbConnect'
import { z } from 'zod'

// 1) Esquema Zod para validar los datos de actualización
const updateResidentSchema = z.object({
  _id: z.string().min(1, 'Resident ID is required'),
  user: z.string().min(1, 'User ID is required'),
  teachers: z
    .array(z.string().min(1, 'Each teacher ID is required'))
    .min(1, 'At least one teacher is required'),
})

/**
 * Server Action para actualizar un residente.
 * Recibe un FormData con:
 *  - _id        (string)
 *  - user       (string)
 *  - teachers.0 (string)
 *  - teachers.1 (string)
 *  - …etc.
 */
export async function updateResident(formData: FormData) {
  // 2) Conectar a la base de datos
  await dbConnect()

  // 3) Extraer el ID del residente
  const residentId = formData.get('_id')
  if (!residentId || typeof residentId !== 'string') {
    throw new Error('Resident ID (_id) is required')
  }

  // 4) Extraer el user
  const userId = formData.get('user')
  if (!userId || typeof userId !== 'string') {
    throw new Error('User ID is required')
  }

  // 5) Recopilar índices de teachers
  const teacherIdxs = new Set<number>()
  for (const key of formData.keys()) {
    const m = key.match(/^teachers\.(\d+)$/)
    if (m) teacherIdxs.add(Number(m[1]))
  }

  // 6) Construir el array de teachers
  const teachers = Array.from(teacherIdxs)
    .sort((a, b) => a - b)
    .map((i) => {
      const t = formData.get(`teachers.${i}`)
      if (!t || typeof t !== 'string') {
        throw new Error(`Teacher ID at index ${i} is required`)
      }
      return t
    })

  // 7) Rehidratar el objeto crudo y validar con Zod
  const raw = { _id: residentId, user: userId, teachers }
  const data = updateResidentSchema.parse(raw)

  // 8) Ejecutar la actualización
  const updated = await Resident.findByIdAndUpdate(
    data._id,
    { user: data.user, teachers: data.teachers },
    { new: true }
  )

  if (!updated) {
    throw new Error(`Resident with id=${data._id} not found`)
  }

  console.log('Updated resident', updated)
  // 9) Devolver un POJO serializable
  return JSON.parse(JSON.stringify(updated))
}
