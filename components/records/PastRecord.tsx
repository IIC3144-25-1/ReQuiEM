"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { IRecord } from "@/models/Record";
import { format } from "date-fns"
import { es } from "date-fns/locale"



export default function PastRecord({ record }: { record: IRecord }) {
    return (
      <div className="flex flex-col gap-6 min-h-screen w-full justify-center mx-auto p-4 max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl">
        {/* Título con tamaño responsivo */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6">
          Detalles del Registro
        </h1>
  
        <Card>
          <CardHeader>
            <CardTitle>{record.surgery?.name || "Cirugía no especificada"}</CardTitle>
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
                ? format(record.date, "d '/' MMM '/' yyyy", { locale: es })
                : "No disponible"}
            </p>
            <p>
                <strong>RUT del paciente:</strong>{" "}
                {record.patientId || "No disponible"}
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
  
            <p>
              <strong>Año del residente:</strong> {record.residentsYear || "No disponible"}
            </p>
  
            <hr className="my-4" />
  
            <h2 className="font-semibold mb-4">Pasos de la cirugía</h2>
  
            {record.steps && record.steps.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {record.steps.map((step, index) => {
                // Definir texto, color y tooltip según el estado
                let badgeProps: {
                  text: string;
                  variant: "default" | "destructive" | "secondary" | "outline" | null | undefined;
                  tooltip: string;
                } = {
                  text: "",
                  variant: "default",
                  tooltip: "",
                };
            
                if (!step.residentDone) {
                  badgeProps = {
                    text: "Hecho por el docente",
                    variant: "outline",
                    tooltip: "El docente realizó este paso porque el residente no lo hizo.",
                };
                } else if (step.residentDone && step.teacherDone) {
                  badgeProps = {
                    text: "Hecho por el docente",
                    variant: "destructive",
                    tooltip: "El docente realizó este paso que el residente había marcado como hecho por él.",
                  };
                } else {
                    badgeProps = {
                        text: "Hecho por el residente",
                        variant: "default",
                        tooltip: "El residente realizó este paso con exito.",
                    };
                }

                return (
                  <div key={index} className="border p-4 rounded-md bg-gray-50">
                    <p>
                      <strong>{step.name}</strong>
                    </p>
            
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant={badgeProps.variant} className="mt-2 cursor-pointer">
                          {badgeProps.text}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{badgeProps.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
            
                    {record.status !== "pending" && (
                      <p className="mt-3">
                        <strong>Puntaje:</strong> {step.score}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            ) : (
              <p>No hay pasos registrados.</p>
            )}
  
            <hr className="my-4" />
  
            <h2 className="font-semibold mb-4">Criterios OSATs</h2>
  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {record.osats.map((osat, index) => (
                <div key={index} className="border p-4 rounded-md bg-gray-50">
                <p>
                    <strong>{osat.item}</strong>
                </p>
                <div className="flex flex-wrap gap-2 mb-2">
                    {osat.scale.map((scaleItem, idx) => {
                    const isObtained = scaleItem.punctuation === osat.obtained;
                    return (
                        <Tooltip key={idx}>
                        <TooltipTrigger asChild>
                            <Badge
                            variant={isObtained ? "default" : "outline"}
                            className="cursor-pointer"
                            title={scaleItem.description || ""}
                            >
                            {scaleItem.punctuation}
                            </Badge>
                        </TooltipTrigger>
                        {scaleItem.description && (
                            <TooltipContent>
                            <p>{scaleItem.description}</p>
                            </TooltipContent>
                        )}
                        </Tooltip>
                    );
                    })}
                </div>
                </div>
            ))}
            </div>
            <hr className="my-4" />
  
            <p>
              <strong>Comentario general residente:</strong>{" "}
              {record.residentComment || "Sin comentarios"}
            </p>
            <p>
              <strong>Feedback general:</strong> {record.feedback || "Sin feedback"}
            </p>
  
            <p>
              <strong>Juicio residente:</strong> {record.residentJudgment}
            </p>
            <p>
              <strong>Juicio profesor:</strong> {record.teacherJudgment}
            </p>
            <p>
              <strong>Escala resumen:</strong> {record.summaryScale || "No disponible"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }