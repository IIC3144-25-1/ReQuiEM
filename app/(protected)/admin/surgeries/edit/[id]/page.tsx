
import { getSurgery } from "@/actions/surgery/getSugery";
import { SurgeryForm } from "../../surgeryForm";

export default async function Page({params} : {params: {id: string}}) {
    const surgery = await getSurgery(params.id);

    if (!surgery) {
        return <div>No se encontró la cirugía</div>
    }

    return (
        <div className="flex flex-col gap-6 min-h-svh w-full justify-center max-w-lg mx-auto md:p-10">
            <h1 className="text-2xl font-bold">Editar cirugia</h1>
            <SurgeryForm surgery={JSON.parse(JSON.stringify(surgery))}/>
        </div>
    )
}