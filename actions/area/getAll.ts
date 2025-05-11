'use server'

import dbConnect from "@/lib/dbConnect"
import { Area } from "@/models/Area"

export async function getAllAreas() {
  await dbConnect()

  const areas = await Area.find()
    .populate('teachers')
    .populate('residents')
    .lean()
    .exec()

  return JSON.parse(JSON.stringify(areas))
}
