'use client'

import { useState, useEffect } from 'react'
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
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { ITeacher } from '@/models/Teacher'
import { createResident } from '@/actions/resident/create'
import { updateResident } from '@/actions/resident/update'
import { getAllTeachers } from '@/actions/teacher/getAll'
import { getResidentByID } from '@/actions/resident/getByID'

// Esquema Zod para validar email y lista de profesores
const residentFormSchema = z.object({
  email: z.string().email('Email inválido'),
  teachers: z.array(z.string().min(1, 'Seleccione al menos un profesor')).min(1, 'Requiere al menos un profesor'),
})

type ResidentFormValues = z.infer<typeof residentFormSchema>

type Props = { id?: string }

export function ResidentForm({ id }: Props) {
  const router = useRouter()
  const [allTeachers, setAllTeachers] = useState<ITeacher[]>([])
  const [loading, setLoading] = useState(true)

  const form = useForm<ResidentFormValues>({
    resolver: zodResolver(residentFormSchema),
    defaultValues: { email: '', teachers: [] },
  })

  // Cargar datos iniciales: lista de profesores y, si hay ID, datos del residente
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const teachers = await getAllTeachers()
        setAllTeachers(teachers)

        if (id && id !== 'new') {
          const resident = await getResidentByID(id)
          form.reset({
            email: resident?.user.email || '',
            teachers: resident?.teachers.map(t => t._id.toString()),
          })
        }
      } catch (error) {
        console.error('Error al cargar datos:', error)
        toast.error('Error al cargar datos')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, form])

  // Enviar formulario
  async function onSubmit(values: ResidentFormValues) {
    try {
      const formData = new FormData()
      formData.append('email', values.email)
      values.teachers.forEach((t, i) => formData.append(`teachers.${i}`, t))

      if (id && id !== 'new') {
        formData.append('_id', id)
        await updateResident(formData)
        toast.success('Residente actualizado correctamente')
      } else {
        await createResident(formData)
        toast.success('Residente creado correctamente')
      }

      router.refresh()
      router.push('/admin/resident')
    } catch (err) {
      console.error('Error en formulario residente:', err)
      toast.error('Ocurrió un error al guardar')
    }
  }

  if (loading) {
    return <Skeleton className="h-96 w-full max-w-lg" />
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
        {/* Email del residente */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Residente</FormLabel>
              <FormControl>
                <Input placeholder="email@dominio.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Checkboxes para seleccionar profesores */}
        <FormField
          control={form.control}
          name="teachers"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profesores</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  {allTeachers.map((t) => {
                    const idStr = t._id.toString()
                    const checked = field.value.includes(idStr)
                    return (
                      <label key={idStr} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value={idStr}
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              field.onChange([...field.value, idStr])
                            } else {
                              field.onChange(field.value.filter((v) => v !== idStr))
                            }
                          }}
                          className="h-4 w-4 border-gray-300 rounded"
                        />
                        <span>{t.user.email}</span>
                      </label>
                    )
                  })}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit">
            {id && id !== 'new' ? 'Actualizar Residente' : 'Crear Residente'}
          </Button>
        </div>
      </form>
    </Form>
  )
}