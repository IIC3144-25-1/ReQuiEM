'use client'

import { z } from "zod"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useState, useEffect } from "react"
import { createRecord } from "@/actions/record/create"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { Combobox } from "@/components/forms/ComboBox"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { formatRut, validateRut } from "@/utils/rut"
import { getTeachersAndSurgeries } from "@/actions/record/getSurgeries&Teachers"
import { ISurgery } from "@/models/Surgery"
import { ITeacher } from "@/models/Teacher"

const recordSchema = z.object({
    resident: z.string().min(1, "Resident is required"),
    teacher: z.string().min(1, "Seleccione un profesor"),
    patientId: z.string().min(1, "Se requiere RUT del paciente").refine((rut) => validateRut(rut), {
        message: "El RUT ingresado no es válido",
    }),
    date: z.date().refine((date) => date <= new Date(), {
        message: "La fecha seleccionada aún no ha pasado"
    }),
    surgery: z.string().min(1, "Seleccione una cirugia"),
    residentsYear: z.number().min(1, "Se requiere año de residencia"),
})

export default function NewRecord() {
    const router = useRouter()
    const [surgeryId, setSurgeryId] = useState("")
    const [hour, setHour] = useState("")
    const [minute, setMinute] = useState("")
    const [teachers, setTeachers] = useState<ITeacher[]>([]);
    const [surgeries, setSurgeries] = useState<ISurgery[]>([])

    useEffect(() => {
        async function fetchData() {
            try {
                const result = await getTeachersAndSurgeries();
                if (result) {
                    const { teachers, surgeries } = result;
                    if (teachers) {
                        setTeachers(teachers);
                    }
                    if (surgeries) {
                        setSurgeries(surgeries);
                    }
                } else {
                    console.error("getTeachersAndSurgeries() returned null");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }

        fetchData();
    }, []);


    const form = useForm<z.infer<typeof recordSchema>>({
        resolver: zodResolver(recordSchema),
        defaultValues: {
            resident: "",
            teacher: "",
            patientId: "",
            date: new Date(),
            surgery: surgeryId,
            residentsYear: 1,
        },
    })

    async function onSubmit(data: z.infer<typeof recordSchema>) {
        const fullDate = new Date(data.date);
        fullDate.setHours(parseInt(hour, 10));
        fullDate.setMinutes(parseInt(minute, 10));
        fullDate.setSeconds(0);

        // "use server"
        const formData = new FormData()
        formData.append("resident", data.resident)
        formData.append("teacher", data.teacher)
        formData.append("patientId", data.patientId)
        formData.append("date", fullDate.toISOString())
        formData.append("surgery", data.surgery)
        formData.append("residentsYear", data.residentsYear.toString())
        try {
            await createRecord(formData)
            router.push("/(protected)/resident/records")
            console.log("DATA:", formData)
        } catch (error) {
            console.error("Error creating record:", error)
        }
    }
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:min-w-sm min-w-sm px-2 flex flex-col gap-6 min-h-svh w-full justify-center max-w-md mx-auto md:p-10">
            <h1 className="text-2xl font-bold text-center">Nuevo Registro</h1>
                <FormField
                    control={form.control}
                    name="teacher"
                    render={() => (
                        <FormItem>
                            <FormLabel>Profesor</FormLabel>
                            <Select>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecciona a un profesor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teachers.map((teacher) => (
                                        <SelectItem
                                            check={false}
                                            key={teacher._id.toString()}
                                            value={teacher._id.toString()}
                                        >
                                            {teacher.user.toString()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="residentsYear"
                    render={() => (
                        <FormItem>
                            <FormLabel>Año de Residencia</FormLabel>
                            <Select>
                                <SelectTrigger className="w-[50px] justify-center" arrow={false}>
                                    <SelectValue placeholder="1" />
                                </SelectTrigger>
                                <SelectContent className="w-[50px]">
                                    {Array.from({ length: 4 }, (_, i) => (
                                        <SelectItem
                                            check={false}
                                            key={i + 1}
                                            value={(i + 1).toString()}
                                            className="pl-5"
                                        >
                                            {(i + 1).toString()}
                                        </SelectItem>
                                    ))}
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
                            <FormLabel>RUT del Paciente</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="11222333-4"
                                    {...field}
                                    onChange={(e) => {
                                        const formattedRut = formatRut(e.target.value); // Formatea el RUT
                                        field.onChange(formattedRut); // Actualiza el valor en el formulario
                                    }}
                                />
                            </FormControl>
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
                                        initialFocus
                                        locale={es}
                                    />
                                </PopoverContent>
                            </Popover>
                            <Select value={hour} onValueChange={setHour}>
                                <SelectTrigger className="w-[45px]" arrow={false}>
                                    <SelectValue placeholder="12" />
                                </SelectTrigger>
                                <SelectContent className="h-[200px] w-[45px]">
                                    {Array.from({ length: 24 }, (_, i) => (
                                        <SelectItem
                                            check={false}
                                            key={i}
                                            value={(i).toString().padStart(2, "0")}
                                        >
                                            {(i).toString().padStart(2, "0")}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <span>:</span>
                            <Select value={minute} onValueChange={setMinute}>
                                <SelectTrigger className="w-[45px]" arrow={false}>
                                    <SelectValue placeholder="45" />
                                </SelectTrigger>
                                <SelectContent className="h-[200px] w-[45px]">
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <SelectItem
                                            check={false}
                                            key={i*5}
                                            value={(i*5).toString().padStart(2, "0")}
                                        >
                                            {(i*5).toString().padStart(2, "0")}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </FormItem>
                    )}
                />
                
                <FormField
                    control={form.control}
                    name="surgery"
                    render={() => (
                        <FormItem>
                            <FormLabel className="mb">Cirugía</FormLabel>
                            <Combobox
                                options={surgeries.map((surgery) => ({
                                    value: surgery.name,
                                    label: surgery.name,
                                }))}
                                value={surgeryId}
                                setValue={setSurgeryId}
                                placeholder="a cirugía"
                            />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full">
                    Crear Registro
                </Button>
            </form>
        </Form>
    )
}