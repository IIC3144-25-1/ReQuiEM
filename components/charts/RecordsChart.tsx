'use client';

import {
  BarChart,
  Bar,
  XAxis,
LabelList,
  CartesianGrid,
} from "recharts";
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface WeeklyData {
  week: string; // e.g., "2025-05-19"
  count: number;
}

interface RecordsChartProps {
  data: WeeklyData[];
}

const chartConfig = {
  count: {
    label: "Cantidad",
    color: "var(--chart-1)",
  }
} satisfies ChartConfig

export default function RecordsChart({ data }: RecordsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cantidad de registros completados</CardTitle>
        <CardDescription>Por semana</CardDescription>
      </CardHeader>
      <CardContent>
    <ChartContainer config={chartConfig} className="min-h-[200px] max-h-[400px] my-4 w-full">
      <BarChart accessibilityLayer data={data} margin={{top: 30}}>
        <CartesianGrid vertical={false} />
        <XAxis
            dataKey="week"
            tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("es-ES", {
                month: "short",
                day: "numeric",
                });
            }}
            tick={{ fontSize: 12 }}
        />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="count" fill="var(--color-count)" radius={4} >
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