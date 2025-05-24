'use server'

import { Area } from "@/models/Area"
import dbConnect from "@/lib/dbConnect"

export async function updateArea(formData: FormData): Promise<void> {
    const id = formData.get('areaId') as string
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    await dbConnect()

    await Area.findByIdAndUpdate(
        id,
        {
            name,
            description,
        })

    return
}