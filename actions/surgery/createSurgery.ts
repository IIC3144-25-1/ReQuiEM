'use server'

import { Surgery } from "@/models/Surgery"
import dbConnect from "@/lib/dbConnect"
import { surgerySchema } from "@/app/(protected)/surgeryForm/surgeryForm"
import { z } from "zod"


export async function createSurgery(data: z.infer<typeof surgerySchema>) {
    await dbConnect()

    // Create a new surgery object
    const newSurgery = new Surgery({
        name: data.name,
        description: data.description,
        area: data.area,
        steps: data.steps.map((step) => ({
            name: step.name,
            description: step.description,
            guideline: {
                name: step.guideline.name,
                description: step.guideline.description,
                maxRating: Number(step.guideline.maxRating),
            },
        })),
    })

    // Save the surgery to the database
    await newSurgery.save()

    return newSurgery
}