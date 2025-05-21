'use server'

import dbConnect from "@/lib/dbConnect"
import { getCurrentUser } from "@/actions/user/getUser"
import { Resident } from "@/models/Resident"
import { Surgery } from "@/models/Surgery"


export async function getSurgeries() {
    await dbConnect()
    const surgerys = await Surgery.find()
    // const surgeryNames: string[] = []
    // surgerys.forEach((surgery) => {
    //     if (surgery.name) {
    //         surgeryNames.push(surgery.name)
    //     }
    // })
    return surgerys
}

export async function getTeachersAndSurgeries() {
    await dbConnect()

    const user = await getCurrentUser()
    console.log("user", user)
    if (!user) return null
    const resident = await Resident.findOne({ user: user._id })
        .populate({
            path: 'teachers',
            populate: {
                path: 'user',
                select: 'name',
            },
        })
    
    console.log("resident", resident)
    if (!resident) return null
    const teachers = resident.teachers
    
    // const areas = await Area.find({ residents: resident._id })
    // .populate({
    //     path: "teachers",
    //     populate: {
    //         path: "user",
    //         select: "name",
    //     },
    // });

    // const teachers: ITeacher[] = []

    // areas.forEach((area) => {
    //     area.teachers.forEach((teacher: ITeacher) => {
    //         teachers.push(teacher)
    //     });
    // });


    const surgeries = await Surgery.find()

    const teachersAndSurgerys = {
        teachers: teachers,
        surgeries: surgeries,
    }

    return teachersAndSurgerys
}
