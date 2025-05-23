import { ResidentForm } from "../residentForm";
import { getAllAreas } from "@/actions/area/getAll";

export default async function NewResidentPage() {
  const areas = await getAllAreas()
  return (
    <div className="flex flex-col gap-6 min-h-svh w-full justify-center max-w-lg mx-auto md:p-10">
      <h1 className="text-2xl font-bold">Crear nuevo residente</h1>
      <ResidentForm areas={JSON.parse(JSON.stringify(areas))}/>
    </div>
  )
}