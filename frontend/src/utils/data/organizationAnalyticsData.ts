import { OrganizationKPIMetrics } from "@/components/charts/dashboard/organization-kpi-metrics";
import { ProjectPortfolioChart } from "@/components/charts/dashboard/project-portfolio-chart";
import { TeamUtilizationChart } from "@/components/charts/dashboard/team-utilization-chart";
import { TaskDistributionChart } from "@/components/charts/dashboard/task-distribution-chart";
import { SprintMetricsChart } from "@/components/charts/dashboard/sprint-metrics-chart";
import { QualityMetricsChart } from "@/components/charts/dashboard/quality-metrics-chart";
import { WorkspaceProjectChart } from "@/components/charts/dashboard/workspace-project-chart";
import { MemberWorkloadChart } from "@/components/charts/dashboard/member-workload-chart";
import { ResourceAllocationChart } from "@/components/charts/dashboard/resource-allocation-chart";
import { TaskTypeChart } from "@/components/charts/dashboard/task-type-chart";

export interface KPICard {
  id: string;
  label: string;
  visible: boolean;
  isDefault: boolean;
}

export interface AnalyticsData {
  kpiMetrics: any;
  projectPortfolio: any[];
  teamUtilization: any[];
  taskDistribution: any[];
  taskType: any[];
  sprintMetrics: any[];
  qualityMetrics: any;
  workspaceProjectCount: any[];
  memberWorkload: any[];
  resourceAllocation: any[];
}

export interface Widget {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  dataKey: keyof AnalyticsData;
  visible: boolean;
  gridCols: string;
  priority: number;
}

export const organizationAnalyticsWidgets: Widget[] = [
  {
    id: "kpi-metrics",
    title: "KPIs de la Organización",
    component: OrganizationKPIMetrics,
    dataKey: "kpiMetrics",
    visible: true,
    gridCols: "col-span-full",
    priority: 1,
  },
  {
    id: "project-portfolio",
    title: "Estado del Portafolio de Proyectos",
    component: ProjectPortfolioChart,
    dataKey: "projectPortfolio",
    visible: true,
    gridCols: "col-span-1 md:col-span-1",
    priority: 2,
  },
  {
    id: "team-utilization",
    title: "Distribución de Roles del Equipo",
    component: TeamUtilizationChart,
    dataKey: "teamUtilization",
    visible: true,
    gridCols: "col-span-1 md:col-span-1",
    priority: 9,
  },
  {
    id: "task-distribution",
    title: "Distribución de Prioridad de Tareas",
    component: TaskDistributionChart,
    dataKey: "taskDistribution",
    visible: true,
    gridCols: "col-span-1 md:col-span-1",
    priority: 4,
  },
  {
    id: "task-type",
    title: "Distribución de Tipos de Tarea",
    component: TaskTypeChart,
    dataKey: "taskType",
    visible: false,
    gridCols: "col-span-1 md:col-span-1",
    priority: 5,
  },
  {
    id: "sprint-metrics",
    title: "Resumen de Estado de Sprints",
    component: SprintMetricsChart,
    dataKey: "sprintMetrics",
    visible: false,
    gridCols: "col-span-1 md:col-span-1",
    priority: 6,
  },
  {
    id: "quality-metrics",
    title: "Calidad de Resolución de Bugs",
    component: QualityMetricsChart,
    dataKey: "qualityMetrics",
    visible: false,
    gridCols: "col-span-1 md:col-span-1",
    priority: 7,
  },
  {
    id: "workspace-projects",
    title: "Proyectos por Workspace",
    component: WorkspaceProjectChart,
    dataKey: "workspaceProjectCount",
    visible: false,
    gridCols: "col-span-full",
    priority: 8,
  },
  {
    id: "member-workload",
    title: "Distribución de Carga de Trabajo de Miembros",
    component: MemberWorkloadChart,
    dataKey: "memberWorkload",
    visible: true,
    gridCols: "col-span-1 md:col-span-1",
    priority: 3,
  },
  {
    id: "resource-allocation",
    title: "Asignación de Recursos",
    component: ResourceAllocationChart,
    dataKey: "resourceAllocation",
    visible: false,
    gridCols: "col-span-1 md:col-span-1",
    priority: 10,
  },
];

export const organizationKPICards: KPICard[] = [
  {
    id: "workspaces",
    label: "Total Workspaces",
    visible: true,
    isDefault: true,
  },
  {
    id: "projects",
    label: "Total Proyectos",
    visible: true,
    isDefault: true,
  },
  {
    id: "members",
    label: "Miembros del Equipo",
    visible: true,
    isDefault: true,
  },
  {
    id: "task-completion",
    label: "Completitud de Tareas",
    visible: true,
    isDefault: true,
  },
  {
    id: "bug-resolution",
    label: "Resolución de Bugs",
    visible: false,
    isDefault: false,
  },
  {
    id: "overdue-tasks",
    label: "Tareas Vencidas",
    visible: false,
    isDefault: false,
  },
  {
    id: "active-sprints",
    label: "Sprints Activos",
    visible: false,
    isDefault: false,
  },
  {
    id: "productivity",
    label: "Productividad General",
    visible: false,
    isDefault: false,
  },
];
