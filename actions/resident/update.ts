// actions/resident/updateResident.ts
'use server'

import dbConnect from '@/lib/dbConnect'
import { IResident, Resident } from '@/models/Resident'
import { User } from '@/models/User'
import { z } from 'zod'
import { deleteResidentFromArea } from '../area/deleteResident'
import { addResidentToArea } from '../area/addResident'

// 1) Esquema Zod para validar datos de actualización
const updateResidentSchema = z.object({
  _id:   z.string().min(1, 'Resident ID is required'),
  name:  z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  area:  z.string().min(1, 'Area id'),
})

export async function updateResident(formData: FormData): Promise<IResident> {
  // 2) Conectar a la base de datos
  await dbConnect()

  // 3) Extraer y validar datos crudos
  const residentId = formData.get('_id')?.toString()   || ''
  const name       = formData.get('name')?.toString()?.trim() || ''
  const email      = formData.get('email')?.toString() || ''
  const areaId     = formData.get('areaId')?.toString()|| ''

  if (!residentId) throw new Error('Resident ID (_id) es obligatorio')
  if (!name)       throw new Error('Name es obligatorio')
  if (!email)      throw new Error('Email es obligatorio')
  if (!areaId)     throw new Error('Area es obligatoria')

  // 4) Validar con Zod, incluyendo name
  const data = updateResidentSchema.parse({
    _id:   residentId,
    name:  name,
    email: email,
    area:  areaId,
  })

  // 5) Actualizar el área del Residente
  const existing = await Resident.findByIdAndUpdate(
    data._id,
    { area: data.area },
    { new: true }
  )
  if (!existing) {
    throw new Error(`No se encontró Residente con id=${data._id}`)
  }

  // 6) Actualizar email **y** name en el modelo User
  await User.findByIdAndUpdate(
    existing.user,
    { 
      email: data.email,
      name:  data.name,
    },
    { new: true }
  )

  // 7) Sincronizar relación con el área
  await deleteResidentFromArea(data._id)
  await addResidentToArea(data.area, data._id)

  // 8) Devolver el residente actualizado
  return JSON.parse(JSON.stringify(existing))
}