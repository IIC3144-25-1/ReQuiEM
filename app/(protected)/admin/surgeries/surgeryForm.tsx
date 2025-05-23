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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
  
import { Input } from "@/components/ui/input"
import { createSurgery } from "@/actions/surgery/createSurgery"
import { toast } from "sonner"
import { Trash2Icon } from "lucide-react"
import { ISurgery } from "@/models/Surgery"
import { useRouter } from "next/navigation"
import { updateSurgery } from "@/actions/surgery/updateSurgery"
import { IArea } from "@/models/Area"

export const surgerySchema = z.object({
    name: z.string().min(1, "El nombre de la cirugía es requerido"),
    description: z.string().optional(),
    area: z.string().min(1, "El área es requerida"),
    steps: z.array(z.object({
        name: z.string().min(1, "El nombre del paso no puede estar vacío"),
      })).min(1, "Por lo menos un paso es requerido"),
    osats: z.array(
      z.object({
        item: z.string().min(1, "El nombre de la evaluación es requerido"),
        scale: z.array(
            z.object({
                punctuation: z.string().min(1, "La puntuación es requerida"),
                description: z.string().optional(),
            })
            ).min(1, "Por lo menos una escala es requerida"),
      })
    ).min(1, "Por lo menos un paso OSAT es requerido"),
});

export function SurgeryForm({surgery, areas}: {surgery?: ISurgery, areas: IArea[]}) {
    const router = useRouter()
    // 1. Define your form.
    const form = useForm<z.infer<typeof surgerySchema>>({
        resolver: zodResolver(surgerySchema),
        defaultValues: {
            name: "",
            description: "",
            area: "",
            steps: [{ name: "" }],
            osats: [{ item: "", scale: [{ punctuation: "", description: "" }] }],
        },
    })

  useEffect(() => {
    if (surgery) {
        console.log("Surgery", surgery)
        form.reset({
            name: surgery.name,
            description: surgery.description || '',
            area: surgery.area._id.toString(),
            steps: surgery.steps.map((step) => ({
                name: step,
            })),
            osats: surgery.osats.map((osat) => ({
                item: osat.item,
                scale: osat.scale.map((s) => ({ punctuation: s.punctuation.toString(), description: s.description || "" })),
            })),
        })
        }
  }, [surgery, form])


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
        console.log("Values", values)
        const formData = new FormData()

        formData.append("name", values.name)
        formData.append("description", values.description || "")
        formData.append("areaId", values.area)

        values.steps.forEach((step, index) => {
            formData.append(`steps.${index}`, step.name)
        })

        values.osats.forEach((osat, index) => {
            formData.append(`osats.${index}.item`, osat.item)
            formData.append(`osats.${index}.scale`, JSON.stringify(osat.scale))
        })

        if (surgery) {
            formData.append("surgeryId", surgery._id.toString())
            await updateSurgery(formData)
            toast.success("Cirugía actualizada correctamente")
        } else {
            await createSurgery(formData)
            toast.success("Cirugía creada correctamente")
        }
        router.push("/admin/surgeries")
    } catch (error) {
        console.error("Error surgery:", error)
        toast.error("Error creando/editando la cirugía")
    }
  }

  const OsatScaleArray = ({ osatIndex }: { osatIndex: number }) => {
    const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: `osats.${osatIndex}.scale`
    });

    return (
      <div className="ml-4 pl-4 border-l space-y-3 py-2">
        <FormLabel className="text-sm font-medium">Escala de Evaluación</FormLabel>
        {fields.map((field, scaleIndex) => (
          <div key={field.id} className="flex items-center space-x-2 p-2 border rounded-md">
            <FormField
            control={form.control}
            name={`osats.${osatIndex}.scale.${scaleIndex}.punctuation`}
            render={({ field }) => (
                <FormItem className="w-[60px]">
                <FormLabel className="text-xs">Puntaje</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="Ej: 1" {...field} />
                </FormControl>
                <FormMessage className="text-xs"/>
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name={`osats.${osatIndex}.scale.${scaleIndex}.description`}
            render={({ field }) => (
                <FormItem className="flex-1">
                <FormLabel className="text-xs">Descripción</FormLabel>
                <FormControl>
                    <Input placeholder="Ej: No realiza la acción" {...field} />
                </FormControl>
                <FormMessage className="text-xs"/>
                </FormItem>
            )}
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className=""
              onClick={() => remove(scaleIndex)}
            >
              <Trash2Icon className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ punctuation: "", description: "" })}
        >
          Añadir Puntuación a Escala
        </Button>
      </div>
    );
  };

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
                <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona el área" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {areas.map((area) => (
                        <SelectItem key={area._id.toString()} value={area._id.toString()}>
                        {area.name}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
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
                </div>

            ))}
            </div>
            <Button
                type="button"
                variant="secondary"
                onClick={() =>
                append({
                    name: "",})
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
                    name={`osats.${index}.item`}
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

                {/* Nested Scale Array for this OSAT item */}
                <OsatScaleArray osatIndex={index} />
                </div>
            ))}
            </div>
            <Button
                type="button"
                variant="secondary"
                onClick={() =>
                osatAppend({
                    item: "",
                    scale: [
                        {
                            punctuation: "",
                            description: "",
                        },
                    ],
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