'use server'

import { getTeachersByUser } from "@/actions/record/getTeachersByUser"
import { getSurgeries } from "@/actions/surgery/getSurgeries"
import RecordForm from "../recordForm"
import { getUserResident } from "@/actions/resident/getByCurrentUser"


export default async function NewRecord() {
    const surgeries = await getSurgeries()
    let teachers = await getTeachersByUser()
    const resident = await getUserResident()
    teachers = teachers || []

    return (
        <div className="flex flex-col w-full justify-center max-w-lg mx-auto md:p-10">
            <h1 className="text-2xl font-bold text-center">Nuevo Registro</h1>
            <RecordForm
                surgeries={JSON.parse(JSON.stringify(surgeries))}
                teachers={JSON.parse(JSON.stringify(teachers))}
                resident={JSON.parse(JSON.stringify(resident))}
            />
        </div>
    )
}