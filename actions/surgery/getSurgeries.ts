'use server'

import { ISurgery, Surgery } from "@/models/Surgery"
import dbConnect from "@/lib/dbConnect"

export async function getSurgeries(): Promise<ISurgery[]> {
    await dbConnect()

    // Fetch all surgeries from the database
    const surgeries = await Surgery.find({}).sort({ createdAt: -1 }).populate('area').lean<ISurgery[]>().exec()

    return JSON.parse(JSON.stringify(surgeries))
}