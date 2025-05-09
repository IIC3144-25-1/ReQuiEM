"use server";

import RecordCard from "@/components/cards/record-card";
import { getRecordsByCurrentUser } from "@/actions/record/getByUser";
import { format } from "date-fns";
import { isITeacher, isISurgery, isIUser } from "@/utils/validation";


export default async function Records() {
  const records = await getRecordsByCurrentUser("resident");
  
  if (!records || records.length === 0) {
    return <div className="leading-none text-center pt-10">No tienes registros todavía</div>;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {records.map((r) => (
                <RecordCard
                key={r._id.toString()}
                    surgery={isISurgery(r.surgery) ? r.surgery.name : r.surgery.toString()}
                    date={format(new Date(r.date), 'dd/MM/yy')}
                    time={format(new Date(r.date), 'HH:mm')}
                    counterpartRole="Profesor"
                    counterpart={isITeacher(r.teacher) && isIUser(r.teacher.user) ? (r.teacher.user.name || "") : r.teacher.toString()}
                    dot={r.status === "corrected"}
                />
            ))}
        </div>
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