"use client";
import { useState } from "react";
import RecordCard from "@/components/cards/record-card";
import { Input } from "@/components/ui/input"; // Componente Input de shadcn
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select"; // Componente Select de shadcn

const registros = [
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

  const filteredRecords = registros.filter((reg) => {
    const matchesSearch = reg.surgery.toLowerCase().includes(searchSurgery.toLowerCase());
    const matchesAlumno = reg.professor.toLowerCase().includes(searchResident.toLowerCase());
    const matchesStatus = statusFilter === "all" || !statusFilter ? true : reg.status === statusFilter;
    return matchesSearch && matchesStatus && matchesAlumno;
  });

  const statusLabels: { [key: string]: string } = {
    all: "Todos",
    pending: "Pendiente",
    corrected: "Corregido",
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Filtros */}
      <div className="p-4 flex flex-col md:flex-row gap-4">
        {/* Buscador por cirugía*/}
        <Input
          placeholder="Buscar por cirugía..."
          value={searchSurgery}
          onChange={(e) => setSearchSurgery(e.target.value)}
          className="w-full md:w-1/2"
        />

        {/* Buscador por residente*/}
        <Input
          placeholder="Buscar por residente..."
          value={searchResident}
          onChange={(e) => setSearchResident(e.target.value)}
          className="w-full md:w-1/2"
        />

        {/* Filtro por estado */}
        <Select onValueChange={(value) => setStatusFilter(value)} value={statusFilter}>
          <SelectTrigger className="w-full md:w-1/4">
            <span>{statusLabels[statusFilter] || "Filtrar por estado"}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="corrected">Corregido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de registros */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRecords.map((reg, idx) => (
          <RecordCard
            key={idx}
            surgery={reg.surgery}
            date={reg.date}
            time={reg.time}
            counterpartRole="Residente"
            counterpart={reg.professor}
            dot={reg.status === "pending"}
          />
        ))}
      </div>
    </div>
  );
}