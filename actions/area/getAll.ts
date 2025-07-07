'use server'

import dbConnect from "@/lib/dbConnect"
import { Area, IArea } from "@/models/Area"

export async function getAllAreas(): Promise<IArea[]> {
  await dbConnect()

  const areas = await Area.find({ deleted: false })
    .lean<IArea[]>()
    .exec()

  return JSON.parse(JSON.stringify(areas))
}
