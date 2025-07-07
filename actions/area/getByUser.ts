'use server'

import dbConnect from "@/lib/dbConnect"
import { getCurrentUser } from "@/actions/user/getUser"
import { Resident } from "@/models/Resident"
import { Area } from "@/models/Area"
import { Teacher } from "@/models/Teacher"
import { User } from "@/models/User"

export async function getArea() {
    await dbConnect()

    const user = await getCurrentUser()
    if (!user) return null
    // console.log("user", user)

    let role = await Resident.findOne({ user: user._id })
    if (!role) role = await Teacher.findOne({ user: user._id })
    // console.log("role", role)
    
    // podría cambiar a findAll
    const area = await Area.findOne({ $or: [{ residents: { $in: [role._id] } },{ teachers: { $in: [role._id] } }]})
      .populate([
        {
          path: "teachers",
          model: Teacher,
          populate: {
            path: "user",
            model: User,
            select: "name email image",
          },
        },
        {
          path: "residents",
          model: Resident,
          populate: {
            path: "user",
            model: User,
            select: "name email image",
          },
        },
      ]);

    return area
}
