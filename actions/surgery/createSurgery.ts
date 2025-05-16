'use server'

import { ISurgery, Surgery } from "@/models/Surgery"
import dbConnect from "@/lib/dbConnect"

export async function createSurgery(formData: FormData): Promise<ISurgery> {
    await dbConnect()

    const name = formData.get("name")
    const description = formData.get("description")
    const area = formData.get("areaId")

    // Parse the steps and osats from the form data
    // --- 2) Collect step‑indices, build `steps` array ---
    const steps: string[] = []

    for (const [key, value] of formData.entries()) {
    const match = key.match(/^steps\.(\d+)$/)
    if (match) {
        steps[Number(match[1])] = String(value)
    }
    }

    // --- 3) Collect osat‑indices, build `osats` array ---
    const osatIdxs = new Set<number>()
    for (const key of formData.keys()) {
        const m = key.match(/^osats\.(\d+)\./)
        if (m) osatIdxs.add(Number(m[1]))
    }
    const osats = Array.from(osatIdxs)
        .sort((a, b) => a - b)
        .map((i) => ({
        item:      String(formData.get(`osats.${i}.item`) ?? ''),
        maxPunctuation: Number(formData.get(`osats.${i}.maxPunctuation`) ?? 0),
        }))

    // --- 4) Rehydrate into the shape your Zod schema expects ---
    const raw = { name, description, area, steps, osats }

    // --- 6) Persist & return a POJO ---
    await dbConnect()
    const doc = await Surgery.create(raw)

    console.log("Created surgery", doc)
    return JSON.parse(JSON.stringify(doc))
}