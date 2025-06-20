// components/charts/RecordsCompletedClient.tsx
'use client';

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
import { ChartContainer, ChartConfig } from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  LabelList,
} from "recharts";
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { parseISO } from "date-fns";

type Period = "weekly" | "monthly" | "yearly";
interface DataPoint {
  period: string;
  count: number;
}

interface Props {
  weeklyData: DataPoint[];
  monthlyData: DataPoint[];
  yearlyData: DataPoint[];
}

const chartConfig = {
  count: {
    label: "Cantidad",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const periodLabels: Record<Period, string> = {
  weekly: "Por semana",
  monthly: "Por mes",
  yearly: "Por año",
};

export default function RecordsCompletedClient({
  weeklyData,
  monthlyData,
  yearlyData,
}: Props) {
  const [period, setPeriod] = useState<Period>("weekly");

  // Selecciona la data según el periodo
  const data =
    period === "weekly"
      ? weeklyData
      : period === "monthly"
      ? monthlyData
      : yearlyData;

  return (
    <Card className="h-full min-h-[350px]">
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          {/* Título + descripción dinámica */}
          <div>
            <CardTitle>Cantidad de registros completados</CardTitle>
            <CardDescription>{periodLabels[period]}</CardDescription>
          </div>
          {/* Dropdown de periodo dentro del header */}
          <Select
            value={period}
            onValueChange={(v) => setPeriod(v as Period)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent className="rounded-lg">
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="monthly">Mensual</SelectItem>
              <SelectItem value="yearly">Anual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="w-full">
          <BarChart data={data} margin={{ top: 30 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="period"
              tickFormatter={(value) => {
                if (period === "weekly") {
                  const d = parseISO(value);
                  return d.toLocaleDateString("es-ES", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                }
                if (period === "monthly") {
                  const [year, month] = value.split("-");
                  return `${month}/${year}`;
                }
                // yearly
                return value;
              }}
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="count" fill="var(--color-count)" radius={4}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
