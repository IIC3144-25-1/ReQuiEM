'use server'

import { Resident, IResident } from "@/models/Resident";
import dbConnect from "@/lib/dbConnect";

// Función para obtener todos los residentes
export async function getAllResident(): Promise<IResident[]> {
  await dbConnect();

  const residents = await Resident.find()
    .populate('user')
    .populate('teachers')
    .lean<IResident[]>()
    .exec();

  return JSON.parse(JSON.stringify(residents));
}

