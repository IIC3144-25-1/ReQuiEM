'use server'

import { getTeacherByUserID } from "@/actions/teacher/getByID";
import { getTeacherResidents } from "@/actions/teacher/getResidents";
import { getCurrentUser } from "@/actions/user/getUser";
import ResidentSelect from "./residentSelect";
import { RecordsCompleted } from "@/components/charts/RecordsCompletedByResident";
import { TotalTypesOfSurgeryForResident } from "@/components/charts/TotalTipesOfSurgeryForResident";
import { Head } from "@/components/head/Head";
import { Suspense } from "react";
import Loading from "@/app/loading";
import StepsCompletedInTime from "@/components/charts/StepsCompletedInTime";
import ScaleSummary from "@/components/charts/ScaleSummary";
import { IRecord, Record } from "@/models/Record";
import { Surgery } from "@/models/Surgery";
import { DownloadRecordsButton } from "@/components/records/DownloadRecordsButton";
import dbConnect from "@/lib/dbConnect";

export default async function TeacherDashboardPage({
  searchParams,
}: {
  searchParams: Promise < {
    resident: string
  } > ;
}) {
    await dbConnect();
    const user = await getCurrentUser();

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You must be logged in to view this page.</p>
        </div>
    );
    }
    const teacher = await getTeacherByUserID(user?._id.toString());

    if (!teacher) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
                <p>You must be a teacher to view this page.</p>
            </div>
        );
    }
    const residents = await getTeacherResidents(teacher?._id.toString());
    const residentId = (await searchParams)?.resident as string;
    const defaultResidentId = residentId || residents[0]?._id.toString();

    const records = await Record.find({ resident: defaultResidentId })
                                .populate({ path: "surgery", model: Surgery, select: "name" })
                                .lean<IRecord[]>();

    if (!records || records.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full max-w-4xl mx-auto">
            <Head
                title="Dashboard"
                description="Aquí puedes ver estadísticas y gráficos de los residentes que supervisas"
                components={[
                    <div key="1" className="flex items-center gap-4 justify-center">
                        <ResidentSelect residents={residents} />
                    </div>
                ]}
            />
            <div className="flex flex-col items-center justify-center h-full my-24">
                <h1 className="text-2xl font-bold mb-4">No hay registros</h1>
                <p >No hay registros para el residente seleccionado.</p>
            </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-full max-w-4xl mx-auto">
            
            <Head
                title="Dashboard"
                description="Aquí puedes ver estadísticas y gráficos de los residentes que supervisas"
                components={[
                    <DownloadRecordsButton
                        side="teacher"
                        key="1"
                    />,
                    <ResidentSelect key="2" residents={residents} />
                ]}
            />

            <Suspense fallback={<Loading />}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 w-full">
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
            </Suspense>
        </div>
    );
}
