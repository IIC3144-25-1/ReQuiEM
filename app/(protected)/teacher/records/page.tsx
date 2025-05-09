"use client";
// import { FaBars, FaCog } from "react-icons/fa";
import RecordCard from "@/components/cards/record-card";

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
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      {/* <div className="bg-purple-800 text-white px-4 py-5 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-semibold">Registros</h1>
      </div> */}

      {/* Lista de registros */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {registros.map((reg, idx) => (
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
