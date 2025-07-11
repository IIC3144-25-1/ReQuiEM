'use client'

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { createRecord } from "@/actions/record/create"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, ChevronsUpDown, Check } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { ISurgery } from "@/models/Surgery"
import { ITeacher } from "@/models/Teacher"
import { IResident } from "@/models/Resident"
// import { toast } from "sonner"

const recordSchema = z.object({
    resident: z.string().min(1, "Resident is required"),
    teacher: z.string().min(1, "Seleccione un profesor"),
    patientId: z.string().min(1, "Se requiere ID del paciente"),
    date: z.date().refine((date) => date <= new Date(), {
        message: "La fecha seleccionada aún no ha pasado"
    }),
    surgery: z.string().min(1, "Seleccione una cirugia"),
    residentsYear: z.string().min(1, "Se requiere año de residencia"),
})

export default function RecordForm({surgeries, teachers, resident}: {surgeries: ISurgery[], teachers: ITeacher[], resident: IResident}) {
    const router = useRouter()
    const [time, setTime] = useState(format(new Date(), "HH:mm"))

    const form = useForm<z.infer<typeof recordSchema>>({
        resolver: zodResolver(recordSchema),
        defaultValues: {
            resident: resident._id.toString(),
            teacher: "",
            patientId: "",
            date: new Date(),
            surgery: "",
            residentsYear: "1",
        },
    })

    async function onSubmit(data: z.infer<typeof recordSchema>) {
        // console.log("DATA:", data)
        const fullDate = new Date(data.date);
        const [hours, minutes] = time.split(":").map(Number);
        fullDate.setHours(hours);
        fullDate.setMinutes(minutes);
        fullDate.setSeconds(0);

        const formData = new FormData()
        formData.append("resident", data.resident)
        formData.append("teacher", data.teacher)
        formData.append("patientId", data.patientId)
        formData.append("date", fullDate.toISOString())
        formData.append("surgery", data.surgery)
        formData.append("residentsYear", data.residentsYear.toString())
        try {
            const recordId = await createRecord(formData)
            // toast.success("Nuevo registro creado")
            router.push("/resident/complete-record/" + recordId)
            // console.log("DATA:", data)
        } catch (error) {
            console.error("Error creating record:", error)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 flex flex-col w-full justify-center md:p-10 mt-6">
                <FormField
                    control={form.control}
                    name="teacher"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Profesor</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecciona a un profesor" />
                                    </SelectTrigger>
                                </FormControl>

                                <SelectContent>
                                    {teachers.length > 0 ? (
                                        teachers.map((teacher) => (
                                            <SelectItem
                                                check={false}
                                                key={teacher._id.toString()}
                                                value={teacher._id.toString()}
                                            >
                                                {teacher.user.name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <Alert>
                                            <AlertDescription>
                                                No tienes profesores asignados a tu área.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="residentsYear"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Año de Residencia</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger className="w-[50px] justify-center" arrow={false}>
                                    <SelectValue placeholder="1" />
                                </SelectTrigger>
                                <SelectContent className="w-[50px]">
                                    <SelectItem check={false} key={1} value={"1"} className="pl-5" >{1}</SelectItem>
                                    <SelectItem check={false} key={2} value={"2"} className="pl-5" >{2}</SelectItem>
                                    <SelectItem check={false} key={3} value={"3"} className="pl-5" >{3}</SelectItem>
                                    <SelectItem check={false} key={4} value={"4"} className="pl-5" >{4}</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="patientId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Iniciales del Paciente</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="IDP"
                                    {...field}
                                    onChange={(e) => { field.onChange(e.target.value) }}
                                />
                            </FormControl>
                            <FormDescription className="text-xs">
                                Utiliza las iniciales del paciente, por ejemplo: &quot;JPP&quot; para Juan Pérez Pérez. De esta forma se asegura la privacidad del paciente.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Fecha y Hora de la Cirugía</FormLabel>
                        <div className="flex items-center space-x-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "flex-grow pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value ? (
                                                format(field.value, "d '/' MMM '/' yyyy", { locale: es })
                                            ) : (
                                                <span>Selecciona una fecha</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={(date) => field.onChange(date || new Date())}
                                        disabled={(date) =>
                                        date > new Date() || date < new Date("1900-01-01")
                                        }
                                        locale={es}
                                    />
                                </PopoverContent>
                            </Popover>
                            <Input
                                type="time"
                                id="time-picker"
                                step="60"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-18 bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                            />
                        </div>
                    </FormItem>
                    )}
                />
                
                <FormField
                    control={form.control}
                    name="surgery"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="mb">Cirugía</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className={cn(
                                        "w-full justify-between",
                                        !field.value && "text-muted-foreground"
                                        )}
                                    >
                                        {field.value
                                        ? surgeries.find(
                                            (surgery) => surgery._id.toString() === field.value
                                        )?.name
                                        : "Selecciona una cirugía"}
                                        <ChevronsUpDown className="opacity-50" />
                                    </Button>
                                </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="p-0">
                                <Command>
                                    <CommandInput placeholder='Busca una cirugía' className="h-9" />
                                    <CommandList>
                                    <CommandEmpty>No se encontró cirugía</CommandEmpty>
                                    <CommandGroup>
                                        {surgeries.map((surgery) => (
                                        <CommandItem
                                            value={surgery.name}
                                            key={surgery._id.toString()}
                                            onSelect={() => {
                                            form.setValue("surgery", surgery._id.toString())
                                            }}
                                        >
                                            {surgery.name}
                                            <Check
                                            className={cn(
                                                "ml-auto",
                                                surgery._id.toString() === field.value ? "opacity-100" : "opacity-0"
                                            )}
                                            />
                                        </CommandItem>
                                        ))}
                                    </CommandGroup>
                                    </CommandList>
                                </Command>
                                </PopoverContent>
                                </Popover>
                        </FormItem>
                    )}
                />

                <Button type="submit" className="ml-auto w-1/2" isLoading={form.formState.isSubmitting}>
                    Siguiente
                </Button>
            </form>
        </Form>
    )
}