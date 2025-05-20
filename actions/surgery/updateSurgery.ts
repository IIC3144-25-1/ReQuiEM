'use server'

import { Surgery } from "@/models/Surgery"
import dbConnect from "@/lib/dbConnect"

export async function updateSurgery(formData: FormData) {
    await dbConnect()

    const name = formData.get("name")
    const description = formData.get("description")
    const area = formData.get("area")
    const surgeryId = formData.get("surgeryId")?.toString()

    if (!surgeryId) {
        throw new Error("Surgery ID is required")
    }

    // Parse the steps and osats from the form data
    // --- 2) Collect step‑indices, build `steps` array ---
    const stepIdxs = new Set<number>()
    for (const key of formData.keys()) {
        const m = key.match(/^steps\.(\d+)\./)
        if (m) stepIdxs.add(Number(m[1]))
    }
    const steps = Array.from(stepIdxs)
        .sort((a, b) => a - b)
        .map((i) => ({
        name:        String(formData.get(`steps.${i}.name`) ?? ''),
        description: String(formData.get(`steps.${i}.description`) ?? ''),
        guideline: {
            name:      String(formData.get(`steps.${i}.guideline.name`) ?? ''),
            maxRating: formData.get(`steps.${i}.guideline.maxRating`)
            ? Number(formData.get(`steps.${i}.guideline.maxRating`))
            : undefined,
        },
        }))

    // --- 3) Collect osat‑indices, build `osats` array ---
    const osatIdxs = new Set<number>()
    for (const key of formData.keys()) {
        const m = key.match(/^osats\.(\d+)\./)
        if (m) osatIdxs.add(Number(m[1]))
    }
    const osats = Array.from(osatIdxs)
        .sort((a, b) => a - b)
        .map((i) => ({
        name:      String(formData.get(`osats.${i}.name`) ?? ''),
        description: String(formData.get(`osats.${i}.description`) ?? ''),
        maxRating: formData.get(`osats.${i}.maxRating`)
            ? Number(formData.get(`osats.${i}.maxRating`))
            : undefined,
        }))

    // --- 4) Rehydrate into the shape your Zod schema expects ---
    const raw = { name, description, area, steps, osats }

    // --- 6) Persist & return a POJO ---
    const doc = await Surgery.findByIdAndUpdate(
        surgeryId, 
        raw
    )

    console.log("Updated surgery surgery", doc)
    return JSON.parse(JSON.stringify(doc))
}