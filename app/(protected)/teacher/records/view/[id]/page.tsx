import { getRecordByID } from "@/actions/record/getByID";
import PastRecord from "@/components/records/PastRecord";
import { Button } from "@/components/ui/button";
import { ChevronLeft, NotebookPen } from "lucide-react";
import Link from "next/link";

export default async function Page(props: {params: Promise<{id: string}>}) {
  const { id } = await props.params;
  console.log("ID de la cirugía:", id); // Eliminar cuando se remplaze la linea de abajo
  const record = await getRecordByID((await props.params).id)

  if (!record) {
    return <div>No se encontró la cirugía</div>;
  }

  return(
    <div className="flex flex-col items-center">
      <PastRecord record={record} />

      <div className="mt-10 mb-20 flex">
        <Link href="/teacher/records">
          <Button className="mr-4 w-30" variant="outline">
            <ChevronLeft/>
            Volver
          </Button>
        </Link>

        { record.status === "pending" && (
          <Link href={`/teacher/review/${record._id}`}>
            <Button className="w-40">
              <NotebookPen/>
              Dar Feedback
            </Button>
          </Link>
        )}
      </div>

    </div>
  )
}