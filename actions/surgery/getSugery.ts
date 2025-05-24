'use server'

import { ISurgery, Surgery } from "@/models/Surgery"
import dbConnect from "@/lib/dbConnect"

export async function getSurgery(surgeryId: string): Promise<ISurgery | null> {
    await dbConnect()

    // Fetch all surgeries from the database
    const surgery = await Surgery.findById(surgeryId).populate('area').lean<ISurgery>().exec()

    return JSON.parse(JSON.stringify(surgery))
}