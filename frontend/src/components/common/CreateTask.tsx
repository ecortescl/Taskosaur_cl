import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HiDocumentText, HiCog, HiUsers, HiPaperClip, HiTrash, HiBolt } from "react-icons/hi2";

import TaskDescription from "@/components/tasks/views/TaskDescription";
import { useTask } from "@/contexts/task-context";
import { TaskPriorities } from "@/utils/data/taskData";
import { toast } from "sonner";
import router from "next/router";
import ActionButton from "./ActionButton";
import { useProject } from "@/contexts/project-context";
import { useSprint } from "@/contexts/sprint-context";
import { formatDateForApi, getTodayDate } from "@/utils/handleDateChange";
import MemberSelect from "./MemberSelect";
import { Plus } from "lucide-react";
import { Button } from "../ui";

interface CreateTaskProps {
  workspaceSlug?: string;
  projectSlug?: string;
  workspace: string | { id: string; name: string };
  projects: any[];
}

const TaskSectionHeader = ({ icon: Icon, title }: { icon: any; title: string }) => (
  <div className="flex items-center gap-2 mb-3">
    <Icon size={16} className="text-[var(--primary)]" />
    <h2 className="text-sm font-semibold text-[var(--foreground)]">{title}</h2>
  </div>
);

export default function CreateTask({ projectSlug, workspace, projects }: CreateTaskProps) {
  const { createTaskWithAttachements } = useTask();
  const { getProjectMembers, getTaskStatusByProject } = useProject();
  const { getSprintsByProject, getActiveSprint } = useSprint();

  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [availableStatuses, setAvailableStatuses] = useState<any[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);
  const [loadingSprints, setLoadingSprints] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "",
    priority: "MEDIUM",
    type: "TASK",
    startDate: "",
    dueDate: "",
    sprintId: "",
  });
  const [assignees, setAssignees] = useState<any[]>([]);
  const [reporters, setReporters] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = (): boolean => {
    const hasTitle = formData.title.trim().length > 0;
    const hasProject = selectedProject?.id;
    // const hasStatus = formData.status.length > 0;
    const hasPriority = formData.priority.length > 0;
    // const hasAssignment = assignees.length > 0 || reporters.length > 0;
    return hasTitle && hasProject && hasPriority;
  };

  const handleFormDataChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProjectChange = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    setSelectedProject(project);
    setAssignees([]);
    setReporters([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments((prev) => [...prev, ...newFiles]);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    setAttachments((prev) => [...prev, ...droppedFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  useEffect(() => {
    const fetchProjectMembers = async (projectId: string) => {
      if (!projectId || !getProjectMembers) return;

      // setMembersLoading(true);
      try {
        const fetchedMembers = await getProjectMembers(projectId);

        const normalizedMembers = Array.isArray(fetchedMembers)
          ? fetchedMembers.map((m) => ({
            id: m.user?.id || m.id,
            firstName: m.user?.firstName || "",
            lastName: m.user?.lastName || "",
            email: m.user?.email || "",
            role: m.role,
          }))
          : [];

        setMembers(normalizedMembers);
      } catch (error) {
        console.error("Failed to fetch project members:", error);
        setMembers([]);
        toast.error("Error al cargar los miembros del proyecto");
      } finally {
        // setMembersLoading(false);
      }
    };

    const fetchProjectStatuses = async (projectId: string) => {
      if (!projectId || !getTaskStatusByProject) return;

      try {
        const statuses = await getTaskStatusByProject(projectId);
        setAvailableStatuses(statuses);
      } catch (error) {
        console.error("Failed to fetch project statuses:", error);
        setAvailableStatuses([]);
        toast.error("Error al cargar los estados del proyecto");
      }
    };

    const fetchProjectSprints = async (projectId: string) => {
      if (!projectId || !getSprintsByProject) return;

      const project = projects.find(p => p.id === projectId);
      if (!project) return;

      setLoadingSprints(true);
      try {
        const [projectSprints, activeSprint] = await Promise.all([
          getSprintsByProject(project.slug),
          getActiveSprint(projectId),
        ]);
        setSprints(projectSprints || []);

        if (activeSprint) {
          setFormData(prev => ({ ...prev, sprintId: activeSprint.id }));
        }
      } catch (error) {
        console.error("Failed to fetch project sprints:", error);
        setSprints([]);
        toast.error("Error al cargar los sprints del proyecto");
      } finally {
        setLoadingSprints(false);
      }
    };

    if (selectedProject?.id) {
      fetchProjectMembers(selectedProject.id);
      fetchProjectStatuses(selectedProject.id);
      fetchProjectSprints(selectedProject.id);
    } else {
      setMembers([]);
      setAvailableStatuses([]);
      setSprints([]);
    }
  }, [selectedProject?.id]);

  useEffect(() => {
    if (projectSlug && projects.length > 0) {
      const project = projects.find((p) => p.slug === projectSlug);
      if (project && selectedProject?.id !== project.id) {
        setSelectedProject(project);
      }
    } else if (projects.length === 1 && !selectedProject) {
      setSelectedProject(projects[0]);
    }
  }, [projectSlug, projects, selectedProject?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setIsSubmitting(true);
    try {

      const defaultStatus =
        availableStatuses.find(
          (status) =>
            status.name.toLowerCase() === "todo" ||
            status.name.toLowerCase() === "to do" ||
            status.isDefault
        ) || availableStatuses[0];


      const taskData: any = {
        title: formData.title.trim(),
        description: formData.description.trim() || "",
        priority: formData.priority.toUpperCase() as "LOW" | "MEDIUM" | "HIGH" | "HIGHEST",
        type: formData.type as "TASK" | "BUG" | "EPIC" | "STORY" | "SUBTASK",
        startDate: formData.startDate ? formatDateForApi(formData.startDate)
          : formatDateForApi(getTodayDate()),
        dueDate: formData.dueDate
          ? formatDateForApi(formData.dueDate)
          : formatDateForApi(getTodayDate()),
        projectId: selectedProject.id,
        statusId: formData.status || defaultStatus.id,
        sprintId: formData.sprintId || undefined,
      };

      if (assignees.length > 0) taskData.assigneeIds = assignees.map((a) => a.id);
      if (reporters.length > 0) taskData.reporterIds = reporters.map((r) => r.id);
      if (attachments.length > 0) taskData.attachments = attachments;

      const newTask = await createTaskWithAttachements(taskData);

      toast.success(`Tarea "${newTask.title}" creada exitosamente!`);
      router.back();
    } catch (error: any) {
      toast.error(error?.message || "Error al crear la tarea");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form id="create-task-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
            <Card className="border-none bg-[var(--card)] gap-0 rounded-md">
              <CardHeader className="pb-0">
                <TaskSectionHeader icon={HiDocumentText} title="Información Básica" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Título de Tarea <span className="projects-form-label-required">*</span>
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={(e) => handleFormDataChange("title", e.target.value)}
                    placeholder="¿Qué necesita hacerse?"
                    className="border-[var(--border)] bg-[var(--background)]"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none bg-[var(--card)] gap-0 rounded-md">
              <CardHeader className="flex items-center justify-between pb-2">
                <TaskSectionHeader
                  icon={HiPaperClip}
                  title={`Adjunto(s) ${attachments.length > 0 ? `(${attachments.length})` : ""}`}
                />
                <div>
                  <Input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                    accept="*/*"
                  />
                  <Label
                    htmlFor="file-upload"
                    className="py-2 relative h-9 px-4 bg-[var(--primary)] cursor-pointer rounded-md hover:bg-[var(--primary)]/90 text-[var(--primary-foreground)] shadow-sm hover:shadow-md transition-all duration-200 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar Adjunto</span>
                  </Label>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {attachments.length > 0 ? (
                  <div className="space-y-2">
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-[var(--background)] border border-[var(--border)] rounded-md"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <HiPaperClip
                              size={16}
                              className="text-[var(--muted-foreground)] flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[var(--foreground)] truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-[var(--muted-foreground)]">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={() => removeAttachment(index)}
                            className="flex-shrink-0 ml-2 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                            aria-label="Eliminar archivo"
                          >
                            <HiTrash className="w-4 h-4 text-[var(--destructive)]" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center pt-5">Sin Adjunto(s)</div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none bg-[var(--card)] gap-0 rounded-md">
              <CardHeader className="pb-0">
                <TaskSectionHeader icon={HiDocumentText} title="Descripción" />
              </CardHeader>
              <CardContent className="space-y-4">
                <TaskDescription
                  value={formData.description}
                  onChange={(value) => handleFormDataChange("description", value)}
                  editMode={true}
                />
              </CardContent>
            </Card>
          </form>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none bg-[var(--card)] gap-0 rounded-md">
            <CardHeader>
              <TaskSectionHeader icon={HiCog} title="Espacio de Trabajo y Proyecto" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workspace">
                  Espacio de Trabajo <span className="projects-form-label-required">*</span>
                </Label>
                <Input
                  id="workspace"
                  value={
                    workspace && typeof workspace === "object" && workspace !== null
                      ? (workspace.name ?? "")
                      : typeof workspace === "string"
                        ? workspace
                        : ""
                  }
                  readOnly
                  className="w-full border-[var(--border)] bg-[var(--background)] cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project">
                  Proyecto <span className="projects-form-label-required">*</span>
                </Label>
                {projects.length === 1 && projects[0] ? (
                  <Input
                    id="project"
                    value={projects[0].name}
                    readOnly
                    className="w-full border-[var(--border)] bg-[var(--background)] cursor-not-allowed"
                  />
                ) : (
                  <Select value={selectedProject?.id || ""} onValueChange={handleProjectChange}>
                    <SelectTrigger className="w-full border-[var(--border)] bg-[var(--background)]">
                      <SelectValue placeholder="Selecciona un proyecto" />
                    </SelectTrigger>
                    <SelectContent className="border-[var(--border)] bg-[var(--popover)]">
                      {projects.map((project) => (
                        <SelectItem
                          className="hover:bg-[var(--hover-bg)]"
                          key={project.id}
                          value={project.id}
                        >
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-[var(--card)] gap-0 rounded-md">
            <CardHeader>
              <TaskSectionHeader icon={HiCog} title="Configuración de Tarea" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">
                  Estado
                  {/* <span className="projects-form-label-required">*</span> */}
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleFormDataChange("status", value)}
                  disabled={availableStatuses.length === 0}
                >
                  <SelectTrigger className="w-full border-[var(--border)] bg-[var(--background)]">
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent className="border-[var(--border)] bg-[var(--popover)]">
                    {availableStatuses.length > 0 ? (
                      availableStatuses.map((status) => (
                        <SelectItem
                          className="hover:bg-[var(--hover-bg)]"
                          key={status.id}
                          value={status.id}
                        >
                          {status.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="__loading" disabled>
                        Cargando estados...
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Si se deja vacío, se seleccionará automáticamente el estado predeterminado del proyecto.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">
                  Prioridad <span className="projects-form-label-required">*</span>
                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => handleFormDataChange("priority", value)}
                >
                  <SelectTrigger className="w-full border-[var(--border)] bg-[var(--background)]">
                    <SelectValue placeholder="Selecciona prioridad" />
                  </SelectTrigger>
                  <SelectContent className="border-[var(--border)] bg-[var(--popover)]">
                    {TaskPriorities.map((priority) => (
                      <SelectItem
                        className="hover:bg-[var(--hover-bg)]"
                        key={priority.value}
                        value={priority.value}
                      >
                        {priority.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">
                  Tipo de Tarea <span className="projects-form-label-required">*</span>
                </Label>
                <Select
                  value={formData.type || "TASK"}
                  onValueChange={(value) => handleFormDataChange("type", value)}
                >
                  <SelectTrigger className="w-full border-[var(--border)] bg-[var(--background)]">
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                  <SelectContent className="border-[var(--border)] bg-[var(--popover)]">
                    {[
                      { value: "TASK", name: "Tarea" },
                      { value: "BUG", name: "Error" },
                      { value: "EPIC", name: "Épica" },
                      { value: "STORY", name: "Historia" },
                      { value: "SUBTASK", name: "Subtarea" },
                    ].map((type) => (
                      <SelectItem
                        className="hover:bg-[var(--hover-bg)]"
                        key={type.value}
                        value={type.value}
                      >
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sprint">Sprint</Label>
                <Select
                  value={formData.sprintId}
                  onValueChange={(value) => handleFormDataChange("sprintId", value)}
                  disabled={loadingSprints}
                >
                  <SelectTrigger className="w-full border-[var(--border)] bg-[var(--background)]">
                    <SelectValue
                      placeholder={
                        !selectedProject?.id
                          ? "Selecciona proyecto primero"
                          : loadingSprints
                            ? "Cargando..."
                            : "Selecciona sprint (opcional)"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="border-[var(--border)] bg-[var(--popover)]">
                    {sprints.map((sprint) => (
                      <SelectItem
                        className="hover:bg-[var(--hover-bg)]"
                        key={sprint.id}
                        value={sprint.id}
                      >
                        <div className="flex items-center gap-2">
                          {sprint.name} {sprint.isDefault === true && "(Predeterminado)"}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Fecha de Inicio</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleFormDataChange("startDate", e.target.value)}
                  onClick={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.showPicker?.();
                  }}
                  className="w-full border-[var(--border)] bg-[var(--background)] cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:mt-1"
                  style={{
                    colorScheme: "dark",
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Fecha de Vencimiento</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleFormDataChange("dueDate", e.target.value)}
                  onClick={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.showPicker?.();
                  }}
                  className="w-full border-[var(--border)] bg-[var(--background)] cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:mt-1"
                  style={{
                    colorScheme: "dark",
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-[var(--card)] gap-0 rounded-md">
            <CardHeader className="flex">
              <TaskSectionHeader icon={HiUsers} title="Asignación" />
              {/* <span className="projects-form-label-required">*</span> */}
            </CardHeader>
            <CardContent className="space-y-4">
              {membersLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin h-4 w-4 border-2 border-[var(--primary)] border-t-transparent rounded-full mx-auto mb-2" />
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Cargando miembros del proyecto...
                  </p>
                </div>
              ) : members.length === 0 ? (
                <p className="text-sm text-red-500 text-center">No se encontraron miembros del proyecto.</p>
              ) : (
                <>
                  <MemberSelect
                    label="Asignados"
                    selectedMembers={assignees}
                    onChange={setAssignees}
                    members={members}
                    projectId={selectedProject?.id}
                    disabled={!selectedProject?.id || members.length === 0}
                    placeholder={
                      !selectedProject?.id ? "Selecciona un proyecto primero" : "Selecciona asignados..."
                    }
                  />

                  <MemberSelect
                    label="Reportadores"
                    selectedMembers={reporters}
                    onChange={setReporters}
                    members={members}
                    projectId={selectedProject?.id}
                    disabled={!selectedProject?.id || members.length === 0}
                    placeholder={
                      !selectedProject?.id ? "Selecciona un proyecto primero" : "Selecciona reportadores..."
                    }
                  />
                </>
              )}
            </CardContent>
          </Card>
          <div className="flex items-center justify-end gap-3 " id="submit-form-button">
            <ActionButton
              onClick={() => router.back()}
              type="button"
              variant="outline"
              secondary
              className="h-8 px-3 cursor-pointer"
            >
              Cancelar
            </ActionButton>
            <ActionButton
              onClick={handleSubmit}
              type="submit"
              disabled={!isFormValid() || isSubmitting}
              primary
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Creando tarea...
                </div>
              ) : (
                "Crear Tarea"
              )}
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
}
