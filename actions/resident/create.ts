'use server'

import { IResident, Resident } from "@/models/Resident";
import dbConnect from "@/lib/dbConnect";


export async function createResident(data: IResident) {
  const newResident = new Resident({
    user: data.user,
    teachers: data.teachers || [],
  });

  await dbConnect();
  const savedResident = await Resident.create(newResident);
  console.log("savedResident", savedResident);
  return savedResident;
}
