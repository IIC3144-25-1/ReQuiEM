"use client";
import { useState } from "react";
import RecordCard from "@/components/cards/record-card";
import { RecordsFilters } from "@/components/filters/RecordsFilters";

const records = [
  {
    surgery: "Ureterorrenoscopía",
    date: "04/08/2024",
    professor: "Ricardo Pérez",
    status: "pending",
    time: "15:00",
  },
  {
    surgery: "Cistoscopía",
    date: "06/08/2024",
    professor: "Ricardo Pérez",
    status: "pending",
    time: "16:45",
  },
  {
    surgery: "Ureteroscopía Flex",
    date: "01/08/2024",
    professor: "Ricardo Pérez",
    status: "corrected",
    time: "13:30",
  },
  {
    surgery: "Cistoscopía",
    date: "10/08/2024",
    professor: "Nicolás Pérez",
    status: "corrected",
    time: "9:00",
  },
];

export default function Registros() {
  const [searchSurgery, setSearchSurgery] = useState("");
  const [searchResident, setSearchResident] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const statusLabels = {
    all: "Todos",
    pending: "Pendiente",
    corrected: "Corregido",
  };
  const statusOptions = ["all", "pending", "corrected"];

  const filteredRecords = records.filter((rec) => {
    const matchesSearch = rec.surgery.toLowerCase().includes(searchSurgery.toLowerCase());
    const matchesResident = rec.professor.toLowerCase().includes(searchResident.toLowerCase());
    const matchesStatus = statusFilter === "all" || !statusFilter ? true : rec.status === statusFilter;
    return matchesSearch && matchesStatus && matchesResident;
  });

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
        {filteredRecords.map((rec, idx) => (
          <RecordCard
            key={idx}
            surgery={rec.surgery}
            date={rec.date}
            time={rec.time}
            counterpartRole="Residente"
            counterpart={rec.professor}
            dot={rec.status === "pending"}
          />
        ))}
      </div>
    </div>
  );
}