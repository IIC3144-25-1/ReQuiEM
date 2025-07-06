'use server'

import { Surgery } from "@/models/Surgery"
import dbConnect from "@/lib/dbConnect"
import { revalidatePath } from "next/cache"

export async function deleteSurgery(surgeryId: string): Promise<void> {
    await dbConnect()
    if (!surgeryId) {
        throw new Error("Surgery ID is required")
    }

    await Surgery.findByIdAndUpdate(surgeryId, { deleted: true })


    revalidatePath("/admin/surgeries")
}