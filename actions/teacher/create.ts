// 'use server'

// import { Teacher } from "@/models/Teacher";
// import dbConnect from "@/lib/dbConnect";
// import mongoose from "mongoose";

// interface CreateTeacherInput {
//   user: string;
// }

// export async function createTeacher(data: CreateTeacherInput) {
//   await dbConnect();

//   if (!mongoose.Types.ObjectId.isValid(data.user)) {
//     throw new Error("ID de usuario inválido");
//   }

//   const newTeacher = new Teacher({
//     user: new mongoose.Types.ObjectId(data.user),
//   });

//   const savedTeacher = await Teacher.create(newTeacher);

//   return savedTeacher;
// }


'use server'

import { Teacher } from '@/models/Teacher'
import dbConnect from '@/lib/dbConnect'
import { z } from 'zod'
import { createUser } from '../user/create'

// 1) Esquema Zod para validar los campos de usuario (reutilizado)
const teacherUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Debe ser un email válido'),
  image: z.string().optional(),
  emailVerified: z.string().optional(),
  rut: z.string().optional(),
  phone: z.string().optional(),
  birthdate: z.string().optional(),
  area: z.string().optional(),
  admin: z.boolean().optional(),
})

// 2) Server Action para crear un profesor
export async function createTeacher(formData: FormData) {
  // 2.1) Conectar a la base de datos
  await dbConnect()

  // 2.2) Construir el objeto raw para el usuario
  const raw = {
    name: formData.get('name')?.toString() || undefined,
    email: formData.get('email')?.toString() || '',
    image: formData.get('image')?.toString() || undefined,
    emailVerified: formData.get('emailVerified')?.toString() || undefined,
    rut: formData.get('rut')?.toString() || undefined,
    phone: formData.get('phone')?.toString() || undefined,
    birthdate: formData.get('birthdate')?.toString() || undefined,
    area: formData.get('area')?.toString() || undefined,
    admin: formData.get('admin') === 'true',
  }

  // 2.3) Validar los datos del usuario
  // const userData = teacherUserSchema.parse(raw)

  // 2.4) Crear usuario con la acción correspondiente
  const createdUser = await createUser(formData)
  const userId = createdUser._id

  if (!userId) throw new Error('No se pudo obtener el ID del usuario creado')

  // 2.5) Crear profesor con referencia al usuario
  const teacher = await Teacher.create({ user: userId })
  console.log('Created teacher', teacher)

  // 2.6) Retornar objeto serializable
  return JSON.parse(JSON.stringify(teacher))
}