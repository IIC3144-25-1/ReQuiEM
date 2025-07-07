'use client'

import { StrAvatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { formatRut, validateRut } from "@/utils/rut"
import { formatPhone } from "@/utils/phone"
import { updateUser } from "@/actions/user/update"
import { IUser } from "@/models/User"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { tailwindColors } from "@/utils/colors"

const userSchema = z.object({
    name: z.string().min(1, "Ingresa tu nombre"),
    rut: z.string().refine((rut) => validateRut(rut), {
        message: "RUT ingresado no es válido",
    }),
    phone: z.string(),
    birthdate: z.date(),
    image: z.string()
})

export default function EditProfile({user} : {user: IUser}) {
  const router = useRouter()
  const form = useForm<z.infer<typeof userSchema>>({
      resolver: zodResolver(userSchema),
      defaultValues: {
          name: user.name || "",
          rut: user.rut || "",
          phone: user.phone?.replace(/^(\+56\s?9\s?)/, "") || "",
          birthdate: user.birthdate ? new Date(user.birthdate) : new Date(new Date().getFullYear() - 25, 0, 1),
          image: user.image || "gray",
      },
  })

  async function onSubmit(data: z.infer<typeof userSchema>) {
    const formData = new FormData()

    formData.append("id", user._id.toString())
    if (data.name !== user.name) {
      formData.append("name", data.name)
    }
    if (data.rut !== user.rut) {
      formData.append("rut", data.rut)
    }
    if (data.phone !== user.phone?.replace(/^(\+56\s?9\s?)/, "")) {
      formData.append("phone", `+56 9 ${data.phone}`)
    }
    if (data.birthdate !== user.birthdate) {
      formData.append("birthdate", data.birthdate.toISOString())
    }
    if (data.image !== user.image) {
      formData.append("image", data.image)
    }
    try {
      await updateUser(formData)
      // toast.success("Cambios Relaizados Correctamente")
      router.push("/profile")
      // console.log("DATA:", data)
    } catch (error) {
      console.error("Error creating record:", error)
    }
  }

  return (
    <Form {...form}>
      <h1 className="text-2xl font-bold text-center mt-4">Editar Perfil</h1>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 flex flex-col w-full max-w-sm mx-auto justify-center md:p-10 mt-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nombre"
                  {...field}
                  onChange={(e) => {field.onChange(e.target.value)}}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rut"
          render={({ field }) => (
            <FormItem>
              <FormLabel>RUT</FormLabel>
              <FormControl>
                <Input
                  placeholder="11.222.333-4"
                  {...field}
                  onChange={(e) => {
                    const formattedRut = formatRut(e.target.value);
                    field.onChange(formattedRut);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Email</FormLabel>
            <Input
              value={user.email}
              disabled
            />
        </FormItem>

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono móvil</FormLabel>
              <div className="flex">
                <Input
                    value="+56 9"
                    disabled
                    className="w-20 mr-2 border border-gray-300"
                  />
                <FormControl>
                  <Input
                    placeholder="0000 0000"
                    {...field}
                    onChange={(e) => {
                      const formatted = formatPhone(e.target.value);
                      field.onChange(formatted);
                    }}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="birthdate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha de nacimiento</FormLabel>
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
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    captionLayout="dropdown"
                    defaultMonth={field.value}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un color" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tailwindColors.map((color) => (
                    <SelectItem key={color} value={color}>
                      <StrAvatar color={color} name={''} className="size-3"/>
                      {color.charAt(0).toUpperCase() + color.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-1/2 flex ml-auto mt-4" isLoading={form.formState.isSubmitting}>
          Guardar Cambios
        </Button>
      </form>
    </Form>
  )
}