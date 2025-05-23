// actions/resident/updateResident.ts
'use server'

import dbConnect from '@/lib/dbConnect'
import { IResident, Resident } from '@/models/Resident'
import { updateResidentArea } from '../area/updateResident'
import { User } from '@/models/User'
import { z } from 'zod'

// 1) Esquema Zod para validar los datos de actualización
const updateResidentSchema = z.object({
  _id: z.string().min(1, 'Resident ID is required'),
  email: z.string().email('Email inválido'),
  area: z.string().min(1, 'Area id')
})

export async function updateResident(formData: FormData): Promise<IResident> {
  // 2) Conectar a la base de datos
  await dbConnect()

  // 3) Extraer y validar datos crudos
  const residentId = formData.get('_id')?.toString() || ''
  const email     = formData.get('email')?.toString()    || ''
  const areaId = formData.get('areaId')?.toString() || ''

  if (!residentId) throw new Error('Resident ID (_id) es obligatorio')
  if (!email)      throw new Error('Email es obligatorio')
  if (!areaId)      throw new Error('Email es obligatorio')

  // 6) Validar con Zod
  const data = updateResidentSchema.parse({
    _id: residentId,
    email,
    area: areaId
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
    // { teachers: data.teachers },
  )

  const updated = await updateResidentArea(areaId, residentId)
  console.log('Residente actualizado:', updated)
  return JSON.parse(JSON.stringify(updated))
}
