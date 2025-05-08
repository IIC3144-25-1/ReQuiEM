'use server'

import { Area } from "@/models/Area"
import dbConnect from "@/lib/dbConnect"

export async function createArea(formData: FormData) {
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    await dbConnect()

    const area = new Area({
        name,
        description,
    })

    await area.save()

    return
}