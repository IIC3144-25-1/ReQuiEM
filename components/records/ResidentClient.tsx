"use client";

import { useState } from "react";
import RecordCard from "@/components/cards/record-card";
import { RecordsFilterInput, RecordsFilterSelect } from "@/components/filters/RecordsFilters";
import { Head } from "../head/Head";
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
        <div className="leading-none text-center pt-10">No tienes registros todavía</div>
        <Link href="/resident/new-record">
          <Button className="fixed bottom-20 right-20" >
            <PlusIcon className="mr-2" />
            Crear Registro
          </Button>
        </Link>
      </div>
    )
  }

  const statusLabels = {
    all: "Todos",
    pending: "Pendiente",
    corrected: "Corregido",
    // reviewed: "Revisado",
    // canceled: "Cancelado",
  };
  const statusOptions = ["all", "pending", "corrected"]; //, "reviewed", "canceled"

  const filteredRecords = records.filter((r) => {
    const validSurgery = isISurgery(r.surgery) && typeof r.surgery.name === "string";
    const validTeacher = isITeacher(r.teacher) && isIUser(r.teacher.user) && typeof r.teacher.user.name === "string";

    if (validSurgery && validTeacher) {
      const matchesSearch = r.surgery.name.toLowerCase().includes(searchSurgery.toLowerCase());
      const matchesTeacher = r.teacher.user.name.toLowerCase().includes(searchTeacher.toLowerCase());
      const matchesStatus = statusFilter === "all" || r.status === statusFilter
        || (r.status === "reviewed" && statusFilter === "corrected") || !statusFilter;
      return matchesSearch && matchesStatus && matchesTeacher;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      <Head
        title="Tus Registros"
        description="Aquí puedes ver y crear nuevos registros"
        components={[
          <div key="1" className="flex flex-row gap-2 sm:gap-4">
            <RecordsFilterInput
              search={searchSurgery}
              setSearch={setSearchSurgery}
              searchPlaceholder="Buscar por cirugía..."
            />
            <RecordsFilterInput
              search={searchTeacher}
              setSearch={setSearchTeacher}
              searchPlaceholder="Buscar por profesor..."
            />
          </div>,
          <div key="2" className="w-1/2 sm:w-full">
            <RecordsFilterSelect
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              statusLabels={statusLabels}
              statusOptions={statusOptions}
            />
          </div>,
          <Link href="/resident/new-record" key="3">
            <Button className="hidden sm:flex" >
            <PlusIcon/>
              Crear Registro
            </Button>
          </Link>
        ]}
      />
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredRecords.map((r) => (
        <Link key={r._id.toString()} href={`/resident/records/${r._id}`}>
          <RecordCard
            surgery={isISurgery(r.surgery) ? r.surgery.name : r.surgery.toString()}
            date={format(new Date(r.date), "dd/MM/yy")}
            time={format(new Date(r.date), "HH:mm")}
            counterpartRole="Profesor"
            counterpart={isITeacher(r.teacher) && isIUser(r.teacher.user) ? (r.teacher.user.name || "") : r.teacher.toString()}
            dot={r.status === "corrected"}
          />
        </Link>
      ))}

      </div>

      <Link href="/resident/new-record" className="">
        <Button className="fixed bottom-10 right-10 sm:hidden" >
          <PlusIcon className=""/>
          Crear Registro
        </Button>
      </Link>
    </div>
  );
}
