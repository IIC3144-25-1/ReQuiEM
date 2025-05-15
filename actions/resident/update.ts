// actions/resident/updateResident.ts
'use server'

import dbConnect from '@/lib/dbConnect'
import { Resident } from '@/models/Resident'
import { User } from '@/models/User'
import { z } from 'zod'

// 1) Esquema Zod para validar los datos de actualización
const updateResidentSchema = z.object({
  _id: z.string().min(1, 'Resident ID is required'),
  email: z.string().email('Email inválido'),
  // teachers: z
  //   .array(z.string().min(1, 'Cada Teacher ID es requerido'))
  //   .min(1, 'Se requiere al menos un profesor'),
})

export async function updateResident(formData: FormData) {
  // 2) Conectar a la base de datos
  await dbConnect()

  // 3) Extraer y validar datos crudos
  const residentId = formData.get('_id')?.toString() || ''
  const email     = formData.get('email')?.toString()    || ''

  if (!residentId) throw new Error('Resident ID (_id) es obligatorio')
  if (!email)      throw new Error('Email es obligatorio')

  // 4) Recopilar índices de teachers.* 
  const teacherIdxs = new Set<number>()
  for (const key of formData.keys()) {
    const m = key.match(/^teachers\.(\d+)$/)
    if (m) teacherIdxs.add(Number(m[1]))
  }

  // 5) Construir array de teachers
  const teachers = Array.from(teacherIdxs)
    .sort((a, b) => a - b)
    .map((i) => {
      const t = formData.get(`teachers.${i}`)
      if (!t || typeof t !== 'string') {
        throw new Error(`Teacher ID en índice ${i} es requerido`)
      }
      return t
    })

  // 6) Validar con Zod
  const data = updateResidentSchema.parse({
    _id: residentId,
    email,
    // teachers,
  })

  // 7) Buscar el residente para obtener su userId
  const existing = await Resident.findById(data._id)
  if (!existing) {
    throw new Error(`No se encontró Residente con id=${data._id}`)
  }

  // 8) Actualizar email en el modelo User
  await User.findByIdAndUpdate(
    existing.user,
    { email: data.email },
    { new: true }
  )

  // 9) Actualizar teachers en el modelo Resident
  const updated = await Resident.findByIdAndUpdate(
    data._id,
    { new: true }
    // { teachers: data.teachers },
  )

  if (!updated) {
    throw new Error(`Error al actualizar Residente con id=${data._id}`)
  }

  console.log('Residente actualizado:', updated)
  return JSON.parse(JSON.stringify(updated))
}
