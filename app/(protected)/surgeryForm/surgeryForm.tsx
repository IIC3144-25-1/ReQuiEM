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
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    area: z.string().min(1, "Area is required"),
    steps: z.array(
      z.object({
        name: z.string().min(1, "Step name is required"),
        description: z.string().optional(),
        guideline: z.object({
                name: z.string().min(1, "Guideline name is required"),
                description: z.string().optional(),
                maxRating: z.string().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
            }),
      })
    ).min(1, "At least one step is required"),
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
              description: "",
              maxRating: '3',
            },
          },
        ],
      },
  })


  // This in oly for the steps form, beacuse you can add more steps
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "steps",
  })

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof surgerySchema>) {
    try {
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("description", values.description || "");
        formData.append("area", values.area);

        values.steps.forEach((step, index) => {
            formData.append(`steps.${index}.name`, step.name);
            formData.append(`steps.${index}.description`, step.description || "");
            formData.append(`steps.${index}.guideline.name`, step.guideline.name);
            formData.append(`steps.${index}.guideline.description`, step.guideline.description || "");
            formData.append(`steps.${index}.guideline.maxRating`, step.guideline.maxRating);
        });

        await createSurgery(formData);
        toast.success("Surgery created successfully")
    } catch (error) {
        console.error("Error creating surgery:", error)
        toast.error("Error creating surgery")
    }
    // Reset the form after submission
    form.reset() 
  }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 min-w-sm">
            {/* Name */}
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                    <Input placeholder="Surgery Name" {...field} />
                </FormControl>
                <FormDescription>Nombre de la cirugía</FormDescription>
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
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                    <Input placeholder="Descripción de la cirugía" {...field} />
                </FormControl>
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
                <FormLabel>Área</FormLabel>
                <FormControl>
                    <Input placeholder="Área quirúrgica" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            {/* Steps */}
            <div className="space-y-4">
            <FormLabel>Pasos</FormLabel>
            {fields.map((field, index) => (
                <div key={field.id} className="relative border rounded-xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                    Paso {index + 1}
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
                        <FormLabel>Descripción del Paso</FormLabel>
                        <FormControl>
                        <Input placeholder="Descripción del paso" {...field} />
                        </FormControl>
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
                        <FormLabel>Pauta de Calificación</FormLabel>
                        <FormControl>
                            <Input placeholder="Nombre de la guía" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name={`steps.${index}.guideline.description`}
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Descripción de la pauta</FormLabel>
                        <FormControl>
                            <Input placeholder="Descripción opcional" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name={`steps.${index}.guideline.maxRating`}
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Calificación Máxima</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="1-5" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                </div>
            ))}
            </div>
            <div className="flex justify-between">
            <Button
                type="button"
                variant="secondary"
                onClick={() =>
                append({
                    name: "",
                    description: "",
                    guideline: {
                    name: "",
                    description: "",
                    maxRating: '3',
                    },
                })
                }
            >
                Añadir Paso
            </Button>
            
            <Button type="submit">Guardar</Button>
        </div>
        </form>
    </Form>
  )
}