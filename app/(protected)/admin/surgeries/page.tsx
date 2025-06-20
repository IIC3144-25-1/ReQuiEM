
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { getSurgeries } from "@/actions/surgery/getSurgeries";
import { deleteSurgery } from "@/actions/surgery/deleteSurgery";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit, Trash2Icon } from "lucide-react";
import { revalidatePath } from "next/cache";
import { ISurgery } from "@/models/Surgery";
import { Head } from "@/components/head/Head";
  
export default async function Page() {
    const surgeries = await getSurgeries();

    // No la vamos a llamar porque eliminar una cirugía puede romper toda la página
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleDelete = async (data: FormData) => {
        const confirmed = window.confirm("¿Estás seguro de que deseas eliminar esta cirugía? Esta acción no se puede deshacer.")
        if (confirmed) {
            const surgeryId = data.get("surgeryId") as string
            await deleteSurgery(surgeryId);
            // Revalidate the page to show the updated list of surgeries
            // This is a workaround for the lack of revalidation in server actions

            revalidatePath("/admin/surgeries");
        }
        
    }

    return (
        <>
        <Head title="Panel de cirugías" description="Aquí puedes ver, editar y crear nuevas cirugías"
        components={[
            <Link href={"/admin/surgeries/new"} key={"new-surgery-link"}>
                <Button>
                    Crear nueva cirugia
                </Button>
            </Link>
        ]} />
        <Table className="w-full">
            <TableHeader>
                <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Descripcion</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {surgeries.map((surgery: ISurgery) => (
                    <TableRow key={surgery._id.toString()}>
                        <TableCell>{surgery.name}</TableCell>
                        <TableCell>{surgery.description}</TableCell>
                        <TableCell>{surgery.area.name}</TableCell>
                        <TableCell className="flex items-center">
                            <Link href={`/admin/surgeries/edit/${surgery._id}`}>
                                <Button size='icon' variant='outline' className="mr-2">
                                    <Edit />
                                </Button>
                            </Link>
                            <form>
                                <input name="surgeryId" className="hidden" value={surgery._id.toString()} readOnly/>
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
                Cirugias disponibles
            </TableCaption>
        </Table> 
        </>
    )
}
