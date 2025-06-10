'use server'

import { getTeacherByUserID } from "@/actions/teacher/getByID";
import { getTeacherResidents } from "@/actions/teacher/getResidents";
import { getCurrentUser } from "@/actions/user/getUser";
import TeacherDashboardClient from "./dashboardClient";
import { RecordsCompleted } from "@/components/charts/RecordsCompletedByResident";
import { TotalTypesOfSurgeryForResident } from "@/components/charts/TotalTipesOfSurgeryForResident";
import { ChartSkeleton } from "@/components/charts/ChartSkeleton";
import { Suspense } from "react";
import Loading from "@/app/loading";

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
        <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-2xl font-bold mb-4">Teacher Dashboard</h1>
            <TeacherDashboardClient residents={residents} />

            <Suspense fallback={<Loading />}>
                <div className="flex flex-col gap-8 items-center w-full">

                <Suspense fallback={<ChartSkeleton />}>
                    <RecordsCompleted residentId={defaultResidentId} />
                </Suspense>

                <Suspense fallback={<ChartSkeleton />}>
                    <TotalTypesOfSurgeryForResident residentId={defaultResidentId} />
                </Suspense>
                </div>
            </Suspense>
        </div>
    );
}
