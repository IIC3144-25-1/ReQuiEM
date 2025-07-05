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
import { PlusIcon, Trash2Icon } from "lucide-react"
import { ISurgery } from "@/models/Surgery"
import { useRouter } from "next/navigation"
import { updateSurgery } from "@/actions/surgery/updateSurgery"
import { IArea } from "@/models/Area"
import { Textarea } from "@/components/ui/textarea"

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
            name: surgery?.name || "",
            description: surgery?.description || "",
            area: surgery?.area._id.toString() || "",
            steps: surgery?.steps.map((step) => ({
                name: step,
            })) || [{ name: "" }],
            osats: surgery?.osats.map((osat) => ({
                item: osat.item,
                scale: osat.scale.map((s) => ({ punctuation: s.punctuation.toString(), description: s.description || "" })),
            })) || [
                {
                    item: "",
                    scale: [
                        {
                            punctuation: "",
                            description: "",
                        },
                    ],
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
        formData.append("areaId", values.area)

        values.steps.forEach((step, index) => {
            formData.append(`steps.${index}`, step.name)
        })

        values.osats.forEach((osat, index) => {
            formData.append(`osats.${index}.item`, osat.item);
            // Assuming scale should be sent as a JSON string if it's an array of objects
            formData.append(`osats.${index}.scale`, JSON.stringify(osat.scale));
        });

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
      <div className="border-l space-y-3 py-2 pl-2">
        <FormLabel className="text-sm font-medium">Escala de Evaluación</FormLabel>
        <div className="flex flex-row space-x-2 text-xs pl-2">
            <FormLabel className="w-[60px]">Puntaje</FormLabel>
            <FormLabel className="flex-1">Descripción (Opcional)</FormLabel>
        </div>
        {fields.map((field, scaleIndex) => (
          <div key={field.id} className="flex items-start space-x-2 pl-2">
            <FormField
                control={form.control}
                name={`osats.${osatIndex}.scale.${scaleIndex}.punctuation`}
                render={({ field }) => (
                    <FormItem className="w-[60px] flex items-center justify-center">
                        <FormControl>
                            <Input type="number" placeholder="5" {...field} className="w-full" />
                        </FormControl>
                        <FormMessage className="text-xs"/>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name={`osats.${osatIndex}.scale.${scaleIndex}.description`}
                render={({ field }) => (
                    <FormItem className="flex-1 w-full">
                        <FormControl>
                            <Textarea
                                {...field}
                                className="w-full resize-y min-h-[32px]"
                                rows={1}
                            />
                        </FormControl>
                        <FormMessage className="text-xs"/>
                    </FormItem>
                )}
            />

            <Button
              type="button"
              size="icon"
              variant="outline"
              className=""
              onClick={() => remove(scaleIndex)}
            >
              <Trash2Icon className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <Button
          className="ml-2"
          type="button"
          size="sm"
          onClick={() => {
            const maxPunctuation = fields.reduce((max, field) => {
              const num = parseInt(field.punctuation, 10);
              return !isNaN(num) && num > max ? num : max;
            }, 0);
            append({ punctuation: (maxPunctuation + 1).toString(), description: "" });
          }}
        >
            <PlusIcon className="h-4 w-4" />
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
            <div className="space-y-4 border rounded-xl p-4">
                <FormLabel className="text-lg font-semibold">Pasos de la Cirugía</FormLabel>
                <FormDescription>Describe los pasos principales que se realizarán durante la cirugía, en orden cronológico.</FormDescription>
                {fields.map((field, index) => (
                    <div key={field.id} className="flex flex-row space-x-4 items-start justify-between">
                        <h2 className="font-semibold">{index + 1}º</h2>

                        {/* Step name */}
                        <FormField
                            control={form.control}
                            name={`steps.${index}.name`}
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <Textarea
                                            placeholder="nombre del paso..."
                                            {...field}
                                            className="resize-y min-h-[40px] max-h-[200px]" // permite crecer verticalmente
                                        />
                                    </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
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

                ))}
                <Button
                    type="button"
                    onClick={() =>
                    append({
                        name: "",})
                    }
                >
                    <PlusIcon className="h-4 w-4" /> Añadir Paso
                </Button>
            </div>

            {/* OSATS */}
            <div className="space-y-4 border rounded-xl p-4">
                <FormLabel className="text-lg font-semibold">Pauta general OSATS</FormLabel>
                <FormDescription>Ingresa que se va a evaluar de manera general en la cirugía</FormDescription>
                {osatFields.map((field, index) => (
                    <div key={field.id} className="space-y-4 border-t-2 pt-2">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold">{index + 1}º Criterio</h2>
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
                                <FormLabel>Ítem a Evaluar</FormLabel>
                                <FormControl>
                                <Input placeholder="Utiliza correctamente..." {...field} />
                                </FormControl>
                                {/* <FormDescription>Que se busca evaluar</FormDescription> */}
                                <FormMessage />
                            </FormItem>
                            )}
                        />

                        {/* Nested Scale Array for this OSAT item */}
                        <OsatScaleArray osatIndex={index} />
                    </div>
                ))}
                <Button
                    type="button"
                    onClick={() =>
                    osatAppend({
                        item: "",
                        scale: [
                            {
                                punctuation: "1",
                                description: "",
                            },
                            {
                                punctuation: "2",
                                description: "",
                            },
                            {
                                punctuation: "3",
                                description: "",
                            },
                            {
                                punctuation: "4",
                                description: "",
                            },
                            {
                                punctuation: "5",
                                description: "",
                            },
                        ],
                    })
                    }
                >
                    <PlusIcon className="h-4 w-4" /> Añadir Criterio
                </Button>
            </div>

            <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => router.push("/admin/surgeries")}>Cancelar</Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>Guardar</Button>
            </div>
        </form>
    </Form>
  )
}