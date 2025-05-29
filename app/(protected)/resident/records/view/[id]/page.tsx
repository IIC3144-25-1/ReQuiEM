import { getRecordByID } from "@/actions/record/getByID";
import PastRecord from "@/components/records/PastRecord";
import { Button } from "@/components/ui/button";
import { Record } from "@/models/Record";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import dbConnect from "@/lib/dbConnect";

export default async function Page(props: {params: Promise<{id: string}>}) {
  await dbConnect();
  const { id } = await props.params;
  console.log("ID de la cirugía:", id); // Eliminar cuando se remplaze la linea de abajo
  const record = await getRecordByID((await props.params).id)
  if (record?.status === 'corrected') {
    Record.findByIdAndUpdate(record._id, { status: 'reviewed' });
  }

  if (!record) {
    return <div>No se encontró la cirugía</div>;
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
