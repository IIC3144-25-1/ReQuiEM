import { getUserResident } from "@/actions/resident/getByCurrentUser";
import { ChartSkeleton } from "@/components/charts/ChartSkeleton";
import { RecordsCompleted } from "@/components/charts/RecordsCompletedByResident";
import ScaleSummary from "@/components/charts/ScaleSummary";
import { TotalTypesOfSurgeryForResident } from "@/components/charts/TotalTipesOfSurgeryForResident";
import { Suspense } from "react";
import { DownloadRecordsButton } from "@/components/records/DownloadRecordsButton";
import StepsCompletedInTime from "@/components/charts/StepsCompletedInTime";
import { Head } from "@/components/head/Head";

export default async function DashboardPage() {
  const resident = await getUserResident();

  if (!resident) {
    return <p className="text-gray-500">No resident data found.</p>;
  }

  return (
    <div className="flex flex-col gap-8 items-center justify-center h-full my-8 max-w-4xl mx-auto">
      <Head
        title="Dashboard"
        description="Aquí puedes ver estadísticas y gráficos de tu desempeño como residente"
        components={[
          <DownloadRecordsButton
            side="resident"
            key="1"
            className=""
          />
        ]}
      />


      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 w-full">
        <div className="col-span-1 md:col-span-2">
          <Suspense fallback={<ChartSkeleton />}>
            <RecordsCompleted residentId={resident._id.toString()} />
          </Suspense>
        </div>
        <div className="col-span-1">
          <Suspense fallback={<ChartSkeleton />}>
            <TotalTypesOfSurgeryForResident residentId={resident._id.toString()} />
          </Suspense>
        </div>
        <div className="col-span-1">
          <Suspense fallback={<ChartSkeleton />}>
            <ScaleSummary residentId={resident._id.toString()} />
          </Suspense>
        </div>
        <div className="col-span-1 md:col-span-2">
          <Suspense fallback={<ChartSkeleton />}>
            <StepsCompletedInTime residentId={resident._id.toString()} />
          </Suspense>
        </div>
      </div>

      {/* <DownloadRecordsButton side="resident" className="fixed bottom-10 right-10 sm:hidden"/> */}
    </div> 
  );
}