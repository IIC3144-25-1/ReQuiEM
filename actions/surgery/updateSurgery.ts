'use server'

import { ISurgery, Surgery } from "@/models/Surgery"
import dbConnect from "@/lib/dbConnect"

export async function updateSurgery(formData: FormData): Promise<ISurgery> {
    await dbConnect()

    const name = formData.get("name")
    const description = formData.get("description")
    const area = formData.get("areaId")
    const surgeryId = formData.get("surgeryId")?.toString()

    if (!surgeryId) {
        throw new Error("Surgery ID is required")
    }

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
    .map((i) => {
      const item = String(formData.get(`osats.${i}.item`) ?? '')
      const rawScale = JSON.parse(String(formData.get(`osats.${i}.scale`))) ?? []

      // Normalize the scale
      const scaleMap = new Map<number, string>()
      const punctuations: number[] = []

      for (const entry of rawScale) {
        const p = Number(entry.punctuation)
        if (!Number.isNaN(p)) {
          scaleMap.set(p, entry.description ?? '')
          punctuations.push(p)
        }
      }

      const min = Math.min(...punctuations)
      const max = Math.max(...punctuations)

      const completeScale = []
      for (let p = min; p <= max; p++) {
        completeScale.push({
          punctuation: String(p),
          description: scaleMap.get(p) ?? '',
        })
      }

      return { item, scale: completeScale }
    })

    // --- 4) Rehydrate into the shape your Zod schema expects ---
    const raw = { name, description, area, steps, osats }

    // --- 6) Persist & return a POJO ---
    const doc = await Surgery.findByIdAndUpdate(
        surgeryId, 
        raw
    )

    return JSON.parse(JSON.stringify(doc))
}