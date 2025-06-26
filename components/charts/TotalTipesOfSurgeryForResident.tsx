
import { IRecord } from "@/models/Record";
import { SurgeryPieChart } from "./SurgeryPieChart";
import { Suspense } from "react";
import { ChartSkeleton } from "./ChartSkeleton";

export async function TotalTypesOfSurgeryForResident({ records }: { records: IRecord[] }) {
    const surgeryCount: Record<string, number> = {};

    for (const record of records) {
        const surgeryName = record.surgery?.name;
        surgeryCount[surgeryName] = (surgeryCount[surgeryName] || 0) + 1;
    }

    const data = Object.entries(surgeryCount).map(([name, value]) => ({
        name,
        value,
    }));

    return (
    <Suspense fallback={<ChartSkeleton />}>
        <SurgeryPieChart data={data} />
    </Suspense>
    );
}