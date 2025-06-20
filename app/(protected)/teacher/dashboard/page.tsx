'use server'

import { getTeacherByUserID } from "@/actions/teacher/getByID";
import { getTeacherResidents } from "@/actions/teacher/getResidents";
import { getCurrentUser } from "@/actions/user/getUser";
import ResidentSelect from "./residentSelect";
import { RecordsCompleted } from "@/components/charts/RecordsCompletedByResident";
import { TotalTypesOfSurgeryForResident } from "@/components/charts/TotalTipesOfSurgeryForResident";
import { Head } from "@/components/head/Head";
import { ChartSkeleton } from "@/components/charts/ChartSkeleton";
import { Suspense } from "react";
import Loading from "@/app/loading";
import StepsCompletedInTime from "@/components/charts/StepsCompletedInTime";
import ScaleSummary from "@/components/charts/ScaleSummary";

export default async function TeacherDashboardPage({
  searchParams,
}: {
  searchParams: Promise < {
    resident: string
  } > ;
}) {
    const user = await getCurrentUser();

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-gray-500">You must be logged in to view this page.</p>
        </div>
    );
    }
    const teacher = await getTeacherByUserID(user?._id.toString());

    if (!teacher) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
                <p className="text-gray-500">You must be a teacher to view this page.</p>
            </div>
        );
    }
    const residents = await getTeacherResidents(teacher?._id.toString());
    const residentId = (await searchParams)?.resident as string;
    const defaultResidentId = residentId || residents[0]?._id.toString();

    return (
        <div className="flex flex-col items-center justify-center h-full my-8 max-w-4xl mx-auto">
            
            <Head
                title="Dashboard"
                description="Aquí puedes ver estadísticas y gráficos de los residentes que supervisas"
                components={[
                    <div key="1" className="flex items-center gap-4 justify-center">
                        <div  className="text-muted-foreground">Datos del residente: </div>
                        <ResidentSelect residents={residents} />
                    </div>
                ]}
            />

            <Suspense fallback={<Loading />}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 w-full">
                    <div className="col-span-1 md:col-span-2">
                        <Suspense fallback={<ChartSkeleton />}>
                            <RecordsCompleted residentId={defaultResidentId} />
                        </Suspense>
                    </div>
                    <div className="col-span-1">
                        <Suspense fallback={<ChartSkeleton />}>
                            <TotalTypesOfSurgeryForResident residentId={defaultResidentId} />
                        </Suspense>
                    </div>
                    <div className="col-span-1">
                        <Suspense fallback={<ChartSkeleton />}>
                            <ScaleSummary residentId={defaultResidentId} />
                        </Suspense>
                    </div>
                    <div className="col-span-1 md:col-span-2">
                        <Suspense fallback={<ChartSkeleton />}>
                            <StepsCompletedInTime residentId={defaultResidentId} />
                        </Suspense>
                    </div>
                </div>
            </Suspense>
        </div>
    );
}
