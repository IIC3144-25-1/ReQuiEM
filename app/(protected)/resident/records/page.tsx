"use server";

import { getRecordsByCurrentUser } from "@/actions/record/getByUser";
import ResidentRecordsClient from "@/components/records/ResidentClient";

export default async function RecordsPage() {
  const records = await getRecordsByCurrentUser("resident");
  const serializableRecords = JSON.parse(JSON.stringify(records || []));

  return <ResidentRecordsClient records={serializableRecords} />
}
