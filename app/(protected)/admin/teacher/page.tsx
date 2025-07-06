// app/admin/teacher/page.tsx
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import Link from "next/link";
import { getAllTeachers } from "@/actions/teacher/getAll";
import { deleteTeacher } from "@/actions/teacher/delete";
import { Head } from "@/components/head/Head";
import { Delete } from "@/components/tables/Delete";

export default async function Page() {
  const teachers = await getAllTeachers();


  return (
    <>
    <Head title="Panel de profesores" description="Aquí puedes ver, editar y crear nuevos profesores" 
    components={[
          <Link href={"/admin/teacher/new"} key={"new-teacher-link"}>
            <Button>
              Crear nuevo profesor
            </Button>
          </Link>
      ]} />
  

      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Mail</TableHead>
            <TableHead>Área</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teachers.map((teacher) => (
            <TableRow key={teacher._id.toString()}>
              <TableCell>{teacher.user?.name || "Sin nombre"}</TableCell>
              <TableCell>{teacher.user?.email || "Sin email"}</TableCell>
              <TableCell>{teacher.area?.name || "Sin área"}</TableCell>
              <TableCell className="flex items-center">
                <Link href={`/admin/teacher/edit/${teacher._id}`}>
                  <Button size="icon" variant="outline" className="mr-2">
                    <Edit />
                  </Button>
                </Link>
                <Delete
                  itemId={teacher._id.toString()}
                  deleteAction={deleteTeacher}
                  title="Eliminar profesor"
                  description="¿Estás seguro de que deseas eliminar este profesor? Esta acción no se puede deshacer."
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableCaption>Profesores registrados</TableCaption>
      </Table>
    </>
  );
}
