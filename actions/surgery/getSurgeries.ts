'use server'

import { ISurgery, Surgery } from "@/models/Surgery"
import dbConnect from "@/lib/dbConnect"

export async function getSurgeries() {
    await dbConnect()

    // Fetch all surgeries from the database
    const surgeries = await Surgery.find({}).sort({ createdAt: -1 }).lean<ISurgery[]>().exec()

    return surgeries
}