'use server'

import { Teacher, ITeacher } from '@/models/Teacher'
import dbConnect from '@/lib/dbConnect'
import { Types } from 'mongoose'

export async function getTeacherByID(id: string): Promise<ITeacher | null> {
  await dbConnect()

  if (!Types.ObjectId.isValid(id)) {
    throw new Error('ID inválido')
  }
  const teacher = await Teacher.findById(id)
    .where('deleted').equals(false)
    .populate('user')
    .populate('area')
    .lean()
    .exec()

  return teacher ? JSON.parse(JSON.stringify(teacher)) : null
}
