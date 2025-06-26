import { getUserResident } from "@/actions/resident/getByCurrentUser";
import { RecordsCompleted } from "@/components/charts/RecordsCompletedByResident";
import ScaleSummary from "@/components/charts/ScaleSummary";
import { TotalTypesOfSurgeryForResident } from "@/components/charts/TotalTipesOfSurgeryForResident";
import { DownloadRecordsButton } from "@/components/records/DownloadRecordsButton";
import StepsCompletedInTime from "@/components/charts/StepsCompletedInTime";
import { Head } from "@/components/head/Head";
import { Surgery } from "@/models/Surgery";
import { IRecord, Record } from "@/models/Record";
import dbConnect from "@/lib/dbConnect";

export default async function DashboardPage() {
  await dbConnect();
  const resident = await getUserResident();

  if (!resident) {
    return <p className="text-gray-500">Residente no encontrado.</p>;
  }

  await Surgery.find({});
  const records = await Record.find({ resident: resident._id })
                                  .populate({ path: "surgery", select: "name" })
                                  .lean<IRecord[]>();

  if (!records || records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl font-bold mb-4">No hay registros</h1>
        <p className="text-gray-500">Crear un nuevo registro y podras ver estadísticas aquí.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 items-center justify-center h-full max-w-4xl mx-auto">
      <Head
        title="Dashboard"
        description="Aquí puedes ver estadísticas y gráficos de tu desempeño como residente"
        components={[
          <DownloadRecordsButton
            side="resident"
            key="1"
          />
        ]}
      />


      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 w-full">
        <div className="col-span-1 md:col-span-2">
          <RecordsCompleted records={records} />
        </div>
        <div className="col-span-1">
          <TotalTypesOfSurgeryForResident records={records} />
        </div>
        <div className="col-span-1">
          <ScaleSummary records={records} />
        </div>
        <div className="col-span-1 md:col-span-2">
          <StepsCompletedInTime records={records} />
        </div>
      </div>

      {/* <DownloadRecordsButton side="resident" className="fixed bottom-10 right-10 sm:hidden"/> */}
    </div> 
  );
}