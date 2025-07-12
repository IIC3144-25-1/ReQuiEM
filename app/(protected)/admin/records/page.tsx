
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Head } from "@/components/head/Head";
import { Delete } from "@/components/tables/Delete";
import { getAllRecords } from "@/actions/record/getAll";
import { deleteRecord } from "@/actions/record/delete";

export default async function Page() {
  const records = await getAllRecords();

  return (
    <>
      <Head
        title="Panel de Registros"
        description="Aquí puedes ver y borrar registros de residentes"
        components={[]}
      />

      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Residente</TableHead>
            <TableHead>Mail</TableHead>
            <TableHead>Cirugía</TableHead>
            <TableHead>Id Paciente</TableHead>
            <TableHead>Fecha de Creación</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record._id.toString()}>
              <TableCell>{record.resident.user.name || "Sin nombre"}</TableCell>
              <TableCell>{record.resident.user.email || "Sin email"}</TableCell>
              <TableCell>{record.surgery.name}</TableCell>
              <TableCell>{record.patientId}</TableCell>
                <TableCell>
                    {new Date(record.createdAt).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    })}
                </TableCell>    
              <TableCell className="flex items-center">
                <Delete
                  itemId={record._id.toString()}
                  deleteAction={deleteRecord}
                  title="Eliminar registro"
                  description="¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer."
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableCaption>Registros disponibles</TableCaption>
      </Table>
    </>
  );
}