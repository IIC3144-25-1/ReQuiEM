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
import { Edit, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { getAllTeachers } from "@/actions/teacher/getAll";
import { deleteTeacher } from "@/actions/teacher/delete";
import { Head } from "@/components/head/Head";

export default async function Page() {
  const teachers = await getAllTeachers();

  const handleDelete = async (data: FormData) => {
    'use server'
    const teacherId = data.get("teacherId") as string;
    await deleteTeacher(teacherId);
    revalidatePath("/admin/teacher");
  };

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
            <TableHead>Email</TableHead>
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
                <form action={handleDelete}>
                  <input name="teacherId" className="hidden" value={teacher._id.toString()} readOnly />
                  <Button size="icon" variant="outline" className="mr-2 hover:border-destructive" type="submit">
                    <Trash2Icon />
                  </Button>
                </form>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableCaption>Profesores registrados</TableCaption>
      </Table>
    </>
  );
}
