'use server'

import { User } from '@/models/User'
import dbConnect from '@/lib/dbConnect'
import { z } from 'zod'

// 1) Esquema Zod para validar los datos del usuario
const userSchema = z.object({
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

// 2) Server Action para crear un usuario
export async function createUser(formData: FormData) {
  await dbConnect()

  // 2.1) Extraer campos desde FormData
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

  // 3) Validación con Zod
  const data = userSchema.parse(raw)

  // 4) Conversión de campos (ej. fechas)
  const userToCreate = {
    ...data,
    emailVerified: data.emailVerified ? new Date(data.emailVerified) : undefined,
    birthdate: data.birthdate ? new Date(data.birthdate) : undefined,
  }

  // 5) Crear usuario en MongoDB
  const doc = await User.create(userToCreate)
  console.log('Created user:', doc)

  // 6) Retornar objeto serializable
  return JSON.parse(JSON.stringify(doc))
}
