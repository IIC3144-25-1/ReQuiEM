'use server'

import { Record } from '@/models/Record'
import dbConnect from '@/lib/dbConnect'
import { revalidatePath } from "next/cache"

export async function deleteRecord(recordId: string): Promise<void> {
    await dbConnect()

    await Record.findByIdAndUpdate(recordId, { deleted: true })

    revalidatePath("/admin/records")
}