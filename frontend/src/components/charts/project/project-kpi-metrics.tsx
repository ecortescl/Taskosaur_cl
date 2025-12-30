import { StatCard } from "@/components/common/StatCard";
import { CheckCircle, AlertTriangle, TrendingUp, Bug, Zap } from "lucide-react";
interface ProjectKPIMetricsProps {
  data: {
    totalTasks: number;
    completedTasks: number;
    activeSprints: number;
    totalBugs: number;
    resolvedBugs: number;
    completionRate: number;
    bugResolutionRate: number;
  };
}

export function ProjectKPIMetrics({ data }: ProjectKPIMetricsProps) {
  const kpiCards = [
    {
      title: "Tareas Totales",
      label: "Tareas", // 👈 Added
      value: data?.totalTasks,
      description: "Todas las tareas del proyecto",
      icon: <CheckCircle className="h-4 w-4" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Tareas Completadas",
      label: "Tareas Completadas", // 👈 Added
      value: data?.completedTasks,
      description: "Terminadas con éxito",
      icon: <CheckCircle className="h-4 w-4" />,
    },
    {
      title: "Sprints Activos",
      label: "Sprints Activos", // 👈 Added
      value: data?.activeSprints,
      description: "En ejecución",
      icon: <Zap className="h-4 w-4" />,
      color: "text-purple-600",
    },
    {
      title: "Resolución de Bugs",
      label: "Resolución de Bugs", // 👈 Added
      value: `${data?.bugResolutionRate.toFixed(1)}%`,
      description: `${data?.resolvedBugs}/${data?.totalBugs} bugs corregidos`,
      icon: <Bug className="h-4 w-4" />,
    },
    {
      title: "Completitud de Tareas",
      label: "Completitud de Tareas", // 👈 Added
      value: `${data?.completionRate.toFixed(1)}%`,
      description: "Progreso general",
      icon:
        data?.completionRate > 75 ? (
          <TrendingUp className="h-4 w-4" />
        ) : (
          <AlertTriangle className="h-4 w-4" />
        ),
    },
    {
      title: "Bugs Abiertos",
      label: "Bugs Abiertos", // 👈 Added
      value: data?.totalBugs - data?.resolvedBugs,
      description: "Requieren atención",
      icon:
        data?.totalBugs - data?.resolvedBugs === 0 ? (
          <CheckCircle className="h-4 w-4" />
        ) : (
          <Bug className="h-4 w-4" />
        ),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {kpiCards.map((card, index) => (
        <StatCard key={index} {...card} />
      ))}
    </div>
  );
}
