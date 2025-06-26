'use server'

import { Record, IRecord} from '@/models/Record'
import dbConnect from '@/lib/dbConnect'
import { Surgery } from '@/models/Surgery';
import { Resident } from '@/models/Resident';
import { User } from '@/models/User';

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
      model: Resident,
      populate: { path: 'user', model: User }
    })
    .populate({
      path: 'teacher',
      populate: { path: 'user', model: User }
    })
    .populate({
      path: 'surgery', 
      model: Surgery,
    })
    .lean<IRecord>()
    .exec();
  
  // console.log("\n Record found:", record);

  if (!record) return null;

  return JSON.parse(JSON.stringify(record));
}

