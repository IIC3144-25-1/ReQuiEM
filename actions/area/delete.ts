'use server'

import { Area } from "@/models/Area"
import dbConnect from "@/lib/dbConnect"
import { revalidatePath } from "next/cache"

export async function deleteArea(areaId: string) {
    await dbConnect()

    await Area.findByIdAndDelete(areaId)

    console.log("Deleted Area", areaId)

    revalidatePath("/admin/surgeries")
}