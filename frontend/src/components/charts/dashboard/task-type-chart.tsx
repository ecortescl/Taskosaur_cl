// components/charts/organization/task-type-chart.tsx
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { ChartWrapper } from "../chart-wrapper";

const chartConfig = {
  STORY: { label: "Historia", color: "#10B981" },
  TASK: { label: "Tarea", color: "#3B82F6" },
  BUG: { label: "Bug", color: "#EF4444" },
  EPIC: { label: "Épica", color: "#8B5CF6" },
  FEATURE: { label: "Funcionalidad", color: "#F59E0B" },
};

interface TaskTypeChartProps {
  data: Array<{ type: string; _count: { type: number } }>;
}

export function TaskTypeChart({ data }: TaskTypeChartProps) {
  const chartData = data?.map((item) => ({
    name: chartConfig[item.type]?.label || item.type,
    value: item._count.type,
    fill: chartConfig[item.type]?.color || "#8B5CF6",
  }));

  const totalTasks = chartData?.reduce((sum, item) => sum + item.value, 0);

  return (
    <ChartWrapper
      title="Distribución de Tipo de Tarea"
      description={`${totalTasks} tareas en total en la organización`}
      config={chartConfig}
      className="border-[var(--border)]"
    >
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            label={({ name, value }) => `${name}: ${value}`}
            labelLine={false}
          >
            {chartData?.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} stroke="#fff" strokeWidth={2} />
            ))}
          </Pie>
          <ChartTooltip
            content={<ChartTooltipContent className="border-0 bg-[var(--accent)]" />}
            wrapperStyle={{ outline: "none" }}
          />
          <ChartLegend
            content={<ChartLegendContent />}
            wrapperStyle={{
              paddingTop: "16px",
              fontSize: "14px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
