import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
//import { getRecordByID } from "@/actions/record/getByID";

export default async function Page(props: {params: Promise<{id: string}>}) {
  const { id } = await props.params;
  console.log("ID de la cirugía:", id); // Eliminar cuando se remplaze la linea de abajo
  const record = recordPopulated; // TODO: Reemplaza por: await getRecordByID(props.params.id)

  if (!record) {
    return <div>No se encontró la cirugía</div>;
  }

  return (
    <div className="flex flex-col gap-6 min-h-screen w-full justify-center mx-auto p-4 max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl">
      {/* Título con tamaño responsivo */}
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6">Detalles del Registro</h1>

      <Card>
        <CardHeader>
          <CardTitle>{record.patientName || "Paciente sin nombre"}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <strong>Residente:</strong>{" "}
            {record.resident?.user?.name || "No disponible"}
          </p>
          <p>
            <strong>Profesor:</strong>{" "}
            {record.teacher?.user?.name || "No disponible"}
          </p>
          <p>
            <strong>Fecha:</strong>{" "}
            {record.date
              ? new Date(record.date).toLocaleDateString()
              : "No disponible"}
          </p>
          <p>
            <strong>Cirugía:</strong> {record.surgery?.name || "No especificada"}
          </p>
          <p>
            <strong>Estado:</strong>{" "}
            {record.status ? (
              <Badge variant="outline" className="capitalize">
                {record.status}
              </Badge>
            ) : (
              "No disponible"
            )}
          </p>

          <hr className="my-4" />

          <h2 className="font-semibold mb-4">Pasos de la cirugía</h2>

          {/* Grid responsive: 1 columna en móvil, 2 columnas en md+ */}
          {record.steps && record.steps.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {record.steps.map((step, index) => (
                <div key={index} className="border p-4 rounded-md bg-gray-50">
                  <p><strong>Nombre:</strong> {step.name}</p>
                  <p><strong>Descripción:</strong> {step.description || "No hay descripción"}</p>
                  <p><strong>Comentario:</strong> {step.comment || "Sin comentario"}</p>
                  <p><strong>Feedback:</strong> {step.feedback || "Sin feedback"}</p>
                  <p><strong>Rating:</strong> {step.rating ?? 0}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No hay pasos registrados.</p>
          )}

          <hr className="my-4" />

          <h2 className="font-semibold mb-4">Criterios OSATs</h2>

          {/* Grid responsive: 1 columna en móvil, 2 columnas en md+ */}
          {/* TODO: agregar los criterios OSATs*/}

          <hr className="my-4" />

          <p>
            <strong>Comentario general:</strong> {record.comment || "Sin comentarios"}
          </p>
          <p>
            <strong>Feedback general:</strong> {record.feedback || "Sin feedback"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Dummy para pruebas (reemplaza con fetch real)
const recordPopulated = {
  _id: "642a1f1c3f1e4a5b6c7d8e9f",
  resident: {
    _id: "60b8f8a2d6e1f23a4c9b0d12",
    user: { _id: "60b8f7a2d6e1f23a4c9b0a01", name: "Carlos Gómez", email: "carlos.gomez@email.com" },
    teachers: [
      {
        _id: "60b8f8a2d6e1f23a4c9b0d34",
        user: { _id: "60b8f7a2d6e1f23a4c9b0a02", name: "María Ruiz", email: "maria.ruiz@email.com" },
        createdAt: new Date("2024-01-10T10:00:00.000Z"),
        updatedAt: new Date("2024-01-15T12:00:00.000Z"),
      },
    ],
    createdAt: new Date("2023-12-01T09:30:00.000Z"),
    updatedAt: new Date("2024-02-20T11:00:00.000Z"),
  },
  teacher: {
    _id: "60b8f8a2d6e1f23a4c9b0d34",
    user: { _id: "60b8f7a2d6e1f23a4c9b0a02", name: "María Ruiz", email: "maria.ruiz@email.com" },
    createdAt: new Date("2024-01-10T10:00:00.000Z"),
    updatedAt: new Date("2024-01-15T12:00:00.000Z"),
  },
  patientName: "Juan Pérez",
  date: new Date("2025-05-15T14:30:00.000Z"),
  surgery: {
    _id: "60b8f8a2d6e1f23a4c9b0d56",
    name: "Apendicectomía laparoscópica",
    description: "Cirugía para extirpar el apéndice inflamado.",
    area: "Abdomen",
    steps: [
      { name: "Incisión inicial", description: "Realizar incisión con bisturí tipo 11 en zona abdominal.", guideline: { name: "Técnica de incisión", maxRating: 5 } },
      { name: "Exposición del área quirúrgica", description: "Separación cuidadosa de tejidos para exponer zona de operación.", guideline: { name: "Técnica de exposición", maxRating: 5 } },
    ],
    osats: [{ name: "Manejo de instrumental", description: "Uso adecuado y seguro de instrumentos quirúrgicos.", maxRating: 5 }],
    createdAt: new Date("2023-10-01T08:00:00.000Z"),
    updatedAt: new Date("2024-04-01T10:00:00.000Z"),
  },
  steps: [
    {
      name: "Incisión inicial",
      description: "Realizar incisión con bisturí tipo 11 en zona abdominal.",
      comment: "Incisión realizada sin complicaciones.",
      feedback: "Buena técnica, mantener la misma precisión.",
      rating: 5,
    },
    {
      name: "Exposición del área quirúrgica",
      description: "Se expuso el área de intervención mediante separación cuidadosa.",
      comment: "Se usó equipo adecuado para evitar daño a tejidos.",
      feedback: "Excelente manejo del instrumental.",
      rating: 4,
    },
  ],
  status: "completed",
  comment: "Paciente en observación postoperatoria.",
  feedback: "Se recomienda seguimiento a las 24 horas.",
  createdAt: new Date("2025-05-14T09:00:00.000Z"),
  updatedAt: new Date("2025-05-14T12:00:00.000Z"),
};
