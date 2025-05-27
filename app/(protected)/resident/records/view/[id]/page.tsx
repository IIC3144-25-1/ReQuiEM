import { getRecordByID } from "@/actions/record/getByID";
import PastRecord from "@/components/records/PastRecord";

export default async function Page(props: {params: Promise<{id: string}>}) {
  const { id } = await props.params;
  console.log("ID de la cirugía:", id); // Eliminar cuando se remplaze la linea de abajo
  const record = await getRecordByID((await props.params).id)

  if (!record) {
    return <div>No se encontró la cirugía</div>;
  }

  return <PastRecord record={record} />
}
