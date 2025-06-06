"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Label } from "@radix-ui/react-label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { IRecord } from "@/models/Record"
import { reviewRecord } from "@/actions/record/review"
import { format } from "date-fns"
import { es } from "date-fns/locale"

const reviewRecordSchema = z.object({
  steps: z.array(
    z.object({
      name: z.string(),
      teacherDone: z.boolean(),
      score: z.enum(['a', 'b', 'c', 'n/a']).optional()
    })
  ),
  osats: z.array(
    z.object({
      item: z.string(),
      obtained: z.number().min(0),
    })
  ),
  teacherJudgment: z.number(),
  summaryScale: z.enum(['A','B','C','D','E']),
  feedback: z.string(),
});

export const sumaryScalesList = [
  { value: 'A', label: 'Competente para asistir adecuadamente' },
  { value: 'B', label: 'Competente para desarrollar la operación bajo estricta supervision' },
  { value: 'C', label: 'Competente para desarrollar la operación bajo supervision limitada' },
  { value: 'D', label: 'Competente para desarrollar la operación sin supeervision' },
  { value: 'E', label: 'Competente para supervisar y enseñar operación' },
];

export const scoreList = {
  'a': 'No realizado',
  'b': 'Realizado parcialmente, requiere corrección',
  'c': 'Realizado completo, de forma independiente',
  'n/a': 'No aplica'
}

export function ReviewRecordForm({record} : {record: IRecord}) {
  const router = useRouter()
  const [scores, setScores] = useState<string[]>(Array(record.steps.length).fill('a'))
  
  const form = useForm<z.infer<typeof reviewRecordSchema>>({
    resolver: zodResolver(reviewRecordSchema),
    defaultValues: {
      steps: record.steps.map((s) => ({
        name: s.name,
        teacherDone: s.teacherDone,
        score: 'a',
      })),
      osats: record.osats.map((o) => ({
        item: o.item,
        obtained: o.obtained || 0,
      })),
      teacherJudgment: record.teacherJudgment || 0,
      summaryScale: record.summaryScale || 'A',
      feedback: record.feedback || '',
    },
  })

  const { fields: stepFields } = useFieldArray({
    control: form.control,
    name: "steps",
  });

  const { fields: osatFields } = useFieldArray({
    control: form.control,
    name: "osats",
  });

  const handleValueChange = (value: string, index: number) => {
    setScores((prev) => {
      const newScores = [...prev];
      newScores[index] = value;
      return newScores;
    });
  }

  async function onSubmit(data: z.infer<typeof reviewRecordSchema>) {
    const formData = new FormData()
    console.log("Submitting review record:", data)
    
    formData.append('recordId', record._id.toString())
    
    data.steps.forEach((step, index) => {
      formData.append(`steps.${index}.name`, step.name)
      formData.append(`steps.${index}.teacherDone`, String(step.teacherDone))
      formData.append(`steps.${index}.score`, scores[index])
    })

    data.osats.forEach((osat, index) => {
      formData.append(`osats.${index}.item`, osat.item)
      formData.append(`osats.${index}.obtained`, String(osat.obtained))
    })

    formData.append('teacherJudgment', String(data.teacherJudgment))
    formData.append('summaryScale', data.summaryScale)
    formData.append('feedback', data.feedback)

    try {

      await reviewRecord(formData);
      toast.success("Registro completado correctamente")
      router.push(`/teacher/records/${record._id}`)
    } catch (error) {
      console.log("Error al completar el registro:", error)
      toast.error("Error al completar el registro")
    }
  }

  console.log("Form errors:", form.formState.errors)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 py-8 flex flex-col">
        <div className="flex flex-row mt-4">
          <div className="mr-4 font-semibold flex flex-col">
            <Label>Cirugía:</Label>
            <Label>Residente:</Label>
            <Label>Fecha:</Label>
          </div>
          <div className="flex flex-col">
            <Label>{record.surgery.name}</Label>
            <Label>{record.resident.user.name}</Label>
            <Label>{format(record.date, "d '/' MMM '/' yyyy ' a las ' HH:mm", { locale: es })}</Label>
          </div>
        </div>

        <FormLabel className="text-lg font-semibold mt-4">Pasos Realizados por el Residente</FormLabel>
        <div className="flex flex-col space-y-6 relative mt-0">
          <div className="h-23/24 w-px border border-gray-800 bg-gray-800 absolute ml-[5px] top-31/64 -translate-y-1/2 z-0"></div>
          {stepFields.map((field, index) => (
            <FormField
              key={field.id}
              control={form.control}
              name={`steps.${index}.teacherDone`}
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-2 space-y-0 rounded-md">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={value => {
                        field.onChange(value);
                        handleValueChange("c", index)
                      }}
                      className="min-w-3 w-3 h-3 rounded-lg bg-gray-100 border border-white outline-2 outline-gray-800 z-10"
                      check={false}
                    />
                  </FormControl>
                  <Select onValueChange={value => handleValueChange(value, index)} disabled={!field.value}>
                    <SelectTrigger className="min-w-[30px] max-h-[30px] p-0 -mt-2 flex justify-center items-center" arrow={false}>
                      <span>{scores[index] || "a"}</span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="a" disabled={field.value}>a <div className="w-px h-5 bg-gray-300"/>{scoreList['a']}</SelectItem>
                        <SelectItem value="b">b <div className="w-px h-5 bg-gray-300"/>{scoreList['b']}</SelectItem>
                        <SelectItem value="c">c <div className="w-px h-5 bg-gray-300"/>{scoreList['c']}</SelectItem>
                        <SelectItem value="n/a">n/a<div className="w-px h-5 bg-gray-300"/>{scoreList['n/a']}</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormLabel>{record.steps[index].name}</FormLabel>
                  <FormMessage className="text-xs"/>
                </FormItem>
              )}
            />
          ))}
        </div>

        <FormLabel className="text-lg font-semibold mt-4">OSATS</FormLabel>
        <div className="flex flex-col space-y-6 relative mt-0">
          {osatFields.map((field, index) => (
            <FormField
              key={field.id}
              control={form.control}
              name={`osats.${index}.obtained`}
              render={({ field }) => (
              <FormItem className="flex flex-col items-start space-x-3 space-y-0 rounded-md">
                <FormLabel className="text-sm mb-2">{record.osats[index].item}</FormLabel>
                <FormControl>
                  <Slider
                    max={Math.max(...record.osats[index].scale.map(s => s.punctuation))}
                    min={Math.min(...record.osats[index].scale.map(s => s.punctuation))}
                    step={1}
                    labels={record.osats[index].scale.map(s => s.description?.toString() || '')}
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
          ))}
        </div>

        <FormField
          control={form.control}
          name="teacherJudgment"
          render={({ field }) => (
          <FormItem className="flex flex-col items-start space-x-3 space-y-0 rounded-md">
            <FormLabel className="text-lg font-semibold mb-2 mt-4">Juicio Global</FormLabel>
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
          name="summaryScale"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-lg font-semibold mb-2 mt-4">Escala Resumen</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  {sumaryScalesList.map((scale) => (
                    <FormItem key={scale.value} className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value={scale.value} className="border-gray-700" />
                      </FormControl>
                      <FormLabel className="font-normal flex items-start">
                        <p className="font-bold mr-1">{scale.value}</p>
                        <p className="">{scale.label}</p>  
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="feedback"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold mb-2 mt-4">Feedback</FormLabel>
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
        
        <Button type="submit" className="ml-auto w-1/2">Guardar Corrección</Button>
      </form>
    </Form>
  )
}