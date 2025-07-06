
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllResident } from "@/actions/resident/getAll";
import { deleteResident } from "@/actions/resident/delete";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit } from "lucide-react";
import { Head } from "@/components/head/Head";
import { Delete } from "@/components/tables/Delete";

export default async function Page() {
  const residents = await getAllResident();

  return (
    <>
      <Head
        title="Panel de Residentes"
        description="Aquí puedes ver, editar y crear nuevos residentes"
        components={[
          <Link href="/admin/resident/new" key="new-resident-link">
            <Button>
              Crear nuevo residente
            </Button>
          </Link>,
        ]}
      />

      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Mail</TableHead>
            <TableHead>Área</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {residents.map((resident) => (
            <TableRow key={resident._id.toString()}>
              <TableCell>{resident.user?.name || "Sin nombre"}</TableCell>
              <TableCell>{resident.user?.email || "Sin email"}</TableCell>
              <TableCell>{resident.area?.name || "Sin área"}</TableCell>
              <TableCell className="flex items-center">
                <Link href={`resident/edit/${resident._id}`}>
                  <Button size="icon" variant="outline" className="mr-2">
                    <Edit />
                  </Button>
                </Link>
                <Delete
                  itemId={resident._id.toString()}
                  deleteAction={deleteResident}
                  title="Eliminar residente"
                  description="¿Estás seguro de que deseas eliminar este residente? Esta acción no se puede deshacer."
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableCaption>Residentes disponibles</TableCaption>
      </Table>
    </>
  );
}
