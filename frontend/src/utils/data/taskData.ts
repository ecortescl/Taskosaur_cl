import {
  CalendarDays,
  Clock,
  CheckCircle,
  Type,
  Star,
  Tag,
  Hash,
  ListChecks,
  FileText,
} from "lucide-react";

import {
  HiOutlineClipboard,
  HiOutlineLightBulb,
  HiOutlineBugAnt,
  HiOutlineSparkles,
} from "react-icons/hi2";
import { HiOutlineViewList } from "react-icons/hi";

export const TaskPriorities = [
  { id: "LOW", name: "Baja", value: "LOW", color: "#6b7280" },
  { id: "MEDIUM", name: "Media", value: "MEDIUM", color: "#f59e0b" },
  { id: "HIGH", name: "Alta", value: "HIGH", color: "#ef4444" },
  { id: "HIGHEST", name: "Máxima", value: "HIGHEST", color: "#dc2626" },
];

export const labelColors = [
  { name: "Azul", value: "#3B82F6" },
  { name: "Morado", value: "#8B5CF6" },
  { name: "Verde", value: "#10B981" },
  { name: "Amarillo", value: "#F59E0B" },
  { name: "Rojo", value: "#EF4444" },
  { name: "Gris", value: "#6B7280" },
  { name: "Índigo", value: "#6366F1" },
  { name: "Rosa", value: "#EC4899" },
  { name: "Turquesa", value: "#14B8A6" },
  { name: "Naranja", value: "#F97316" },
  { name: "Cian", value: "#06B6D4" },
  { name: "Lima", value: "#65A30D" },
];

export const PRIORITY_OPTIONS = [
  {
    value: "LOW",
    label: "Baja",
    color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  },
  {
    value: "MEDIUM",
    label: "Media",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  },
  {
    value: "HIGH",
    label: "Alta",
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
  },
  {
    value: "HIGHEST",
    label: "Máxima",
    color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  },
];

export const TASK_TYPE_OPTIONS = [
  { value: "TASK", label: "Tarea" },
  { value: "BUG", label: "Error" },
  { value: "EPIC", label: "Épica" },
  { value: "STORY", label: "Historia" },
  { value: "SUBTASK", label: "Subtarea" },
];

export const DEFAULT_SORT_FIELDS = [
  { value: "createdAt", label: "Fecha de Creación", icon: Clock, category: "date" },
  { value: "updatedAt", label: "Fecha de Actualización", icon: CalendarDays, category: "date" },
  { value: "dueDate", label: "Fecha de Vencimiento", icon: CalendarDays, category: "date" },
  { value: "completedAt", label: "Fecha de Finalización", icon: CheckCircle, category: "date" },
  { value: "title", label: "Título de Tarea", icon: Type, category: "text" },
  { value: "priority", label: "Prioridad", icon: Star, category: "text" },
  { value: "status", label: "Estado", icon: Tag, category: "text" },
  { value: "taskNumber", label: "Número de Tarea", icon: Hash, category: "number" },
  { value: "storyPoints", label: "Puntos de Historia", icon: ListChecks, category: "number" },
  { value: "commentsCount", label: "Comentarios", icon: FileText, category: "number" },
];

export const TaskTypeIcon = {
  TASK: { label: "Tarea", icon: HiOutlineClipboard, color: "blue-500" },
  STORY: { label: "Historia", icon: HiOutlineLightBulb, color: "green-500" },
  BUG: { label: "Error", icon: HiOutlineBugAnt, color: "red-500" },
  EPIC: { label: "Épica", icon: HiOutlineSparkles, color: "purple-500" },
  SUBTASK: { label: "Subtarea", icon: HiOutlineViewList, color: "orange-500" },
} as const;

// Task Type Color mapping from Tailwind class to hex
export const TaskTypeColorMap: Record<string, string> = {
  "blue-500": "#3B82F6",
  "green-500": "#10B981",
  "red-500": "#EF4444",
  "purple-500": "#8B5CF6",
  "orange-500": "#F97316",
};

// Helper function to get hex color from task type
export const getTaskTypeHexColor = (taskType: keyof typeof TaskTypeIcon): string => {
  const color = TaskTypeIcon[taskType]?.color;
  return TaskTypeColorMap[color] || "#6B7280"; // Default gray
};
