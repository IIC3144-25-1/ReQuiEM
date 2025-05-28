'use server'

import { getRecordByID } from "@/actions/record/getByID"
import { ReviewRecordForm } from "../../reviewForm"


export default async function ReviewRecord(props: {params: Promise<{id: string}>}) {
    const params = await props.params;
    const record = await getRecordByID(params.id)

    if (!record){
        return <div>No se encontró el registro</div>
    }

    return (
        <div className="flex flex-col w-full justify-center max-w-lg mx-auto md:p-10">
            <h1 className="text-2xl font-bold text-center">Corrección de Registro</h1>
            <ReviewRecordForm record={(record)} />
        </div>
    )
}