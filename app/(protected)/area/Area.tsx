'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation"
import { StrAvatar } from "@/components/ui/avatar";
import { IArea } from "@/models/Area";
import { isTailwindColor } from "@/utils/colors";


export default function Area({area} : {area: IArea}) {
  const router = useRouter();
  return (
    <div>
      <h1 className="leading-none font-semibold text-2xl px-6 py-2 my-2 sm:mb-0">{area.name}</h1>

      <h2 className="leading-none font-semibold text-lg px-6 py-2 mb-2 mt-10 sm:mb-0">Profesores</h2>
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {area.teachers.map((teacher) => (
            <TableRow key={teacher._id.toString()} onClick={() => router.push(`/area/${teacher.user?._id}`)}>
              <TableCell>
                <StrAvatar 
                color={ teacher.user.image || "gray" }
                name={teacher.user?.name || ""} />
              </TableCell>
              <TableCell>{teacher.user?.name || "Sin nombre"}</TableCell>
              <TableCell>{teacher.user?.email || "Sin email"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <h2 className="leading-none font-semibold text-lg px-6 py-2 mb-2 mt-10  sm:mb-0">Residentes</h2>
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {area.residents.map((resident) => (
            <TableRow key={resident._id.toString()} onClick={() => router.push(`/area/${resident.user?._id}`)}>
              <TableCell><StrAvatar 
                color={ isTailwindColor(resident.user?.image) ? resident.user.image : 'gray' }
                name={resident.user?.name || ""} />
              </TableCell>
              <TableCell>{resident.user?.name || "Sin nombre"}</TableCell>
              <TableCell>{resident.user?.email || "Sin email"}</TableCell>
             
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
