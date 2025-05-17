"use server";

import { getRecordsByCurrentUser } from "@/actions/record/getByUser";
import RecordsClient from "@/components/records/ResidentClient";

export default async function RecordsPage() {
  const records = await getRecordsByCurrentUser("resident");
  console.log(records);

  const serializableRecords = JSON.parse(JSON.stringify(records || []));

  return <RecordsClient records={serializableRecords} />;
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