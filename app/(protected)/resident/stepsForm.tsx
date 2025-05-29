"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { IRecord } from "@/models/Record"
import { completeRecord } from '@/actions/record/complete'

const stepsRecordSchema = z.object({
  residentJudgment: z.number(),
  steps: z.array(
    z.object({
      name: z.string(),
      residentDone: z.boolean(),
    })
  ),
  residentComment: z.string(),
});

export function StepsRecordForm({record} : {record: IRecord}) {
    const router = useRouter()
    const form = useForm<z.infer<typeof stepsRecordSchema>>({
        resolver: zodResolver(stepsRecordSchema),
        defaultValues: {
            residentJudgment: 5,
            steps: record.steps.map((s) => ({
                name: s.name,
                residentDone: false
            })),
            residentComment: '',
        },
    })

    const { fields } = useFieldArray({
        control: form.control,
        name: "steps",
    });


    async function onSubmit(data: z.infer<typeof stepsRecordSchema>) {
        console.log(data)
        const formData = new FormData()
        formData.append('recordId', record._id.toString())
        formData.append('residentJudgment', String(data.residentJudgment))
        formData.append('residentComment', data.residentComment)

        data.steps.forEach((step, index) => {
            formData.append(`steps.${index}.name`, step.name)
            formData.append(`steps.${index}.residentDone`, String(step.residentDone))
        })

        try {
            await completeRecord(formData);
            toast.info('Registro guardado correctamente')
            router.push("/resident/records")
        } catch (e) {
            console.error("Error surgery:", e)
            toast.error("Error creando el registro")
        }
    }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 py-8 flex flex-col">
        <div>
          <FormLabel className="text-base font-semibold">Pasos Realizados</FormLabel>
          <FormDescription className="mb-2">Marca los pasos que realizaste durante la cirugía</FormDescription>
        </div>
        
        <div className="flex flex-col space-y-6 relative mt-0">
            <div className="h-23/24 w-px border border-gray-800 bg-gray-800 absolute ml-[5px] z-0 top-1/2 -translate-y-1/2"></div>
          {fields.map((field, index) => (
            <FormField
              key={field.id}
              control={form.control}
              name={`steps.${index}.residentDone`}
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="w-3 h-3 rounded-lg bg-gray-100 border border-white outline-2 outline-gray-800 outline-offset-1 z-10"
                      check={false}
                    />
                  </FormControl>
                  <FormLabel>{record.steps[index].name}</FormLabel>
                  <FormMessage className="text-xs"/>
                </FormItem>
              )}
            />
          ))}
        </div>


        <FormField
            control={form.control}
            name="residentJudgment"
            render={({ field }) => (
            <FormItem className="flex flex-col items-start space-x-3 space-y-0 rounded-md">
                <FormLabel className="text-base font-semibold">Juicio Global</FormLabel>
                <FormDescription className="mb-2">Califica cómo crees que fue tu desempeño</FormDescription>
                <FormControl>
                    <Slider
                        max={10}
                        min={4}
                        step={1}
                        labels={["bajo espectativas", "acuerdo a espectativas", "sobre espectativas"]}
                        defaultValue={[field.value]}
                        onValueChange={(vals) => {
                              field.onChange(vals[0]);
                            }}
                        
                    />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />


        <FormField
          control={form.control}
          name="residentComment"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold mb-2">Comentario</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Escribe un comentario..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="ml-auto w-1/2">Guardar registro</Button>
      </form>
    </Form>
  )
}
