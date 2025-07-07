// app/components/ScaleSummary.tsx
import { IRecord } from "@/models/Record";
import { format } from "date-fns";
import ScaleSummaryChart from "./ScaleSummaryChart";
import { Suspense } from "react";
import { ChartSkeleton } from "./ChartSkeleton";

export default async function ScaleSummary({ records }: { records: IRecord[] }) {
  // Sólo consideramos los estados finales
  const validStatuses = ["corrected", "reviewed"];
  const filtered = records.filter(
    (r) => validStatuses.includes(r.status) && r.surgery?.name
  );

  // Cirugías únicas
  const surgeries = Array.from(new Set(filtered.map((r) => r.surgery!.name)));

  type TableRow = { surgery: string; date: string; scale: string };

  const tableData: TableRow[] = [];
  surgeries.forEach((name) => {
    const recs = filtered
      .filter((r) => r.surgery!.name === name)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    recs.forEach((r) => {
      tableData.push({
        surgery: name,
        date: format(new Date(r.date), "dd/MM/yyyy"),
        scale: r.summaryScale,
      });
    });
  });

  return (
    <Suspense fallback={<ChartSkeleton />}>
      <ScaleSummaryChart
        surgeries={surgeries}
        data={tableData}
      />
    </Suspense>
  );
}
