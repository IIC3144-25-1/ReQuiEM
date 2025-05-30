"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { sumaryScalesList } from "@/app/(protected)/teacher/reviewForm";
import React from "react";
import { IRecord } from "@/models/Record";
import { format } from "date-fns"
import { es } from "date-fns/locale"

const statusLabel = {
  pending: "Pendiente",
  corrected: "Corregido",
  reviewed: "Corregido",
  canceled: "Cancelado"
};

export default function PastRecord({ record }: { record: IRecord }) {
    return (
      <div className="flex flex-col gap-6 min-h-screen w-full justify-center mx-auto p-1 sm:p-4 max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl">
        {/* Título con tamaño responsivo */}
        {/* <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6">
          Detalles del Registro
        </h1> */}
  
        <Card className="relative">
          <CardHeader>
            <CardTitle className="text-2xl">{record.surgery?.name || "Cirugía no especificada"}</CardTitle>
          </CardHeader>
          <CardContent>
            
            <hr className="my-4" />
            <div className="flex flex-row">
              <div className="text-sm leading-none space-y-2 font-semibold mb-4 mr-6">
                <p>Residente:</p>
                <p>Profesor:</p>
                <p>Fecha:</p>
                <p>RUT del paciente:</p>
                <p>Año del residente:</p>
              </div>

              <div className="text-sm font-normal leading-none space-y-2 mb-4">
                <p>{record.resident?.user?.name || "No disponible"}</p>
                <p>{record.teacher?.user?.name || "No disponible"}</p>
                <p>{format(record.date, "d '/' MMM '/' yyyy ', ' HH:mm", { locale: es })}</p>
                <p>{record.patientId || "No disponible"}</p>
                <p>{record.residentsYear || "No disponible"}º año</p>
              </div>
            </div>
  
            {statusLabel[record.status] === "Corregido" ? (
              <Badge variant="success" className="capitalize absolute top-5 sm:top-23 right-5 sm:right-20">
                {statusLabel[record.status] || "Estado desconocido"}
              </Badge>
            ) : (
              <Badge variant="yellow" className="capitalize absolute top-5 sm:top-23 right-5 sm:right-20">
                {statusLabel[record.status] || "Estado desconocido"}
              </Badge>
            )}
            
            <hr className="my-4" />
            <h2 className="font-semibold mb-4 text-lg mt-2">Pasos de la cirugía</h2>
  
            <div className="flex flex-col space-y-6 relative mt-0">
              {record.steps && record.steps.length > 0 ? (
                <>
                  <div className="h-23/24 w-px border border-gray-800 bg-gray-800 absolute ml-[5px] top-31/64 -translate-y-1/2 z-0"></div>
                  {record.steps.map((step, index) => (
                    <div key={index} className="flex flex-row items-start space-x-3 space-y-0" >
                      <div className={`mt-1 w-3 h-3 rounded-xl border-1 border-white outline-2 outline-gray-800 z-10
                        ${ record.status === "pending" && step.residentDone === true ? "bg-gray-800"
                          : step.teacherDone === true && step.residentDone === true ? "bg-blue-800"
                          : step.teacherDone === true && step.residentDone === false ? "bg-green-600"
                          : step.teacherDone === false && step.residentDone === true ? "bg-red-600"
                          : "bg-gray-100"}`
                      } />
                      <p className="text-sm font-normal">{step.name}</p>
                    </div>
                  ))}
                </>
              ) : (
                <p>No hay pasos registrados</p>
              )}
            </div>
            
            {record.status === "corrected" && (
              <div className="flex flex-col justify-center space-y-2 mt-8">
                <div className="flex flex-row items-center space-x-3">
                  <div className="mt-1 w-3 h-3 rounded-xl border-1 border-white outline-2 outline-gray-800 z-10 bg-blue-800 "/>
                  <p className="text-muted-foreground pt-1">el profesor y el residente marcaron que el residente realizó este paso</p>
                </div>
                <div className="flex flex-row items-center space-x-3">
                  <div className="mt-1 w-3 h-3 rounded-xl border-1 border-white outline-2 outline-gray-800 z-10 bg-red-600"/>
                  <p className="text-muted-foreground pt-1">sólo el residente marcó que realizó este paso</p>
                </div>
                <div className="flex flex-row items-center space-x-3">
                  <div className="mt-1 w-3 h-3 rounded-xl border-1 border-white outline-2 outline-gray-800 z-10 bg-green-600"/>
                  <p className="text-muted-foreground pt-1">sólo el profesor marcó que el residente realizó este paso</p>
                </div>
                <div className="flex flex-row items-center space-x-3">
                  <div className="mt-1 w-3 h-3 rounded-xl border-1 border-white outline-2 outline-gray-800 z-10 bg-gray-100"/>
                  <p className="text-muted-foreground pt-1">ninguno marcó que el resident realizó este paso</p>
                </div>
              </div>
            )}
  
            <hr className="my-4" />
            <h2 className="font-semibold mb-4 text-lg mt-2">Criterios OSATs</h2>
            
            <div className="grid grid-cols-[2fr_8fr] gap-2">
              {record.osats.map((osat, index) => (
                <React.Fragment key={index}>
                  <div className="border-t-2 border-r-2 p-2 font-semibold">{osat.item}</div>
                  <div className="border-t-2 overflow-x-auto min-w-[300px] sm:min-w-0">
                    <div className="flex flex-row justify-between">
                      {osat.scale.map((scaleItem, idx) => (
                        <div key={idx} className={`flex flex-col items-center w-full my-1
                          ${scaleItem.punctuation === osat.obtained && record.status === "corrected" ? "bg-blue-100 rounded-lg" : ""}`}>
                          <p>{scaleItem.punctuation}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-row justify-between space-x-2 sm:space-x-20 px-2">
                      {osat.scale.map((scaleItem, idx) => 
                        scaleItem.description && (
                            <div key={idx} className="flex-1 items-center">
                              <CardDescription className="text-center">{scaleItem.description}</CardDescription> 
                            </div>
                        )
                      )}
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>

            <hr className="my-4" />
            <div className="flex flex-row">
              <div className="text-sm leading-none space-y-2 font-semibold mb-4 mr-6">
                <p>Comentario del residente:</p>
                <p>Feedback:</p>
                <p>Juicio global residente:</p>
                <p>Juicio global profesor:</p>
                <p>Escala resumen:</p>
              </div>

              <div className="text-sm font-normal leading-none space-y-2 mb-4">
                <p>{record.residentComment || "Sin comentarios"}</p>
                <p>{record.feedback || "Sin feedback"}</p>
                <p>{record.residentJudgment}</p>
                <p>{record.teacherJudgment}</p>
                <div className="flex flex-row items-start">
                  <p className="font-semibold mr-4">{record.summaryScale}</p>
                  <p className="text-muted-foreground">({sumaryScalesList.find(item => item.value === record.summaryScale)?.label})</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }