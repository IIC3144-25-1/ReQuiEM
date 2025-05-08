import { getArea } from "@/actions/area/get";
import { AreaForm } from "../../areaForm"


export default async function Page(props: {params: Promise<{id: string}>}) {
    const params = await props.params;
    const area = await getArea(params.id);

    if (!area) {
        return <div>No se encontró la cirugía</div>
    }
    return (
        <div className="flex flex-col gap-6 min-h-svh w-full justify-center max-w-lg mx-auto md:p-10">
            <h1 className="text-2xl font-bold">Editar Área</h1>
            <AreaForm area={JSON.parse(JSON.stringify(area))}/>
        </div>
    )
}