'use server'

import { Record } from "@/models/Record"
import dbConnect from "@/lib/dbConnect"

export async function reviewRecord(formData: FormData) {
  await dbConnect()
  const recordId = formData.get('recordId')
  const record = await Record.findById(recordId)
  if (!record) throw new Error('Record not found')

  record.teacherJudgment = formData.get('teacherJudgment')
  record.summaryScale = formData.get('summaryScale')
  record.feedback = formData.get('feedback')
  record.status = 'corrected'

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

  for (let i = 0; i < record.steps.length; i++) {
    const newStep = steps.find(s => s.name === record.steps[i].name)
    if (newStep) {
      record.steps[i].teacherDone = newStep.teacherDone
      record.steps[i].score = newStep.score
    }
  }
  
  for (let i = 0; i < record.osats.length; i++) {
    const newOsat = osats.find(o => o.item === record.osats[i].item)
    if (newOsat) {
      record.osats[i].obtained = newOsat.obtained
    }
  }

  await record.save()
  // console.log("Record reviewed successfully:", record)
  return JSON.parse(JSON.stringify(record))
}

