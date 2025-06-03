import dbConnect from "@/lib/dbConnect";
import { Record } from "@/models/Record";
import RecordsChart from "./RecordsChart";
import { format, startOfWeek } from "date-fns";

export async function RecordsCompleted({residentId}: { residentId: string }) {
    await dbConnect();
    const records = await Record.find({ resident: residentId }).lean();

    const weekMap: Record<string, number> = {};
    records.forEach((rec) => {
        const date = new Date(rec.createdAt);
        const weekStart = startOfWeek(date, { weekStartsOn: 1 });
        const weekStr = format(weekStart, "yyyy-MM-dd");
        weekMap[weekStr] = (weekMap[weekStr] || 0) + 1;
    });

    const data = Object.entries(weekMap)
        .map(([week, count]) => ({ week, count }))
        .sort((a, b) => a.week.localeCompare(b.week));

    return (
        <RecordsChart data={data} />
    );
    }