"use client";

import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { Head } from "../head/Head";
import { Badge } from "@/components/ui/badge";
import { sumaryScalesList } from "@/app/(protected)/teacher/reviewForm";
import React from "react";
import { IRecord } from "@/models/Record";
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import { scoreList } from "@/app/(protected)/teacher/reviewForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft, NotebookPen } from "lucide-react";
import Link from "next/link";


const statusLabel = {
  pending: "Pendiente",
  corrected: "Corregido",
  reviewed: "Corregido",
  canceled: "Cancelado"
};

export default function PastRecord({ record, side }: { record: IRecord; side: string }) {
    return (
      <div className="flex flex-col min-h-screen w-full justify-center mx-auto p-0 sm:p-4 sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl">
  
        <Card className="relative">
          <CardHeader className="px-3 sm:px-6">
            <Head
              title={record.surgery?.name || "Cirugía no especificada"}
              description={`Registro de cirugía realizada por ${record.resident?.user?.name}`}
              components={
                side === "resident"
                  ? [
                      <Link href="/resident/records" key="1">
                        <Button className="w-full sm:min-w-30" variant="outline">
                          <ChevronLeft />
                          Volver
                        </Button>
                      </Link>,
                    ]
                  : [
                    <div key="1" className="w-full flex justify-center space-x-2">
                      <Link href="/teacher/records" className="w-full sm:w-30">
                        <Button className="mr-4 w-full" variant="outline">
                          <ChevronLeft />
                          Volver
                        </Button>
                      </Link>
                      {record.status === "pending" && (
                        <Link href={`/teacher/review/${record._id}`} className="w-full sm:w-40">
                          <Button className="w-full">
                            <NotebookPen />
                            Dar Feedback
                          </Button>
                        </Link>
                      )}
                    </div>
                    ]
              }
            />
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
    
            <hr className="my-4 mb-4" />
            <div className="flex flex-row justify-between items-start mb-4 sm:mr-10">
              <div className="flex flex-row justify-center sm:justify-start">
                <div className="text-sm leading-none space-y-2 font-semibold mr-2 sm:mr-6 text-right sm:text-left">
                  <p>Residente:</p>
                  <p>Profesor:</p>
                  <p>Fecha:</p>
                  <p>ID del paciente:</p>
                  <p>Año del residente:</p>
                </div>

                <div className="text-sm font-normal leading-none space-y-2">
                  <p>{record.resident?.user?.name || "No disponible"}</p>
                  <p>{record.teacher?.user?.name || "No disponible"}</p>
                  <p>{format(record.date, "d '/' MMM '/' yyyy ' a las ' HH:mm", { locale: es })}</p>
                  <p>{record.patientId || "No disponible"}</p>
                  <p>{record.residentsYear || "No disponible"}º año</p>
                </div>
              </div>
                
            
              {statusLabel[record.status] === "Corregido" ? (
                <Badge variant="success" className="absolute md:static capitalize top-5 sm:top-2 right-5 sm:right-25">
                  {statusLabel[record.status] || "Estado desconocido"}
                </Badge>
              ) : (
                <Badge variant="yellow" className="absolute md:static capitalize top-5 sm:top-2 right-5 sm:right-25">
                  {statusLabel[record.status] || "Estado desconocido"}
                </Badge>
              )}
              

            </div>
            
            <hr className="my-4" />
            <h2 className="font-semibold mb-4 text-lg mt-2">Pasos de la cirugía</h2>
  
            <div className="flex flex-col space-y-6 relative mt-0">
              {record.steps && record.steps.length > 0 ? (
                <>
                  <div className="h-23/24 w-px border border-primary bg-primary absolute ml-[5px] top-31/64 -translate-y-1/2 z-0"></div>
                  {record.steps.map((step, index) => (
                    <div key={index} className="flex flex-row items-start space-x-3 space-y-0" >
                      <div className={`mt-1 min-w-3 w-3 h-3 rounded-xl border-1 border-primary-foreground outline-2 outline-primary z-10
                        ${ record.status === "pending" && step.residentDone === true ? "bg-primary"
                          : step.teacherDone === true && step.residentDone === true ? "bg-blue-800"
                          : step.teacherDone === true && step.residentDone === false ? "bg-green-600"
                          : step.teacherDone === false && step.residentDone === true ? "bg-red-600"
                          : "bg-background"}`
                      } />
                      {record.status !== "pending" && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="secondary">{step.score}</Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{scoreList[step.score]}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      <p className="text-sm font-normal">{step.name}</p>
                    </div>
                  ))}
                </>
              ) : (
                <p>No hay pasos registrados</p>
              )}
            </div>
            
            {record.status !== "pending" && (
              <div className="flex flex-col sm:flex-row my-8 sm:space-x-6 space-y-6 sm:space-y-0">
                <div className="flex flex-col justify-center space-y-2">
                  <div className="flex flex-row items-center space-x-3">
                    <div className="mt-1 min-w-3 w-3 h-3 rounded-xl border-1 border-primary-foreground outline-2 outline-primary z-10 bg-blue-800 "/>
                    <p className="text-muted-foreground pt-1">el profesor y el residente marcaron que el residente realizó este paso</p>
                  </div>
                  <div className="flex flex-row items-center space-x-3">
                    <div className="mt-1 min-w-3 w-3 h-3 rounded-xl border-1 border-primary-foreground outline-2 outline-primary z-10 bg-red-600"/>
                    <p className="text-muted-foreground pt-1">sólo el residente marcó que realizó este paso</p>
                  </div>
                  <div className="flex flex-row items-center space-x-3">
                    <div className="mt-1 min-w-3 w-3 h-3 rounded-xl border-1 border-primary-foreground outline-2 outline-primary z-10 bg-green-600"/>
                    <p className="text-muted-foreground pt-1">sólo el profesor marcó que el residente realizó este paso</p>
                  </div>
                  <div className="flex flex-row items-center space-x-3">
                    <div className="mt-1 min-w-3 w-3 h-3 rounded-xl border-1 border-primary-foreground outline-2 outline-primary z-10 bg-background"/>
                    <p className="text-muted-foreground pt-1">ninguno marcó que el resident realizó este paso</p>
                  </div>
                </div>
                <div className="flex flex-col justify-center space-y-2">
                  <div className="flex flex-row items-center space-x-3">
                    <Badge variant="secondary">a</Badge>
                    <p className="text-muted-foreground pt-1">{scoreList['a']}</p>
                  </div>
                  <div className="flex flex-row items-center space-x-3">
                    <Badge variant="secondary">b</Badge>
                    <p className="text-muted-foreground pt-1">{scoreList['b']}</p>
                  </div>
                  <div className="flex flex-row items-center space-x-3">
                    <Badge variant="secondary">c</Badge>
                    <p className="text-muted-foreground pt-1">{scoreList['c']}</p>
                  </div>
                  <div className="flex flex-row items-center space-x-3">
                    <Badge variant="secondary">n/a</Badge>
                    <p className="text-muted-foreground pt-1">{scoreList['n/a']}</p>
                  </div>
                </div>
              </div>
            )}
  
            <hr className="my-4" />
            <h2 className="font-semibold mb-4 text-lg mt-2">Criterios OSATs</h2>
            
            <div className="grid sm:grid-cols-[2fr_8fr] grid-cols-[1fr_250px]">
              {record.osats.map((osat, index) => (
                <React.Fragment key={index}>
                  <div className="border-t-1 border-r-1 p-2 font-semibold">{osat.item}</div>
                  <ScrollArea className="w-[250px] sm:w-full" scrollToLabelId="focus">
                    <div className="border-t-1 overflow-x-auto mb-2">
                      <div className="flex flex-row justify-between px-1">
                        {osat.scale.map((scaleItem, idx) => (
                          <div key={idx} className={`flex flex-col items-center w-full my-1
                            ${scaleItem.punctuation === osat.obtained && (record.status !== "pending") ? "bg-secondary border-foreground/10 border rounded-lg" : ""}`}
                            id={scaleItem.punctuation === osat.obtained && record.status !== "pending" ? "focus" : ""}>
                            <p>{scaleItem.punctuation}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-row justify-between space-x-2 sm:space-x-20 px-2">
                        {osat.scale.map((scaleItem, idx) => 
                          scaleItem.description && (
                              <div key={idx} className="flex-1 items-center min-w-[170px]">
                                <CardDescription className="text-center">{scaleItem.description}</CardDescription> 
                              </div>
                          )
                        )}
                      </div>
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </React.Fragment>
              ))}
            </div>

            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px] sm:w-[200px]"></TableHead>
                  <TableHead className=""></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  <TableRow>
                    <TableCell wrap={true} className="font-semibold">Comentario del residente</TableCell>
                    <TableCell wrap={true}>{record.residentComment || <p className="text-muted-foreground">Sin comentarios</p>}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell wrap={true} className="font-semibold">Feedback</TableCell>
                    <TableCell wrap={true}>{record.feedback ? record.feedback : <p className="text-muted-foreground">Sin Feedback</p>}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell wrap={true} className="font-semibold">Juicio global residente</TableCell>
                    <TableCell wrap={true}>{record.residentJudgment}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell wrap={true} className="font-semibold">Juicio global profesor</TableCell>
                    <TableCell wrap={true}>{record.status === "corrected" ? record.teacherJudgment : ""}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell wrap={true} className="font-semibold">Escala resumen</TableCell>
                    <TableCell wrap={true} className="flex flex-row items-start">
                      {record.status === "corrected" ?
                        <div className="font-semibold mr-4 flex">{record.summaryScale}
                        <p className="text-muted-foreground font-normal ml-2">({sumaryScalesList.find(item => item.value === record.summaryScale)?.label})</p>
                        </div>: ""
                      }
                    </TableCell>
                  </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }