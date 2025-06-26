'use server'

import { Teacher, ITeacher } from '@/models/Teacher'
import dbConnect from '@/lib/dbConnect'
import { Types } from 'mongoose'
import { Area } from '@/models/Area'
import { User } from '@/models/User'

export async function getTeacherByID(id: string): Promise<ITeacher | null> {
  await dbConnect()

  if (!Types.ObjectId.isValid(id)) {
    throw new Error('ID inválido')
  }
  const teacher = await Teacher.findById(id)
    .where('deleted').equals(false)
    .populate({ path: 'user', model: User })
    .populate({ path: 'area', model: Area })
    .lean()
    .exec()

  return teacher ? JSON.parse(JSON.stringify(teacher)) : null
}

export async function getTeacherByUserID(userId: string): Promise<ITeacher | null> {
  await dbConnect()

  if (!Types.ObjectId.isValid(userId)) {
    throw new Error('ID inválido')
  }
  
  const teacher = await Teacher.findOne({ user: userId })
    .where('deleted').equals(false)
    .populate({ path: 'user', model: User })
    .populate({ path: 'area', model: Area })
    .lean()
    .exec()

  return teacher ? JSON.parse(JSON.stringify(teacher)) : null
}
