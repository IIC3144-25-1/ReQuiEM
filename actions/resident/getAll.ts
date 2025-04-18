'use server'

import { Resident, IResident } from "@/models/Resident";
import dbConnect from "@/lib/dbConnect";

// Función para obtener todos los residentes
export async function getAllResident() {
  await dbConnect();

  // Obtener todos los residentes, incluyendo los datos relacionados si es necesario
  const residents = await Resident.find()
    .populate('user')        // Incluye información del usuario
    .populate('teachers')    // Incluye información de los profesores
    .lean<IResident[]>()
    .exec();

    return JSON.parse(JSON.stringify(residents));
}
