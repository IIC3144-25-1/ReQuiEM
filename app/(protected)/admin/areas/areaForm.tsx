'use client'

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { IArea } from "@/models/Area"
import { createArea } from "@/actions/area/create"
import { useRouter } from "next/navigation"
import { updateArea } from "@/actions/area/update"

export const areaFormSchema = z.object({
  name: z.string().min(1, {
    message: "El nombre es requerido",
  }),
  description: z.string()
})

export type AreaFormValues = z.infer<typeof areaFormSchema>

export function AreaForm({area}: {area?: IArea}) {
    const router = useRouter();
  const form = useForm<AreaFormValues>({
    resolver: zodResolver(areaFormSchema),
    defaultValues: {
      name: area ? area.name : "",
      description: area ? area.description : "",
    },
  })

  const onSubmit = async (data: AreaFormValues) => {
    try {
        const formData = new FormData()

        formData.append("name", data.name)
        formData.append("description", data.description)
        if (area) {
            formData.append("areaId", area._id.toString())
            await updateArea(formData)
            // Update existing area
            toast.success("Área actualizada correctamente")
        } else {
            // Create new area
            await createArea(formData)
            toast.success("Área creada correctamente")
        }
        router.push("/admin/areas");
    } catch (error) {
        console.error("Error creating area:", error)
        toast.error("Error creando el área")
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Nombre del área" {...field} />
              </FormControl>
              <FormDescription>Area medica que relaciona a profesores y residentes</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Input placeholder="Descripción del área" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" isLoading={form.formState.isSubmitting}>Guardar</Button>
      </form>
    </Form>
  )

}