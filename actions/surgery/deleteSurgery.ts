'use server'

import { Surgery } from "@/models/Surgery"
import dbConnect from "@/lib/dbConnect"
import { revalidatePath } from "next/cache"

export async function deleteSurgery(surgeryId: string): Promise<void> {
    await dbConnect()

    await Surgery.findByIdAndDelete(surgeryId)

    console.log("Deleted surgery", surgeryId)

    revalidatePath("/admin/surgeries")
}