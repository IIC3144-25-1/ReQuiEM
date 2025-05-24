import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { getAllAreas } from "@/actions/area/getAll";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit, Trash2Icon } from "lucide-react";
import { revalidatePath } from "next/cache";
import { deleteArea } from "@/actions/area/delete";
  
export default async function Page() {
    const areas = await getAllAreas();

    const handleDelete = async (data: FormData) => {
        'use server'
        const areaId = data.get("areaId") as string
        await deleteArea(areaId);
        // Revalidate the page to show the updated list of surgeries
        // This is a workaround for the lack of revalidation in server actions

        revalidatePath("/admin/areas");
    }

    return (
        <>
        <div className="flex justify-between items-center py-4">
            <div>
                <h1 className="text-2xl font-bold">Bienvenido al panel de áreas</h1>
                <p className="text-sm text-muted-foreground">Aquí puedes ver, editar y crear nuevas áreas</p>
            </div>
            <div className="my-4">
                <Button asChild>
                    <Link href={"/admin/areas/new"}>Crear nueva área</Link>
                </Button>
            </div>
        </div>
        <Table className="w-full">
            <TableHeader>
                <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Descripcion</TableHead>
                    <TableHead>Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {areas.map((area) => (
                    <TableRow key={area._id.toString()}>
                        <TableCell>{area.name}</TableCell>
                        <TableCell>{area.description}</TableCell>
                        <TableCell className="flex items-center">
                            <Button asChild size='icon' variant='outline' className="mr-2">
                                <Link href={`/admin/areas/edit/${area._id}`}><Edit /></Link>
                            </Button>
                            <form action={handleDelete}>
                                <input name="areaId" className="hidden" value={area._id.toString()} readOnly/>
                                <Button size='icon' variant='outline' className="mr-2 hover:border-destructive" type="submit">
                                    <Trash2Icon />
                                </Button>
                            </form> 
                        </TableCell>
                    </TableRow>
                ))
                }
            </TableBody>
            <TableCaption>
                Areas disponibles
            </TableCaption>
        </Table> 
        </>
    )
}
