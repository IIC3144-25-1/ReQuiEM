import { getRecordByID } from "@/actions/record/getByID";
import PastRecord from "@/components/records/PastRecord";
import { SearchX } from "lucide-react";

export default async function Page(props: {params: Promise<{id: string}>}) {
  let params;
  try {
    params = await props.params;
  } catch (error) {
    console.error("Error al obtener los parámetros:", error);
    return <div>Error al cargar los parámetros</div>;
  }
  const record = await getRecordByID(params.id);

  if (!record) {
    return (
      <div className="flex flex-col items-center mt-30 font-semibold">
        No se encontró la cirugía
        <SearchX className="w-3xl mt-10" />
      </div>
    );
  }

  return(
    <div className="flex flex-col items-center">
      <PastRecord record={record} side="teacher"/>
    </div>
  )
}