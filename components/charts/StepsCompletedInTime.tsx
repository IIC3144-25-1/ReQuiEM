import { IRecord } from "@/models/Record";
import { format } from "date-fns";
import StepsCompletedChart from "./StepsCompletedChart";
import { Suspense } from "react";
import { ChartSkeleton } from "./ChartSkeleton";

export default async function StepsCompletedInTime({ records }: { records: IRecord[] }) {
  type DataRow = { date: string; percent: number; surgery: string };
  const data: DataRow[] = [];

  const validStatuses = ["corrected", "reviewed"];
  const filteredRecords = records.filter(
    (rec) => validStatuses.includes(rec.status)
  );

  filteredRecords.forEach((rec) => {
    const surgeryName = rec.surgery?.name;
    if (!surgeryName) return;
    const date = new Date(rec.date);
    const dateStr = format(date, "yyyy-MM-dd");

    const steps = Array.isArray(rec.steps) ? rec.steps : [];
    const totalSteps = steps.length;

    // Un paso cuenta como 1 si residentDone && teacherDone && score !== 'b'
    // Un paso cuenta como 0.5 si residentDone && teacherDone && score === 'b'
    let completedSteps = 0;
    steps.forEach((s) => {
      if (s.residentDone && s.teacherDone) {
        if (s.score === 'b') {
          completedSteps += 0.5;
        } else {
          completedSteps += 1;
        }
      }
    });

    data.push({
      date: dateStr,
      percent: totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0,
      surgery: surgeryName,
    });
  });

  const surgeries = Array.from(new Set(data.map((row) => row.surgery)));
  data.sort((a, b) => a.date.localeCompare(b.date));

  return (
    <Suspense fallback={<ChartSkeleton />}>
      <StepsCompletedChart data={data} surgeries={surgeries} />
    </Suspense>
  );
}