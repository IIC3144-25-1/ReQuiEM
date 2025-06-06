"use client";

import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import { Button } from "@/components/ui/button";
import { DownloadRecords } from "./DownloadRecords";

export function DownloadRecordsButton({ side }: { side: "resident" | "teacher" }) {
  const headers = [
    { key: "_id", label: "ID" },
    { key: "date", label: "Fecha" },
    { key: "status", label: "Estado" },
    { key: "residentsYear", label: "Año Residente" },
    { key: "teacher.user.name", label: "Profesor" },
    { key: "surgery.name", label: "Cirugía" },
    // { key: "steps", label: "Pasos (nombre - residente - profesor - puntaje)" },
    // { key: "osats", label: "OSATS (ítem - obtenido)" },
    { key: "residentJudgment", label: "Juicio Residente" },
    { key: "teacherJudgment", label: "Juicio Profesor" },
    { key: "summaryScale", label: "Escala Resumen" },
    { key: "residentComment", label: "Comentario Residente" },
    { key: "feedback", label: "Feedback Profesor" }
  ];

  const statusLabels = {
    all: "Todos",
    pending: "Pendiente",
    corrected: "Corregido",
    reviewed: "Revisado",
    canceled: "Cancelado",
  };
  
  function flattenRecords(records: any[], headers: { key: any; label: any; }[]) {
    return records.map((record) => {
      const flat: Record<string, any> = {};
      headers.forEach(({ key, label }) => {
        let value = key.split('.').reduce((obj: { [x: string]: any; }, k: string | number) => (obj ? obj[k] : ""), record);
        // Si es el status, usa el diccionario
        if (key === "status" && value in statusLabels) {
          value = statusLabels[value as keyof typeof statusLabels];
        }
        flat[label] = value;
      });
      return flat;
    });
  }
  
  const handleDownload = async () => {
    const records = await DownloadRecords(side);
    if (!records || records.length === 0) {
      alert("No hay registros disponibles para descargar.");
      return;
    }
    const flatRecords = flattenRecords(records, headers);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Registros");

    // Agrega encabezados
    worksheet.columns = headers.map(h => ({
      header: h.label,
      key: h.label,
      width: 20
    }));

    // Agrega los datos
    flatRecords.forEach(row => worksheet.addRow(row));

    // Aplica negrita a la primera fila (encabezados)
    worksheet.getRow(1).font = { bold: true };

    // Genera y descarga el archivo
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `registros-${side}.xlsx`);
  };

  return (
    <Button onClick={handleDownload} className="fixed bottom-10 right-10">
      Descargar Registros
    </Button>
  );
}