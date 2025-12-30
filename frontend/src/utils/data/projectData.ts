export const PROJECT_CATEGORIES = [
  {
    id: "operational",
    label: "Operacional",
    color: "#3B82F6", // Blue
    description: "Operaciones y mantenimiento del día a día",
  },
  {
    id: "technical",
    label: "Técnico",
    color: "#8B5CF6", // Purple
    description: "Desarrollo y proyectos técnicos",
  },
  {
    id: "strategic",
    label: "Estratégico",
    color: "#10B981", // Green
    description: "Planificación y estrategia a largo plazo",
  },
  {
    id: "hiring",
    label: "Contratación",
    color: "#F59E0B", // Yellow
    description: "Reclutamiento y formación de equipos",
  },
  {
    id: "financial",
    label: "Financiero",
    color: "#EF4444", // Red
    description: "Presupuesto y planificación financiera",
  },
  {
    id: "neutral",
    label: "Neutral",
    color: "#6B7280", // Gray
    description: "Proyectos generales o sin categorizar",
  },
  {
    id: "innovation",
    label: "Innovación",
    color: "#6366F1", // Indigo
    description: "Iniciativas de creatividad e innovación",
  },
  {
    id: "community",
    label: "Comunidad",
    color: "#EC4899", // Pink
    description: "Iniciativas de comunidad y compromiso",
  },
  {
    id: "sustainability",
    label: "Sostenibilidad",
    color: "#14B8A6", // Teal
    description: "Proyectos de sostenibilidad y medio ambiente",
  },
  {
    id: "marketing",
    label: "Marketing",
    color: "#F97316", // Orange
    description: "Campañas de marketing y difusión",
  },
  {
    id: "research",
    label: "Investigación",
    color: "#06B6D4", // Cyan
    description: "Proyectos de investigación y análisis",
  },
  {
    id: "growth",
    label: "Crecimiento",
    color: "#65A30D", // Lime
    description: "Iniciativas de crecimiento y expansión",
  },
];

export const roles = [
  {
    id: "0",
    name: "DUEÑO",
    description: "Puede gestionar todo",
    variant: "default" as const,
  },
  {
    id: "1",
    name: "GESTOR",
    description: "Puede gestionar el proyecto y los miembros",
    variant: "default" as const,
  },
  {
    id: "2",
    name: "MIEMBRO",
    description: "Puede acceder y trabajar en los proyectos",
    variant: "default" as const,
  },
  {
    id: "3",
    name: "VISOR",
    description: "Solo puede ver el contenido del proyecto",
    variant: "secondary" as const,
  },
];

export const ACTION_TYPES = [
  { value: "setPriority", label: "Establecer Prioridad" },
  { value: "assignTo", label: "Asignar a" },
  { value: "addLabels", label: "Añadir Etiquetas" },
  { value: "markAsSpam", label: "Marcar como Spam" },
  { value: "autoReply", label: "Respuesta Automática" },
];

export const EMAIL_FIELDS = [
  { value: "subject", label: "Asunto" },
  { value: "from", label: "De" },
  { value: "to", label: "Para" },
  { value: "cc", label: "CC" },
  { value: "body", label: "Cuerpo" },
];

export const EMAIL_OPERATORS = [
  { value: "contains", label: "Contiene" },
  { value: "equals", label: "Es igual a" },
  { value: "matches", label: "Coincide con" },
  { value: "startsWith", label: "Empieza por" },
  { value: "endsWith", label: "Termina en" },
];
