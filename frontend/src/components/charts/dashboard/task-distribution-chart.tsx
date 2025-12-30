// components/charts/organization/task-distribution-chart.tsx
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from "recharts";
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ChartWrapper } from "../chart-wrapper";

const chartConfig = {
  LOWEST: { label: "Mínima", color: "#94A3B8" },
  LOW: { label: "Baja", color: "#10B981" },
  MEDIUM: { label: "Media", color: "#F59E0B" },
  HIGH: { label: "Alta", color: "#EF4444" },
  HIGHEST: { label: "Máxima", color: "#DC2626" },
};

interface TaskDistributionChartProps {
  data: Array<{ priority: string; _count: { priority: number } }>;
}

export function TaskDistributionChart({ data }: TaskDistributionChartProps) {
  const chartData = data
    .map((item) => ({
      priority: chartConfig[item.priority]?.label || item.priority,
      count: item._count.priority,
      fill: chartConfig[item.priority]?.color || "#8B5CF6",
    }))
    .sort((a, b) => {
      const order = ["Mínima", "Baja", "Media", "Alta", "Máxima"];
      return order.indexOf(a.priority) - order.indexOf(b.priority);
    });

  return (
    <ChartWrapper
      title="Distribución de Prioridad de Tareas"
      description="Desglose de prioridades en todos los proyectos"
      config={chartConfig}
      className="border-[var(--border)]"
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
          barSize={60}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="priority"
            axisLine={false}
            tickLine={false}
            tickMargin={10}
            fontSize={12}
            fontWeight={500}
          />
          <YAxis axisLine={false} tickLine={false} tickMargin={10} fontSize={12} width={40} />
          <ChartTooltip
            content={<ChartTooltipContent className="border-0 bg-[var(--accent)]" />}
            cursor={{ fill: "rgba(0, 0, 0, 0.00)" }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="fill" />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
