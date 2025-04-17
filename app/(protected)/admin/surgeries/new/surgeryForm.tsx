'use client'

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
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
import { createSurgery } from "@/actions/surgery/createSurgery"
import { toast } from "sonner"
import { Trash2Icon } from "lucide-react"

export const surgerySchema = z.object({
    name: z.string().min(1, "El nombre de la cirugía es requerido"),
    description: z.string().optional(),
    area: z.string().min(1, "El área es requerida"),
    steps: z.array(
      z.object({
        name: z.string().min(1, "El nombre del paso es requerido"),
        description: z.string().optional(),
        guideline: z.object({
                name: z.string().min(1, "El nombre de la pauta del paso es requerido"),
                maxRating: z.string().min(1, "Calificacion tiene que ser por lo menos 1").max(10, "Calificacion tiene que ser como maximo 10"),
            }),
      })
    ).min(1, "Por lo menos un paso es requerido"),
    osats: z.array(
      z.object({
        name: z.string().min(1, "Nombre del paso OSAT es requerido"),
        description: z.string().optional(),
        maxRating: z.string().min(1, "Calificacion tiene que ser por lo menos 1").max(5, "Calificacion tiene que ser como maximo 5"),
      })
    ).min(1, "Por lo menos un paso OSAT es requerido"),
});

export function SurgeryForm() {
    // 1. Define your form.
  const form = useForm<z.infer<typeof surgerySchema>>({
    resolver: zodResolver(surgerySchema),
    defaultValues: {
        name: "",
        description: "",
        area: "",
        steps: [
          {
            name: "",
            description: "",
            guideline: {
              name: "",
              maxRating: '5',
            },
          },
        ],
        osats: [
          {
            name: "",
            description: "",
            maxRating: '5',
          },
        ],
      },
  })


  // This in oly for the steps form, beacuse you can add more steps
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "steps",
  })

    // This in oly for the osats form, beacuse you can add more steps
    const { fields: osatFields, append: osatAppend, remove: osatRemove } = useFieldArray({
        control: form.control,
        name: "osats",
    })

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof surgerySchema>) {
    try {
        const formData = new FormData()

        formData.append("name", values.name)
        formData.append("description", values.description || "")
        formData.append("area", values.area)

        values.steps.forEach((step, index) => {
            formData.append(`steps.${index}.name`, step.name)
            formData.append(`steps.${index}.description`, step.description || "")
            formData.append(`steps.${index}.guideline.name`, step.guideline.name)
            formData.append(`steps.${index}.guideline.maxRating`, step.guideline.maxRating)
        })

        values.osats.forEach((osat, index) => {
            formData.append(`osats.${index}.name`, osat.name)
            formData.append(`osats.${index}.description`, osat.description || "")
            formData.append(`osats.${index}.maxRating`, osat.maxRating)
        })

        await createSurgery(formData)
        toast.success("Cirugía creada correctamente")
        form.reset()
    } catch (error) {
        console.error("Error creating surgery:", error)
        toast.error("Error creando la cirugía")
    }
  }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:min-w-lg min-w-sm px-2">
            {/* Name */}
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Nombre de la Cirugía</FormLabel>
                <FormControl>
                    <Input placeholder="Ureteroscopia flexible..." {...field} />
                </FormControl>
                <FormDescription>Nombre de la cirugía, intenta que sea descriptivo</FormDescription>
                <FormMessage />
                </FormItem>
            )}
            />

            {/* Description */}
            <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Descripción de la Cirugía</FormLabel>
                <FormControl>
                    <Input placeholder="Detalla cual es el obejtivo de la cirugía" {...field} />
                </FormControl>
                <FormDescription>Describe la cirugía</FormDescription>
                <FormMessage />
                </FormItem>
            )}
            />

            {/* Area */}
            <FormField
            control={form.control}
            name="area"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Área de la cirugía</FormLabel>
                <FormControl>
                    <Input placeholder="Área quirúrgica" {...field} />
                </FormControl>
                <FormDescription>Área quirúrgica de la cirugía</FormDescription>
                <FormMessage />
                </FormItem>
            )}
            />
            {/* Steps */}
            <div className="space-y-4">
            <FormLabel>Pasos de la Cirugía</FormLabel>
            <FormDescription>Describe los pasos principales que se realizarán durante la cirugía, en orden cronológico.</FormDescription>
            {fields.map((field, index) => (
                <div key={field.id} className="relative border rounded-xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                    Paso N°{index + 1}
                    </h2>
                    <Button
                        type="button"
                        size={"icon"}
                        variant="outline"
                        className="top-2 right-2"
                        onClick={() => remove(index)}
                    >
                        <Trash2Icon className="h-4 w-4" />
                    </Button>
                </div>

                {/* Step name */}
                <FormField
                    control={form.control}
                    name={`steps.${index}.name`}
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nombre del Paso</FormLabel>
                        <FormControl>
                        <Input placeholder="Paso" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                {/* Description */}
                <FormField
                    control={form.control}
                    name={`steps.${index}.description`}
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>¿Que se hace en el paso?</FormLabel>
                        <FormControl>
                        <Input placeholder="En este paso se..." {...field} />
                        </FormControl>
                        <FormDescription>Describe el paso de la cirugía</FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                {/* Guideline group */}
                <div className="grid gap-4 grid-cols-1 md:grid-cols-1">
                    <FormField
                    control={form.control}
                    name={`steps.${index}.guideline.name`}
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>¿Que se evalua en este paso?</FormLabel>
                        <FormControl>
                            <Input placeholder="Se realiza correctamente ..." {...field} />
                        </FormControl>
                        <FormDescription>Describe que se evalua en este paso</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name={`steps.${index}.guideline.maxRating`}
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Calificación Máxima del paso</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="5" {...field} />
                        </FormControl>
                        <FormDescription>Este numero luego se utilizara para generar una escala del 1 - n</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                </div>
            ))}
            </div>
            <Button
                type="button"
                variant="secondary"
                onClick={() =>
                append({
                    name: "",
                    description: "",
                    guideline: {
                    name: "",
                    maxRating: '5',
                    },
                })
                }
            >
                Añadir Paso
            </Button>

            {/* OSATS */}
            <div className="space-y-4">
            <FormLabel>Pauta general OSATS</FormLabel>
            <FormDescription>Ingresa que se va a evaluar de manera general en la cirugía</FormDescription>
            {osatFields.map((field, index) => (
                <div key={field.id} className="relative border rounded-xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                    Criterio OSAT N°{index + 1}
                    </h2>
                    <Button
                        type="button"
                        size={"icon"}
                        variant="outline"
                        className="top-2 right-2"
                        onClick={() => osatRemove(index)}
                    >
                        <Trash2Icon className="h-4 w-4" />
                    </Button>
                </div>

                {/* Step name */}
                <FormField
                    control={form.control}
                    name={`osats.${index}.name`}
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nombre de la Evaluación</FormLabel>
                        <FormControl>
                        <Input placeholder="Utiliza correctamente..." {...field} />
                        </FormControl>
                        <FormDescription>Que se busca evaluar</FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                {/* Description */}
                <FormField
                    control={form.control}
                    name={`osats.${index}.description`}
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Descripción de la evaluación</FormLabel>
                        <FormControl>
                        <Input placeholder="En este paso se evalua..." {...field} />
                        </FormControl>
                        <FormDescription>Describe la evaluación</FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                {/* Guideline group */}
                <div className="grid gap-4 grid-cols-1 md:grid-cols-1">
                    <FormField
                    control={form.control}
                    name={`osats.${index}.maxRating`}
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Calificación Máxima</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="1-5" {...field} />
                        </FormControl>
                        <FormDescription>Este numero luego se utilizara para generar una escala del 1 - n</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                </div>
            ))}
            </div>
            <Button
                type="button"
                variant="secondary"
                onClick={() =>
                osatAppend({
                    name: "",
                    description: "",
                    maxRating: '5',
                })
                }
            >
                Añadir Paso OSAT
            </Button>
            <div className="flex justify-end">
            
            
            <Button type="submit" disabled={form.formState.isSubmitting}>Guardar</Button>
        </div>
        </form>
    </Form>
  )
}