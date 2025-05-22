"use client";
// import { FaBars, FaCog } from "react-icons/fa";
import RecordCard from "@/components/cards/record-card";
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react";
import Link from "next/link";

const registros = [
  {
    surgery: "Ureterorrenoscopía",
    date: "04/08/2024",
    professor: "Ricardo Pérez",
    status: "corrected",
    time: "15:00",
  },
  {
    surgery: "Cistoscopía",
    date: "06/08/2024",
    professor: "Ricardo Pérez",
    status: "corrected",
    time: "16:45",
  },
  {
    surgery: "Ureteroscopía Flex",
    date: "01/08/2024",
    professor: "Ricardo Pérez",
    status: "reviewed",
    time: "13:30",
  },
  {
    surgery: "Cistoscopía",
    date: "10/08/2024",
    professor: "Nicolás Pérez",
    status: "reviewed",
    time: "9:00",
  },
];

export default function Registros() {

    return (
        <div className="min-h-screen bg-white flex flex-col relative">
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {registros.map((reg, idx) => (
                  <RecordCard
                      key={idx}
                      surgery={reg.surgery}
                      date={reg.date}
                      time={reg.time}
                      counterpartRole="Profesor"
                      counterpart={reg.professor}
                      dot={reg.status === "corrected"}
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
