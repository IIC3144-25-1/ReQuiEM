'use server'

import { ISurgery, Surgery } from "@/models/Surgery"
import dbConnect from "@/lib/dbConnect"
import { Area } from "@/models/Area"

export async function getSurgeries(): Promise<ISurgery[]> {
    await dbConnect()

    // Ensure the Area model is connected to the database
    // This is just to ensure the Area model is connected, as it is used in the populate method.
    await Area.find()

    // Fetch all surgeries from the database
    const surgeries = await Surgery
        .find({deleted: false})
        .sort({ createdAt: -1 })
        .populate({
            path: "area",
            model: Area
        })
        .lean<ISurgery[]>()
        .exec()

    return JSON.parse(JSON.stringify(surgeries))
}