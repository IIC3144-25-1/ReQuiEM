'use server'

import dbConnect from "@/lib/dbConnect"
import { Area, IArea } from "@/models/Area"

export async function getAreas(){
    await dbConnect()

    const areas = await Area.find().populate('teachers').populate('residents').lean<IArea[]>().exec()

    return areas
}