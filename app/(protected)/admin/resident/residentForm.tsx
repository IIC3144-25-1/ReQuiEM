'use client'

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Trash2Icon } from "lucide-react"
import { IResident } from "@/models/Resident"
import { createResident } from "@/actions/resident/create"
import { updateResident } from "@/actions/resident/update"

// Sólo campos que el modelo acepta: user y teachers
const residentFormSchema = z.object({
  user: z.string().min(1, "User ID is required"),
  teachers: z.array(z.string().min(1, "Teacher ID is required")).min(1, "At least one teacher is required"),
})

type ResidentFormValues = z.infer<typeof residentFormSchema>

type ResidentFormProps = {
  resident?: Partial<IResident>
}

export function ResidentForm({ resident }: ResidentFormProps) {
  const router = useRouter()

  const form = useForm<z.infer<typeof residentFormSchema>>({
    resolver: zodResolver(residentFormSchema),
    defaultValues: {
      user: resident?.user?.toString() || "",
      teachers: resident?.teachers?.map(t => t.toString()) ?? ["Id"],
    }, // Optional: Add mode for better validation handling
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "teachers" as never,
  });

  async function onSubmit(values: ResidentFormValues) {
    try {
      const formData = new FormData()
      formData.append("user", values.user)
      values.teachers.forEach((t, i) => {
        formData.append(`teachers.${i}`, t)
      })

      if (resident?._id) {
        formData.append("_id", resident._id.toString())
        await updateResident(formData)
        toast.success("Residente actualizado correctamente")
      } else {
        await createResident(formData)
        toast.success("Residente creado correctamente")
      }

      router.refresh()
    } catch (err) {
      console.error("Error en formulario residente: ", err)
      toast.error("Ocurrió un error al guardar")
    }
    form.reset()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
        {/* User ID */}
        <FormField
          control={form.control}
          name="user"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User ID</FormLabel>
              <FormControl>
                <Input placeholder="ObjectId del usuario" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Teachers dinámicos */}
        <div className="space-y-4">
          <FormLabel>Teachers</FormLabel>
          {fields.map((field, index) => (
            <div key={field.id} className="relative border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Teacher {index + 1}</h3>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={() => remove(index)}
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </div>

              <FormField
                control={form.control}
                name={`teachers.${index}` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teacher ID</FormLabel>
                    <FormControl>
                      <Input placeholder="ObjectId del Profesor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            onClick={() => append("")}
          >
            Añadir Profesor
          </Button>
        </div>

        <div className="flex justify-end">
          <Button type="submit">
            {resident?._id ? "Actualizar Residente" : "Crear Residente"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
