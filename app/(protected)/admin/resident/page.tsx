'use client'

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
/* import { seedDummyResident } from "@/actions/resident/seed";
import { seedDummyTeachers } from "@/actions/teacher/seed"; */
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit, Trash2Icon } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { IResident } from "@/models/Resident";
import { Head } from "@/components/head/Head";

export default function Page() {
  const [residents, setResidents] = useState<IResident[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getAllResident().then(setResidents);
  }, []);

  const handleDelete = (residentId: string) => {
    startTransition(async () => {
      await deleteResident(residentId);
      toast.success("Residente eliminado exitosamente");
      setResidents((prev) => prev.filter((r) => r._id.toString() !== residentId));
    });
  };

  /* const handleCreateDummy = async () => {
    await seedDummyTeachers();
    await seedDummyResident();
    const updated = await getAllResident();
    setResidents(updated);
  }; */

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
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {residents.map((resident) => (
            <TableRow key={resident._id.toString()}>
              <TableCell>{resident.user?.name || "Sin nombre"}</TableCell>
              <TableCell>{resident.user?.email || "Sin email"}</TableCell>
              <TableCell className="flex items-center">
                <Link href={`resident/edit/${resident._id}`}>
                  <Button size="icon" variant="outline" className="mr-2">
                    <Edit />
                  </Button>
                </Link>
                <Button
                  size="icon"
                  variant="outline"
                  className="hover:border-destructive"
                  onClick={() => handleDelete(resident._id.toString())}
                  disabled={isPending}
                >
                  <Trash2Icon />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableCaption>Residentes disponibles</TableCaption>
      </Table>
    </>
  );
}
