'use server'

import { Resident, IResident } from '@/models/Resident'
import dbConnect from '@/lib/dbConnect'
import { User } from '@/models/User'

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
    .where('deleted').equals(false) // Aseguramos que no esté eliminado
    .populate({ path: 'user', model: User })      // trae info del usuario
    .lean<IResident>()
    .exec()

  // Si no existe, devolvemos null
  if (!resident) return null

  // Para evitar problemas de serialización en Server Components
  return JSON.parse(JSON.stringify(resident))
}
