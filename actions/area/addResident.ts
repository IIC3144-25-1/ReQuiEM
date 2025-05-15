'use server'

import { Area } from "@/models/Area"
import dbConnect from "@/lib/dbConnect"
import { Resident } from "@/models/Resident"

export async function addResidentToArea(areaId: string, residentId: string): Promise<void> {
    await dbConnect()

    const area = await Area.findById(areaId);
  const resident = await Resident.findById(residentId);

  if (!area || !resident) {
    throw new Error("Area or Resident not found");
  }

  // Avoid adding the resident again if already present
  const isAlreadyResident = area.residents.some(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (r : any) => r.toString() === resident._id.toString()
  );

  if (!isAlreadyResident) {
    area.residents.push(resident._id);
    await area.save();
  }

  return;
}