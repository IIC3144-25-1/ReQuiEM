"use server";

import { getRecordsByCurrentUser } from "@/actions/record/getByUser";
import TeacherRecordsClient from "@/components/records/TeacherClient";

export default async function RecordsPage() {
  const records = await getRecordsByCurrentUser("teacher");

  const serializableRecords = JSON.parse(JSON.stringify(records || []));

  return <TeacherRecordsClient records={serializableRecords} />;
}


// const registros = [
//     {
//       surgery: {
//         name: "Ureterorrenoscopía"
//       },
//       date: Date.now(),
//       resident: {
//         user: {
//           name: "Ricardo Pérez",
//         },
//       },
//       status: "corrected",
//     },
//     {
//       surgery: {
//         name: "Cistoscopía"
//       },
//       date: Date.now(),
//       resident: {
//         user: {
//           name: "Ricardo Pérez",
//         },
//       },
//       status: "corrected",
//     },
//     {
//       surgery: {
//         name: "Cistoscopía"
//       },
//       date: Date.now(),
//       resident: {
//         user: {
//           name: "Ricardo Pérez",
//         },
//       },
//       status: "reviewed"
//     },
//     {
//       surgery: {
//         name: "Cistoscopía"
//       },
//       date: Date.now(),
//       resident: {
//         user: {
//           name: "Ricardo Pérez",
//         },
//       },
//       status: "reviewed",
//     }
// ];
