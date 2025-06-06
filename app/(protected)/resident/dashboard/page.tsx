import { getUserResident } from "@/actions/resident/getByCurrentUser";
import { ChartSkeleton } from "@/components/charts/ChartSkeleton";
import { RecordsCompleted } from "@/components/charts/RecordsCompletedByResident";
import { TotalTypesOfSurgeryForResident } from "@/components/charts/TotalTipesOfSurgeryForResident";
import { Suspense } from "react";
import { DownloadRecordsButton } from "@/components/records/DownloadRecordsButton";


export default async function DashboardPage() {
  const resident = await getUserResident();

  if (!resident) {
    return <p className="text-gray-500">No resident data found.</p>;
  }
  return (
    <div className="flex flex-col gap-8 items-center justify-center h-full">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <Suspense fallback={<ChartSkeleton />}>
        <RecordsCompleted residentId={resident._id.toString()} />
      </Suspense>

      <Suspense fallback={<ChartSkeleton />}>
        <TotalTypesOfSurgeryForResident residentId={resident._id.toString()} />
      </Suspense>
      <DownloadRecordsButton side="resident" />
    </div> 
  );
}