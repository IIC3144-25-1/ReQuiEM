'use server'

import { Resident, IResident } from '@/models/Resident'
import dbConnect from '@/lib/dbConnect'

/**
 * Obtiene un residente por su ID, incluyendo los datos de usuario y
 * profesores relacionados.
 * @param residentId  ObjectId del residente
 * @returns IResident | null
 */
export async function getResidentByID(residentId: string): Promise<IResident | null> {
  await dbConnect()

  const resident = await Resident
    .findById(residentId)
    .populate('user')      // trae info del usuario
    .populate('teachers')  // trae info de los profesores
    .lean<IResident>()
    .exec()

  // Si no existe, devolvemos null
  if (!resident) return null

  // Para evitar problemas de serialización en Server Components
  return JSON.parse(JSON.stringify(resident))
}
