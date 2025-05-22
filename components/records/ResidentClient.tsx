"use client";

import { useState } from "react";
import RecordCard from "@/components/cards/record-card";
import { RecordsFilters } from "@/components/filters/RecordsFilters";
import { format } from "date-fns";
import { isISurgery, isITeacher, isIUser } from "@/utils/validation";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

interface RecordType {
  _id: string;
  surgery: { name: string };
  teacher: { user: { name: string } };
  date: string | Date;
  status: string;
}

export default function ResidentRecordsClient({ records }: { records: RecordType[] }) {
  const [searchSurgery, setSearchSurgery] = useState("");
  const [searchTeacher, setSearchTeacher] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  if (!records || records.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col relative">
        <div className="leading-none text-center pt-10">No tienes registros todavía</div>;
        <Button className="fixed bottom-20 right-20" >
          <PlusIcon className="mr-2" />
          <Link href="/resident/new-record">Crear Registro</Link>
        </Button>
      </div>
    )
  }

  const statusLabels = {
    all: "Todos",
    pending: "Pendiente",
    corrected: "Corregido",
    reviewed: "Revisado",
    canceled: "Cancelado",
  };
  const statusOptions = ["all", "pending", "corrected", "reviewed", "canceled"];

  const filteredRecords = records.filter((r) => {
    const validSurgery = isISurgery(r.surgery) && typeof r.surgery.name === "string";
    const validTeacher = isITeacher(r.teacher) && isIUser(r.teacher.user) && typeof r.teacher.user.name === "string";

    if (validSurgery && validTeacher) {
      const matchesSearch = r.surgery.name.toLowerCase().includes(searchSurgery.toLowerCase());
      const matchesTeacher = r.teacher.user.name.toLowerCase().includes(searchTeacher.toLowerCase());
      const matchesStatus = statusFilter === "all" || !statusFilter ? true : r.status === statusFilter;
      return matchesSearch && matchesStatus && matchesTeacher;
    }
    return true;
  });

  if (!records || records.length === 0) {
    return (
      <div>
        <div className="leading-none text-center pt-10">No tienes registros todavía</div>;
        
      </div>
      
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      <RecordsFilters
        search1={searchSurgery}
        setSearch1={setSearchSurgery}
        search1Placeholder="Buscar por cirugía..."
        search2={searchTeacher}
        setSearch2={setSearchTeacher}
        search2Placeholder="Buscar por profesor..."
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        statusLabels={statusLabels}
        statusOptions={statusOptions}
      />
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRecords.map((r) => (
          <RecordCard
            key={r._id.toString()}
            surgery={isISurgery(r.surgery) ? r.surgery.name : r.surgery.toString()}
            date={format(new Date(r.date), "dd/MM/yy")}
            time={format(new Date(r.date), "HH:mm")}
            counterpartRole="Profesor"
            counterpart={isITeacher(r.teacher) && isIUser(r.teacher.user) ? (r.teacher.user.name || "") : r.teacher.toString()}
            dot={r.status === "corrected"}
          />
        ))}
      </div>
      <Button className="fixed bottom-20 right-20" >
        <PlusIcon className="mr-2" />
        <Link href="/resident/new-record">Crear Registro</Link>
      </Button>
    </div>
  );
}
