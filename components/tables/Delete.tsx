'use client'

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2Icon } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

type DeleteProps = {
  itemId: string
  deleteAction: (id: string) => Promise<unknown>
  title?: string
  description?: string
}

type FormValues = {
  itemId: string
}

export function Delete({
  itemId,
  deleteAction,
  title = "Eliminar elemento",
  description = "¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer."
}: DeleteProps) {

    const { handleSubmit, register, reset, formState } = useForm<FormValues>({
        defaultValues: { itemId }
    })

    const onSubmit = async (values: FormValues) => {
        try {
            await deleteAction(values.itemId)
            toast.success("Eliminado correctamente")
            reset()
        } catch (err) {
            toast.error("Error al eliminar")
            console.error(err)
        }
  }

  return (
    <Dialog>
        <DialogTrigger asChild>
          <Button size="icon" variant="outline">
            <Trash2Icon />
          </Button>
        </DialogTrigger>
        <DialogContent>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <input type="hidden" {...register("itemId")} />
                <DialogFooter className="flex flex-row justify-between">
                    <DialogClose asChild>
                        <Button variant="outline" disabled={formState.isSubmitting}>
                            Cancelar
                        </Button>
                    </DialogClose>
                    <Button type="submit" variant="destructive" isLoading={formState.isSubmitting}>
                        Eliminar
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
  )
}
