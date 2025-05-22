'use client'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { ITeacher } from '@/models/Teacher'
import { createTeacher } from '@/actions/teacher/create'
import { updateTeacher } from '@/actions/teacher/update'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getAllAreas } from '@/actions/area/getAll'
import { getTeacherByID } from '@/actions/teacher/getByID'
import { Skeleton } from '@/components/ui/skeleton'
import { IArea } from '@/models/Area'

const teacherFormSchema = z.object({
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

type TeacherFormValues = z.infer<typeof teacherFormSchema>

type Props = {
  id?: string
}

export function TeacherForm({ id }: Props) {
  const router = useRouter()
  const [teacher, setTeacher] = useState<ITeacher | null>(null)
  const [areas, setAreas] = useState<{ _id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)

  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherFormSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      email: '',
      area: '',
      admin: false,
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        if (id && id !== 'new') {
          const t = await getTeacherByID(id)
          setTeacher(t)

          form.reset({
            name: t?.user?.name || '',
            email: t?.user?.email || '',
            area: t?.area?._id?.toString() || '',
            admin: t?.user?.admin ?? false,
          })
        }
        const allAreas = await getAllAreas()
        setAreas(
          allAreas.map((a: IArea) => ({
            _id: a._id.toString(),
            name: a.name,
          }))
        )
      } catch (err) {
        console.error('Error al cargar datos:', err)
        toast.error('Error al cargar datos')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, form])

  async function onSubmit(values: TeacherFormValues) {
    try {
      const formData = new FormData()
      formData.append('name', values.name || '')
      formData.append('email', values.email)
      if (values.area) {
        formData.append('area', values.area)
      }
      formData.append('admin', String(values.admin))

      if (teacher?.user?._id) {
        formData.append('user', teacher.user._id.toString())
      }

      if (teacher?._id) {
        formData.append('_id', teacher._id.toString())
        await updateTeacher(formData)
        toast.success('Profesor actualizado correctamente')
      } else {
        await createTeacher(formData)
        toast.success('Profesor creado correctamente')
      }

      router.refresh()
      router.push('/admin/teacher')
    } catch (err) {
      console.error('Error en formulario de teacher:', err)
      toast.error('Ocurrió un error al guardar')
    }
    form.reset()
  }

  if (loading) {
    return <Skeleton className="h-96 w-full max-w-lg" />
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
        {teacher?.user && (
          <input type="hidden" name="user" value={teacher.user._id.toString()} />
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Nombre completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email@dominio.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="area"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Área</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="w-full p-2 border rounded-md bg-white text-sm"
                >
                  <option value="">Selecciona un área</option>
                  {areas.map((area) => (
                    <option key={area._id} value={area._id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="admin"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel>Administrador</FormLabel>
            </FormItem>
          )}
        />

        <div className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/admin/teacher">Cancelar</Link>
          </Button>
          <Button type="submit">
            {teacher?._id ? 'Actualizar Profesor' : 'Crear Profesor'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
