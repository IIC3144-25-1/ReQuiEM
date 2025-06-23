// app/components/ScaleSummaryChart.tsx
"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function ScaleSummaryChart({
  surgeries,
  data,
}: {
  surgeries: string[];
  data: { surgery: string; date: string; scale: string }[];
}) {
  const [selectedSurgery, setSelectedSurgery] = useState(surgeries[0] || "");

  // Solo los 5 últimos registros de la cirugía seleccionada
  const rows = data
    .filter((r) => r.surgery === selectedSurgery)
    .slice(-5);

  return (
    <Card className="h-full min-h-[350px]">
      <CardHeader>
        <CardTitle>Últimas escalas resumen</CardTitle>
        <div className="flex items-center justify-between w-full">
          <CardDescription>
            Cirugía: <b>{selectedSurgery || "–"}</b>
          </CardDescription>
          <Select
            value={selectedSurgery}
            onValueChange={setSelectedSurgery}
          >
            <SelectTrigger
              className="w-[160px] rounded-lg"
              aria-label="Selecciona una cirugía"
            >
              <SelectValue placeholder="Selecciona cirugía" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {surgeries.map((surgery) => (
                <SelectItem
                  key={surgery}
                  value={surgery}
                  className="rounded-lg"
                >
                  {surgery}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="w-full overflow-x-auto">
          <table className="w-full table-fixed text-left">
            <colgroup>
              <col className="w-1/2" />
              <col className="w-1/2" />
            </colgroup>
            <thead>
              <tr>
                <th className="pb-2">Fecha</th>
                <th className="pb-2">Escala</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx} className="border-t">
                  <td className="py-2">{row.date}</td>
                  <td className="py-2">{row.scale}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={2} className="py-2 text-center italic">
                    No hay registros disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
