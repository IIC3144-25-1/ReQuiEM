'use server'

import { Teacher } from "@/models/Teacher"
import { Resident } from "@/models/Resident"
import { Area } from "@/models/Area"
import { User } from "@/models/User"
import dbConnect from "@/lib/dbConnect"
import { getCurrentUser } from "./getUser"

export type RoleInfo = {
  isAdmin: boolean
  role: 'teacher' | 'resident' | null
}

export async function getRole(): Promise<RoleInfo | null> {
  await dbConnect()
  const user = await getCurrentUser()
  if (!user) return null

  const isAdmin = Boolean(user.admin)
  const [isTeacher, isResident] = await Promise.all([
    Teacher.exists({ user: user._id, deleted: false }),
    Resident.exists({ user: user._id, deleted: false })
  ])

  let role: 'teacher' | 'resident' | null = null
  if (isTeacher) role = 'teacher'
  else if (isResident) role = 'resident'

  return { isAdmin, role }
}


export async function getRoleAndArea(userId: string) {
  await dbConnect();
  const user = await User.findById(userId)
  if (!user) return null;

  const isAdmin = Boolean(user.admin);
  let role = await Resident.findOne({ user: user._id });
  let strRole: "Residente" | "Profesor" | null = null;

  if (!role) {
    role = await Teacher.findOne({ user: user._id });
    if (role) strRole = "Profesor";
  } else {
    strRole = "Residente";
  }

  if (!role) return { isAdmin, strRole: null, area: null };

  const area = await Area.findOne({
    $or: [
      { residents: { $in: [role._id] } },
      { teachers: { $in: [role._id] } }
    ]
  });

  return {
    isAdmin: isAdmin,
    strRole: strRole,
    area: area?.name || "",
  };
}
