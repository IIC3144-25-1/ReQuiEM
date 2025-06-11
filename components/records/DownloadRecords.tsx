"use server";

import { getRecordsByCurrentUser } from "@/actions/record/getByUser";

export async function DownloadRecords(side: "resident" | "teacher") {
  const records = await getRecordsByCurrentUser(side);
  return JSON.parse(JSON.stringify(records));
}