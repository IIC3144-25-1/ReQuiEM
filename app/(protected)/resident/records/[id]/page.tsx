import { getRecordByID } from "@/actions/record/getByID";
import { updateStatus } from "@/actions/record/updateStatus";
import PastRecord from "@/components/records/PastRecord";
import { redirect } from "next/navigation";

export default async function Page(props: {params: Promise<{id: string}>}) {
  const { id } = await props.params;
  const record = await getRecordByID((await props.params).id)
  updateStatus(id)

  if (!record) {
    return <div>No se encontró la cirugía</div>;
  }

  if (!record.steps || record.steps.length === 0){
    redirect(`/resident/complete-record/${record._id}`); 
  }
  // console.log(record)

  return(
    <div className="flex flex-col items-center">
      <PastRecord record={record} side="resident" />
    </div>
  )
}
