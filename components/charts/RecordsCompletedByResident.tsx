// components/charts/RecordsCompleted.tsx
import dbConnect from "@/lib/dbConnect";
import { Record } from "@/models/Record";
import { format, startOfWeek } from "date-fns";
import RecordsCompletedClient from "./RecordsCompletedClient";
import { Suspense } from "react";
import { ChartSkeleton } from "./ChartSkeleton";


export async function RecordsCompleted({ residentId }: { residentId: string }) {
  await dbConnect();
  const records = await Record.find({ resident: residentId }).lean();

  if (records.length === 0) {
    return <div></div>;
  }

  const weekMap: Record<string, number> = {};
  const monthMap: Record<string, number> = {};
  const yearMap: Record<string, number> = {};

  records.forEach((rec) => {
    const date = new Date(rec.date);

    // semanal
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const w = format(weekStart, "yyyy-MM-dd");
    weekMap[w] = (weekMap[w] || 0) + 1;

    // mensual
    const m = format(date, "yyyy-MM");
    monthMap[m] = (monthMap[m] || 0) + 1;

    // anual
    const y = format(date, "yyyy");
    yearMap[y] = (yearMap[y] || 0) + 1;
  });

  const toArray = (map: Record<string, number>) =>
    Object.entries(map)
      .map(([period, count]) => ({ period, count }))
      .sort((a, b) => a.period.localeCompare(b.period));

  return (
    <Suspense fallback={<ChartSkeleton />}>
      <RecordsCompletedClient
        weeklyData={toArray(weekMap)}
        monthlyData={toArray(monthMap)}
        yearlyData={toArray(yearMap)}
      />
    </Suspense>
  );
}
