'use server'

import { Record } from "@/models/Record"
import dbConnect from "@/lib/dbConnect"

export async function reviewRecord(formData: FormData) {
  await dbConnect()
  const recordId = formData.get('recordId')
  const teacherJudgment = formData.get('teacherJudgment')
  const summaryScale = formData.get('summaryScale')
  const feedback = formData.get('feedback')
  const status = 'corrected'

  const stepsIdxs = new Set<number>()
  for (const key of formData.keys()) {
    const m = key.match(/^steps\.(\d+)\./)
    if (m) stepsIdxs.add(Number(m[1]))
  }
  const osatsIdxs = new Set<number>()
  for (const key of formData.keys()) {
    const m = key.match(/^osats\.(\d+)\./)
    if (m) osatsIdxs.add(Number(m[1]))
  }

  const steps = Array.from(stepsIdxs)
    .sort((a, b) => a - b)
    .map((i) => ({
        name:         String(formData.get(`steps.${i}.name`) ?? ''),
        teacherDone: Boolean(formData.get(`steps.${i}.teacherDone`) === 'true'),
        score:        String(formData.get(`steps.${i}.score`) ?? 'n/a'),
    }))
  const osats = Array.from(osatsIdxs)
    .sort((a, b) => a - b)
    .map((i) => ({
        item:     String(formData.get(`osats.${i}.item`) ?? ''),
        obtained: Number(formData.get(`osats.${i}.obtained`) ?? 0),
    }))


  const raw = { teacherJudgment, summaryScale, feedback, steps, osats, status }
  console.log(raw)

  const doc = await Record.findByIdAndUpdate(
      recordId , 
      raw
  )

  return JSON.parse(JSON.stringify(doc))
}
    
    