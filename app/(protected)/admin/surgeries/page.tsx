
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
import { Edit } from "lucide-react";
import { ISurgery } from "@/models/Surgery";
import { Head } from "@/components/head/Head";
import { Delete } from "@/components/tables/Delete";
  
export default async function Page() {
    const surgeries = await getSurgeries();
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
                            <Delete 
                                itemId={surgery._id.toString()} 
                                deleteAction={deleteSurgery} 
                                title="Eliminar cirugía"
                                description="¿Estás seguro de que deseas eliminar esta cirugía? Esta acción no se puede deshacer."
                            />
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
