'use server'

import { getTeachersByUser } from "@/actions/record/getTeachersByUser"
import { getSurgeries } from "@/actions/surgery/getSurgeries"
import { getCurrentUser } from "@/actions/user/getUser"
import RecordForm from "../recordForm"


export default async function NewRecord() {
    const surgeries = await getSurgeries()
    let teachers = await getTeachersByUser()
    const user = await getCurrentUser()
    teachers = teachers || []

    return (
        <div className="flex flex-col w-full justify-center max-w-lg mx-auto md:p-10">
            <h1 className="text-2xl font-bold text-center">Nuevo Registro</h1>
            <RecordForm
                surgeries={JSON.parse(JSON.stringify(surgeries))}
                teachers={JSON.parse(JSON.stringify(teachers))}
                user={JSON.parse(JSON.stringify(user))}
            />
        </div>
    )
}