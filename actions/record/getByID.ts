'use server'

import { Record, IRecord} from '@/models/Record'
import dbConnect from '@/lib/dbConnect'

/**
 * Obtiene un registro por su ID
 * @param recordId  ObjectId del record
 * @returns IRecord | null
 */
export async function getRecordByID(recordId: string): Promise<IRecord | null> {
  await dbConnect();
  // console.log("\n Getting record by ID:", recordId);
  const record = await Record
    .findById(recordId)
    .populate({
      path: 'resident',
      populate: { path: 'user' }
    })
    .populate({
      path: 'teacher',
      populate: { path: 'user' }
    })
    .populate({
      path: 'surgery',
      populate: { path: 'name' }
    })
    .lean<IRecord>()
    .exec();
  
  // console.log("\n Record found:", record);

  if (!record) return null;

  return JSON.parse(JSON.stringify(record));
}

