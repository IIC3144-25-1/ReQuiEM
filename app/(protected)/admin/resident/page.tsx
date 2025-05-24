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
      <div className="flex justify-between items-center py-4">
        <h1 className="text-2xl font-bold">Residentes</h1>
        <div className="space-x-2">
          {/* <Button onClick={handleCreateDummy}>Crear Residente Dummy</Button> */}
          <Button asChild>
            <Link href="/admin/resident/new">Crear Residente</Link>
          </Button>
        </div>
      </div>

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
                <Button asChild size="icon" variant="outline" className="mr-2">
                  <Link href={`resident/edit/${resident._id}`}>
                    <Edit />
                  </Link>
                </Button>
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
