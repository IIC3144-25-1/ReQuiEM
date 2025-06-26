// @/components/teacher/TeacherDashboardClient.tsx
"use client";

import { useState, useEffect } from "react";
import { IResident } from "@/models/Resident";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSearchParams, useRouter } from 'next/navigation'


export default function ResidentSelect({ residents }: { residents: IResident[] }) {
  const searchParams = useSearchParams()
  const router = useRouter();
  const initialId = searchParams.get("resident") || residents[0]?._id.toString();
  const [selectedId, setSelectedId] = useState<string>(initialId);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("resident", selectedId);
    router.replace(`?${params.toString()}`);
  }, [router, searchParams, selectedId]);

  if (residents.length === 0) {
    return <p>No residents available.</p>;
  }

  return (
    <Select onValueChange={(value) => setSelectedId(value)} defaultValue={selectedId}>
      <SelectTrigger>
        <SelectValue placeholder="Seleciona un residente" />
      </SelectTrigger>
      <SelectContent>
        {residents.map((resident) => (
          <SelectItem value={resident._id.toString()} key={resident._id.toString()}>
            {resident.user?.name || "Sin nombre"}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
