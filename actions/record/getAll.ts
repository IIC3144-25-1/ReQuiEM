'use server'

import { Record, IRecord } from '@/models/Record'
import { Resident } from '@/models/Resident'
import { Teacher, ITeacher } from '@/models/Teacher'
import { IUser } from '@/models/User'
import { ISurgery, Surgery } from '@/models/Surgery'
import dbConnect from '@/lib/dbConnect'
import { User } from '@/models/User'

export async function getAllRecords() {
    await dbConnect()
    const records = await Record.find({})
        .populate({ 
            path: 'teacher',
            model: Teacher,
            populate: {
                path: 'user',
                model: User,
                select: 'name email'
            }
        })
        .populate({
            path: 'resident',
            model: Resident,
            populate: {
                path: 'user',
                model: User,
                select: 'name email'
            }
        })
        .populate({
            path: 'surgery',
            model: Surgery,
            select: 'name',
        })
        .sort({ updatedAt: -1 })
        .lean<IRecord[]>()
        .exec()
    
    // console.log("records", records)
    return records as (IRecord & {
        teacher: ITeacher & { user: IUser };
        surgery: ISurgery;
    })[];
}