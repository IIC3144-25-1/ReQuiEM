'use server'

import { Record, IRecord } from '@/models/Record'
import { Resident } from '@/models/Resident'
import { Teacher, ITeacher } from '@/models/Teacher'
import { IUser } from '@/models/User'
import { ISurgery, Surgery } from '@/models/Surgery'
import dbConnect from '@/lib/dbConnect'
import { getCurrentUser } from '../user/getUser'
import { User } from '@/models/User'

/**
 * Obtiene los registros de un residente por su ID.
 * @param residentId  ObjectId del residente
 * @returns IRecord[] | null
 */
export async function getRecordsByCurrentUser( side: "resident" | "teacher" ) {
    await dbConnect()

    const user = await getCurrentUser()
    if (!user) return null
    if (side === "resident") {
        return await getRecordsByResident(user?._id)
    } else if (side === "teacher") {
        return await getRecordsByTeacher(user?._id)
    }
}

async function getRecordsByResident(userId: object) {
    const resident = await Resident.findOne({ user: userId })
    // console.log("resident", resident)
    const records = await Record.find({ resident: resident?._id })
        .populate({ 
            path: 'teacher',
            model: Teacher,
            populate: {
                path: 'user',
                model: User,
                select: 'name'
            }
        })
        .populate({
            path: 'resident',
            model: Resident,
            populate: {
                path: 'user',
                model: User,
                select: 'name'
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

async function getRecordsByTeacher(userId: object) {
    const teacher = await Teacher.findOne({ user: userId })
    const records = await Record.find({
        teacher: teacher?._id,
        steps: { $exists: true, $ne: [] }
    })
        .populate({
            path: 'resident',
            model: Resident,
            populate: {
                path: 'user',
                model: User,   
                select: 'name'
            }
        })
        .populate({
            path: 'surgery',
            model: Surgery,
            select: 'name',
        })
        .sort({ createdAt: -1 })
        .lean<IRecord[]>()
        .exec()
    return records
}