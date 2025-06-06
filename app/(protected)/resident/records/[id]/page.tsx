import { getRecordByID } from "@/actions/record/getByID";
import { updateStatus } from "@/actions/record/updateStatus";
import PastRecord from "@/components/records/PastRecord";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Page(props: {params: Promise<{id: string}>}) {
  const { id } = await props.params;
  console.log("ID de la cirugía:", id);
  const record = await getRecordByID((await props.params).id)
  updateStatus(id)

  if (!record) {
    return <div>No se encontró la cirugía</div>;
  }

  if (!record.steps || record.steps.length === 0){
    redirect(`/resident/complete-record/${record._id}`); 
  }

  return(
    <div className="flex flex-col items-center">
      <PastRecord record={record} />

      <Link href="/resident/records">
        <Button className="mt-10 mb-20 w-30" variant="outline">
          <ChevronLeft className="" />
          Volver
        </Button>
      </Link>
    </div>
  )
}
