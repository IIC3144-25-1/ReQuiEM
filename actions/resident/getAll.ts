'use server'

import { Resident, IResident } from "@/models/Resident";
import dbConnect from "@/lib/dbConnect";
import { User } from "@/models/User";

// Función para obtener todos los residentes
export async function getAllResident(): Promise<IResident[]> {
  await dbConnect();

  const residents = await Resident.find()
    .where('deleted').equals(false)
    .populate({ path: 'user', model: User })
    .lean<IResident[]>()
    .exec();

  return JSON.parse(JSON.stringify(residents));
}

