'use server'

import { Record } from "@/models/Record"
import dbConnect from "@/lib/dbConnect"

export async function updateStatus(recordId: string) {
  await dbConnect()
  const record = await Record.findById(recordId)
  if (!record) throw new Error('Record not found')

  if (record.status === "corrected"){
    await Record.findByIdAndUpdate(
      recordId,
      { status: "reviewed" },
      { timestamps: false }
    );
  }
  return
}
