import { getRecordByID } from "@/actions/record/getByID";
import PastRecord from "@/components/records/PastRecord";
import { Button } from "@/components/ui/button";
import { ChevronLeft, NotebookPen, SearchX } from "lucide-react";
import Link from "next/link";

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