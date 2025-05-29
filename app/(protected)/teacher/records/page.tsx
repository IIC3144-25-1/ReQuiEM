"use server";

import { getRecordsByCurrentUser } from "@/actions/record/getByUser";
import TeacherRecordsClient from "@/components/records/TeacherClient";

export default async function RecordsPage() {
  const records = await getRecordsByCurrentUser("teacher");

  const serializableRecords = JSON.parse(JSON.stringify(records || []));

  return <TeacherRecordsClient records={serializableRecords} />;
}