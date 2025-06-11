'use server'

import dbConnect from "@/lib/dbConnect"
import { Record } from "@/models/Record"
import { StepsRecordForm } from "../../stepsForm"


export default async function EditRecord(props: {params: Promise<{id: string}>}) {
    await dbConnect()
    const params = await props.params;
    const record = await Record.findById(params.id).populate('surgery')


    if (!record){
        return <div>No se encontró el registro</div>
    }

    return (
        <div className="flex flex-col w-full justify-center max-w-lg mx-auto md:p-10 px-4">
            <h1 className="text-2xl font-bold text-center">Completar Registro</h1>
            <StepsRecordForm record={JSON.parse(JSON.stringify(record))} />
        </div>
    )
}