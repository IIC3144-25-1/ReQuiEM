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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { createResident } from '@/actions/resident/create'
import { updateResident } from '@/actions/resident/update'
import { IArea } from '@/models/Area'
import { getResidentByID } from '@/actions/resident/getByID'


// Esquema Zod para validar email y lista de profesores
const residentFormSchema = z.object({
  name:  z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  area: z.string().min(1, 'El area es requerida'),
})

type ResidentFormValues = z.infer<typeof residentFormSchema>
type Props = { id?: string, areas: IArea[] }

export function ResidentForm({ id, areas}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const form = useForm<ResidentFormValues>({
    resolver: zodResolver(residentFormSchema),
    defaultValues: { name: '', email: '', area: '' },
  })

  // Cargar datos iniciales: lista de profesores y, si hay ID, datos del residente
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        if (id && id !== 'new') {
          const resident = await getResidentByID(id)
          form.reset({
            name: resident?.user.name || '',
            email: resident?.user.email || '',
            area: resident?.area?.toString() || '',
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
      formData.append('name', values.name)
      formData.append('email', values.email);
      formData.append('areaId', values.area);

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
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Residente</FormLabel>
              <FormControl>
                <Input placeholder="Juan Pérez" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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

        <FormField
            control={form.control}
            name="area"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Area</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecciona un Area" />
                            </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                            {areas.length > 0 ? (
                                areas.map((area) => (
                                    <SelectItem
                                        check={false}
                                        key={area._id.toString()}
                                        value={area._id.toString()}
                                    >
                                        {area.name}
                                    </SelectItem>
                                ))
                            ) : (
                                <Alert>
                                    <AlertDescription>
                                        No se encontraron áreas.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </SelectContent>
                    </Select>
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