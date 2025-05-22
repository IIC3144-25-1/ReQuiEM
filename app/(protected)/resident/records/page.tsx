"use server";
// import { FaBars, FaCog } from "react-icons/fa";
import RecordCard from "@/components/cards/record-card";
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { getRecordsByCurrentUser } from "@/actions/record/getByUser";
import ResidentRecordsClient from "@/components/records/ResidentClient";

export default async function RecordsPage() {
  const records = await getRecordsByCurrentUser("resident");
  const serializableRecords = JSON.parse(JSON.stringify(records || []));

  return (
      <div className="min-h-screen bg-white flex flex-col relative">
          <ResidentRecordsClient records={serializableRecords} />
          <Button className="fixed bottom-20 right-20" >
            <PlusIcon className="mr-2" />
            <Link href="/resident/new-record">Crear Registro</Link>
          </Button>
      </div>
  );
}

  // const registros = [
  //   {
  //     surgery: {
  //       name: "Ureterorrenoscopía"
  //     },
  //     date: Date.now(),
  //     teacher: {
  //       user: {
  //         name: "Ricardo Pérez",
  //       },
  //     },
  //     status: "corrected",
  //   },
  //   {
  //     surgery: {
  //       name: "Cistoscopía"
  //     },
  //     date: Date.now(),
  //     teacher: {
  //       user: {
  //         name: "Ricardo Pérez",
  //       },
  //     },
  //     status: "corrected",
  //   },
  //   {
  //     surgery: {
  //       name: "Cistoscopía"
  //     },
  //     date: Date.now(),
  //     teacher: {
  //       user: {
  //         name: "Ricardo Pérez",
  //       },
  //     },
  //     status: "reviewed"
  //   },
  //   {
  //     surgery: {
  //       name: "Cistoscopía"
  //     },
  //     date: Date.now(),
  //     teacher: {
  //       user: {
  //         name: "Ricardo Pérez",
  //       },
  //     },
  //     status: "reviewed",
  //   }
  // ];