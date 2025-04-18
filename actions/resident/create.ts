'use server'

import { Resident } from "@/models/Resident";
import dbConnect from "@/lib/dbConnect";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const residentSchema = z.object({
  user: z.string(),
  teachers: z.array(z.string()).optional(),
  specialty: z.string().optional(),
  year: z.number().optional(),
});

export async function createResident(data: z.infer<typeof residentSchema>) {
  const newResident = new Resident({
    user: data.user,
    teachers: data.teachers || [],
    specialty: data.specialty,
    year: data.year,
  });

  await dbConnect();
  const savedResident = await Resident.create(newResident);
  console.log("savedResident", savedResident);
  return savedResident;
}
