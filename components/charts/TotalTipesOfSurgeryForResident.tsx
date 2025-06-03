
import dbConnect from "@/lib/dbConnect";
import { Record } from "@/models/Record";
import { SurgeryPieChart } from "./SurgeryPieChart";
import { Surgery } from "@/models/Surgery";

export async function TotalTypesOfSurgeryForResident({ residentId }: { residentId: string }) {
  await dbConnect();

    await Surgery.init(); // Ensure Surgery model is initialized
    const records = await Record.find({ resident: residentId }).populate('surgery').lean();

    const surgeryCount: Record<string, number> = {};

    for (const record of records) {
        const surgeryName = record.surgery?.name;
        surgeryCount[surgeryName] = (surgeryCount[surgeryName] || 0) + 1;
    }

    const data = Object.entries(surgeryCount).map(([name, value]) => ({
        name,
        value,
    }));

    console.log("Surgery Data:", data);
    

    return <SurgeryPieChart data={data} />;
}