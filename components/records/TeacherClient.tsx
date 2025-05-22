"use client";

import { useState } from "react";
import RecordCard from "@/components/cards/record-card";
import { RecordsFilters } from "@/components/filters/RecordsFilters";
import { format } from "date-fns";
import { isIResident, isISurgery, isIUser } from "@/utils/validation";

interface RecordType {
  _id: string;
  surgery: { name: string };
  resident: { user: { name: string } };
  date: string | Date;
  status: string;
}

export default function TeacherRecordsClient({ records }: { records: RecordType[] }) {
  const [searchSurgery, setSearchSurgery] = useState("");
  const [searchResident, setSearchResident] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  if (!records || records.length === 0) {
    return <div className="leading-none text-center pt-10">No tienes registros todavía</div>;
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
    const validResident = isIResident(r.resident) && isIUser(r.resident.user) && typeof r.resident.user.name === "string";
    if (validSurgery && validResident) {
      const matchesSearch = r.surgery.name.toLowerCase().includes(searchSurgery.toLowerCase());
      const matchesResident = r.resident.user.name.toLowerCase().includes(searchResident.toLowerCase());
      const matchesStatus = statusFilter === "all" || !statusFilter ? true : r.status === statusFilter;
      return matchesSearch && matchesStatus && matchesResident;
    }
    return true;
  });

  if (!records || records.length === 0) {
    return <div className="leading-none text-center pt-10">No tienes registros todavía</div>;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <RecordsFilters
        search1={searchSurgery}
        setSearch1={setSearchSurgery}
        search1Placeholder="Buscar por cirugía..."
        search2={searchResident}
        setSearch2={setSearchResident}
        search2Placeholder="Buscar por residente..."
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
            counterpartRole="Residente"
            counterpart={isIResident(r.resident) && isIUser(r.resident.user) ? (r.resident.user.name || "") : r.resident.toString()}
            dot={r.status === "pending"}
          />
        ))}
      </div>
    </div>
  );
}
