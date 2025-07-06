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
import { Edit} from "lucide-react";
import { deleteArea } from "@/actions/area/delete";
import { Head } from "@/components/head/Head";
import { Delete } from "@/components/tables/Delete";
  
export default async function Page() {
    const areas = await getAllAreas();

    return (
        <>
        <Head
            title="Panel de áreas"
            description="Aquí puedes ver, editar y crear nuevas áreas"
            components={[
                <Link href={"/admin/areas/new"} key={"new-area-link"}>
                    <Button>
                        Crear nueva área
                    </Button>
                </Link>
            ]}
        />
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
                            <Link href={`/admin/areas/edit/${area._id}`}>
                                <Button size='icon' variant='outline' className="mr-2">
                                    <Edit />
                                </Button>
                            </Link>
                            <Delete 
                                itemId={area._id.toString()} 
                                deleteAction={deleteArea} 
                                title="Eliminar área"
                                description="¿Estás seguro de que deseas eliminar esta área? Esta acción no se puede deshacer."
                            /> 
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
