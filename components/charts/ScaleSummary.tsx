// app/components/ScaleSummary.tsx
import dbConnect from "@/lib/dbConnect";
import { Record } from "@/models/Record";
import { format } from "date-fns";
import ScaleSummaryChart from "./ScaleSummaryChart";
import { Suspense } from "react";
import { ChartSkeleton } from "./ChartSkeleton";

export default async function ScaleSummary({ residentId }: { residentId: string }) {
  await dbConnect();
  const records = await Record.find({ resident: residentId })
    .populate({ path: "surgery", select: "name" })
    .lean();

  if (records.length === 0) {
    return <div>No hay registros.</div>;
  }

  // Sólo consideramos los estados finales
  const validStatuses = ["corrected", "reviewed"];
  const filtered = records.filter(
    (r) => validStatuses.includes(r.status) && r.surgery?.name
  );

  // Cirugías únicas
  const surgeries = Array.from(new Set(filtered.map((r) => r.surgery!.name)));

  type TableRow = { surgery: string; date: string; scale: string };

  // Para cada cirugía, ordenamos por fecha descendente y tomamos los 5 primeros
  const tableData: TableRow[] = [];
  surgeries.forEach((name) => {
    const recs = filtered
      .filter((r) => r.surgery!.name === name)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

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
