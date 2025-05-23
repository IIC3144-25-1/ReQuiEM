'use server'

import { Record } from "@/models/Record"
import dbConnect from "@/lib/dbConnect"

export async function completeRecord(formData: FormData) {
    await dbConnect()
    const recordId = formData.get('recordId')
    const residentJudgment = formData.get('residentJudgment')
    const residentComment = formData.get('residentComment')

    const stepsIdxs = new Set<number>()
    for (const key of formData.keys()) {
        const m = key.match(/^steps\.(\d+)\./)
        if (m) stepsIdxs.add(Number(m[1]))
    }

    const steps = Array.from(stepsIdxs)
        .sort((a, b) => a - b)
        .map((i) => ({
            name:      String(formData.get(`steps.${i}.name`) ?? ''),
            residentDone: Boolean(formData.get(`steps.${i}.residentDone`) === 'true'),
        }))

    const raw = { residentJudgment, residentComment, steps }
    console.log(raw)

    const doc = await Record.findByIdAndUpdate(
        recordId , 
        raw
    )

    return JSON.parse(JSON.stringify(doc))
}
    
    