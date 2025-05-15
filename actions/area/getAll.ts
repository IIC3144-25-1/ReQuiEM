'use server'

import dbConnect from "@/lib/dbConnect"
import { Area, IArea } from "@/models/Area"

export async function getAllAreas() {
  await dbConnect()

  const areas = await Area.find()
    .populate("residents")
    .populate("teachers")
    .lean<IArea>()
    .exec()

  return JSON.parse(JSON.stringify(areas))
}
