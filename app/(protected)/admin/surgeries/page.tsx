
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
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit, Trash2Icon } from "lucide-react";
  
export default async function Page() {
    const surgeries = await getSurgeries();

    return (
        <>
        <div className="flex justify-between items-center py-4">
            <div>
                <h1 className="text-2xl font-bold">Bienvenido al panel de cirugias</h1>
                <p className="text-sm text-muted-foreground">Aquí puedes ver, editar y crear nuevas cirugías</p>
            </div>
            <div className="my-4">
                <Button asChild>
                    <Link href={"/admin/surgeries/new"}>Crear nueva cirugia</Link>
                </Button>
            </div>
        </div>
        <Table className="w-full">
            <TableHeader>
                <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Descripcion</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {surgeries.map((surgery) => (
                    <TableRow key={surgery._id.toString()}>
                        <TableCell>{surgery._id.toString()}</TableCell>
                        <TableCell>{surgery.name}</TableCell>
                        <TableCell>{surgery.description}</TableCell>
                        <TableCell>{surgery.area}</TableCell>
                        <TableCell>
                            {/* Add your action buttons here */}
                            <Button asChild size='icon' variant='outline' className="mr-2">
                                <Link href={`/admin/surgeries/${surgery._id}`}><Edit /></Link>
                            </Button>
                            <Button asChild size='icon' variant='outline' className="mr-2 hover:border-destructive">
                                <Link href={`/admin/surgeries/${surgery._id}/delete`}><Trash2Icon /></Link>
                            </Button>
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
