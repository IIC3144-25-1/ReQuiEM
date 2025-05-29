'use server'

import { User, IUser } from "@/models/User"
import { Teacher } from "@/models/Teacher"
import { Resident } from "@/models/Resident"
import dbConnect from "@/lib/dbConnect"
import { auth } from "@/auth"

export type RoleInfo = {
  isAdmin: boolean
  role: 'teacher' | 'resident' | null
}

export async function getRole(): Promise<RoleInfo | null> {
  await dbConnect()
  const session = await auth()

  // Si no hay usuario autenticado
  if (!session?.user?.email) return null

  // Obtener usuario de la DB
  const user = await User
    .findOne({ email: session.user.email })
    .lean<IUser>()
    .exec()

  if (!user) return null

  // ¿Es administrador?
  const isAdmin = Boolean(user.admin)

  // Comprobamos si existe un Teacher o un Resident vinculado a este user._id
  const [isTeacher, isResident] = await Promise.all([
    Teacher.exists({ user: user._id, deleted: false }),
    Resident.exists({ user: user._id, deleted: false })
  ])

  // Determinar rol (solo docente o residente; si no, null)
  let role: 'teacher' | 'resident' | null = null
  if (isTeacher) role = 'teacher'
  else if (isResident) role = 'resident'

  return { isAdmin, role }
}
