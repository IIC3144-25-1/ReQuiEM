
import { getAreas } from "@/actions/area/getAll";
import { SurgeryForm } from "../surgeryForm";

export default async function NewSurgeryPage() {
    const areas = await getAreas();
    return (
        <div className="flex flex-col gap-6 min-h-svh w-full justify-center max-w-lg mx-auto md:p-10">
            <h1 className="text-2xl font-bold">Crear nueva cirugia</h1>
            <SurgeryForm areas={JSON.parse(JSON.stringify(areas))} />
        </div>
    )
}