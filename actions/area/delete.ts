'use server'

import { Area } from "@/models/Area"
import dbConnect from "@/lib/dbConnect"
import { revalidatePath } from "next/cache"

export async function deleteArea(areaId: string): Promise<void> {
    await dbConnect()

    await Area.findByIdAndUpdate(areaId, { deleted: true })

    console.log("Deleted Area", areaId)

    revalidatePath("/admin/surgeries")
}