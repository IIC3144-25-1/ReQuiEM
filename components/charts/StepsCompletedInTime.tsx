import dbConnect from "@/lib/dbConnect";
import { Record } from "@/models/Record";
import { format } from "date-fns";
import StepsCompletedChart from "./StepsCompletedChart";

export default async function StepsCompletedInTime({ residentId }: { residentId: string }) {
  await dbConnect();
  const records = await Record.find({ resident: residentId })
    .populate({ path: "surgery", select: "name" })
    .lean();

  if (records.length === 0) {
        return <div></div>;
    }

  // Creamos un array con { month, percent, surgery }
  type DataRow = { month: string; percent: number; surgery: string };
  const data: DataRow[] = [];

  const validStatuses = ["corrected", "reviewed"];
  const filteredRecords = records.filter(
    (rec) => validStatuses.includes(rec.status)
  );

  // Agrupamos por cirugía y mes
  const surgeryMonthMap: Record<string, Record<string, { completed: number; total: number }>> = {};

  filteredRecords.forEach((rec) => {
    const surgeryName = rec.surgery?.name;
    if (!surgeryName) return;
    const date = new Date(rec.date);
    const monthStr = format(date, "yyyy-MM");
    if (!surgeryMonthMap[surgeryName]) surgeryMonthMap[surgeryName] = {};
    if (!surgeryMonthMap[surgeryName][monthStr]) surgeryMonthMap[surgeryName][monthStr] = { completed: 0, total: 0 };

    const steps = Array.isArray(rec.steps) ? rec.steps : [];
    const totalSteps = steps.length;
    const completedSteps = steps.filter((s) => s.residentDone && s.teacherDone).length;

    surgeryMonthMap[surgeryName][monthStr].completed += completedSteps;
    surgeryMonthMap[surgeryName][monthStr].total += totalSteps;
  });

  // Convertimos el map a un array plano
  Object.entries(surgeryMonthMap).forEach(([surgery, months]) => {
    Object.entries(months).forEach(([month, { completed, total }]) => {
      data.push({
        month,
        percent: total > 0 ? Math.round((completed / total) * 100) : 0,
        surgery,
      });
    });
  });

  // Extrae cirugías únicas para el select del cliente
  const surgeries = Object.keys(surgeryMonthMap);

  // Ordena los datos por mes
  data.sort((a, b) => a.month.localeCompare(b.month));

  // Pasa todos los datos y las cirugías al cliente
  return <StepsCompletedChart data={data} surgeries={surgeries} />;
}