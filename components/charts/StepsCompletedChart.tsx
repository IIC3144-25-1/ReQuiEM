"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartConfig } from "@/components/ui/chart";
import { ResponsiveContainer, LineChart, Line, XAxis, CartesianGrid, LabelList } from "recharts";
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const chartConfig = {
  percent: {
    label: "Porcentaje completado:",
    color: "var(--chart-1)",
  }
} satisfies ChartConfig;

export default function StepsCompletedChart({
  data,
  surgeries,
}: {
  data: { month: string; percent: number; surgery: string }[];
  surgeries: string[];
}) {
  const [selectedSurgery, setSelectedSurgery] = useState(surgeries[0] || "");

  // Filtra los datos por la cirugía seleccionada
  const filteredData = data.filter((row) => row.surgery === selectedSurgery);

  return (
    <Card className="h-full min-h-[350px]">
      <CardHeader>
        <CardTitle>Porcentaje de pasos completados</CardTitle>
        <div className="flex items-center justify-between">
          <CardDescription>
            Para la cirugía <b>{selectedSurgery}</b> por mes
          </CardDescription>
          <Select value={selectedSurgery} onValueChange={setSelectedSurgery}>
            <SelectTrigger
              className="w-[160px] rounded-lg"
              aria-label="Selecciona una cirugía"
            >
              <SelectValue placeholder="Selecciona una cirugía" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {surgeries.map((surgery) => (
                <SelectItem key={surgery} value={surgery} className="rounded-lg">
                  {surgery}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="w-full">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredData} margin={{ top: 30, right: 30, left: 30 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickFormatter={(value) => {
                  const [year, month] = value.split("-");
                  return `${month}/${year}`;
                }}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Line
                type="monotone"
                dataKey="percent"
                stroke="var(--color-percent)"
                strokeWidth={3}
                dot={{ r: 3, fill: "var(--color-percent)" }}
              >
                <LabelList
                  position="top"
                  offset={12}
                  className="fill-foreground"
                  fontSize={12}
                  formatter={(value: number) => `${value}%`}
                />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}