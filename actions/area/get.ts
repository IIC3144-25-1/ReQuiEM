'use server'

import dbConnect from "@/lib/dbConnect"
import { Area, IArea } from "@/models/Area"

export async function getArea(id: string) {
    await dbConnect()

    const areas = await Area.findById(id).lean<IArea>().exec()

    return areas
}