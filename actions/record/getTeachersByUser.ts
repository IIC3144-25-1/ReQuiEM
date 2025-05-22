'use server'

import dbConnect from "@/lib/dbConnect"
import { getCurrentUser } from "@/actions/user/getUser"
import { Resident } from "@/models/Resident"
import { Area } from "@/models/Area"
import { ITeacher } from "@/models/Teacher"


export async function getTeachersByUser() {
    await dbConnect()

    const user = await getCurrentUser()
    if (!user) return null
    // console.log("user", user)

    const resident = await Resident.findOne({ user: user._id })
    // console.log("residents", resident)
    
    const areas = await Area.find({ residents: { $in: [resident._id] } })
        .populate({
            path: "teachers",
            populate: {
                path: "user",
                select: "name",
            },
        });
    console.log("areas", areas)

    const teachers: ITeacher[] = []
    areas.forEach((area) => {
        area.teachers.forEach((teacher: ITeacher) => {
            teachers.push(teacher)
        });
    });
    // console.log("teachers", teachers)

    return teachers
}
