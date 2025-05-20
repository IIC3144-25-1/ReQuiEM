'use server'

import { Record, IRecord} from '@/models/Record'
import dbConnect from '@/lib/dbConnect'

/**
 * Obtiene un registro por su ID
 * @param recordId  ObjectId del record
 * @returns IRecord | null
 */
export async function getRecordByID(recordId: string): Promise<IRecord | null> {
  await dbConnect()

  const record = await Record
    .findById(recordId)
    .populate('resident')      // trae info del residente
    .populate('teacher')  // trae info del profesor
    .populate('surgery')  // trae info de la cirugía
    .lean<IRecord>()
    .exec()

  // Si no existe, devolvemos null
  if (!record) return null

  // Para evitar problemas de serialización en Server Components
  return JSON.parse(JSON.stringify(record))
}
