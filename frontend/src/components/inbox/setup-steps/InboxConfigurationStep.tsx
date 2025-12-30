import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InboxFormData } from "@/types/emailIntegration";
import SearchableAssigneeDropdown from "@/components/shared/SearchableAssigneeDropdown";
import ActionButton from "@/components/common/ActionButton";

interface InboxConfigurationStepProps {
  formData: InboxFormData;
  validationErrors: Record<string, string>;
  availableStatuses: any[];
  availableUsers: any[];
  isSaving: boolean;
  onFieldChange: (field: keyof InboxFormData, value: any) => void;
  onSubmit: () => void;
  onAssigneeSearch: (term: string) => void;
}

export default function InboxConfigurationStep({
  formData,
  validationErrors,
  availableStatuses,
  availableUsers,
  isSaving,
  onFieldChange,
  onSubmit,
  onAssigneeSearch,
}: InboxConfigurationStepProps) {
  return (
    <div className=" mt-0 animate-fadeIn">
      <div className="space-y-5">
        <div>
          <Label className="pb-2 text-sm font-medium" htmlFor="inboxName">
            Nombre del Inbox <span className="text-red-500">*</span>
          </Label>
          <Input
            id="inboxName"
            value={formData.name}
            onChange={(e) => onFieldChange("name", e.target.value)}
            placeholder="Inbox de Soporte"
            className={`h-10 ${validationErrors.name ? "border-red-500" : ""}`}
          />
          {validationErrors.name && (
            <p className="text-sm text-red-600 mt-1">{validationErrors.name}</p>
          )}
        </div>

        <div>
          <Label className="pb-2 text-sm font-medium" htmlFor="description">
            Descripción
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => onFieldChange("description", e.target.value)}
            placeholder="Integración de email para soporte al cliente"
            rows={2}
          />
        </div>

        <div>
          <Label className="pb-2 text-sm font-medium" htmlFor="emailAddress">
            Dirección de Email
          </Label>
          <Input
            id="emailAddress"
            type="email"
            value={formData.emailAddress}
            onChange={(e) => onFieldChange("emailAddress", e.target.value)}
            placeholder="soporte@empresa.com"
            className={`h-10 ${validationErrors.emailAddress ? "border-red-500" : ""}`}
          />
          {validationErrors.emailAddress && (
            <p className="text-sm text-red-600 mt-1">{validationErrors.emailAddress}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="pb-2 text-sm font-medium" htmlFor="defaultTaskType">
              Tipo de Tarea por Defecto
            </Label>
            <Select
              value={formData.defaultTaskType}
              onValueChange={(value) =>
                onFieldChange("defaultTaskType", value as InboxFormData["defaultTaskType"])
              }
            >
              <SelectTrigger className="w-full border-[var(--border)] h-10">
                <SelectValue placeholder="Seleccionar tipo de tarea" />
              </SelectTrigger>
              <SelectContent className="bg-[var(--card)] border-[var(--border)]">
                <SelectItem className="hover:bg-[var(--muted)]" value="TASK">
                  Tarea
                </SelectItem>
                <SelectItem className="hover:bg-[var(--muted)]" value="BUG">
                  Error (Bug)
                </SelectItem>
                <SelectItem className="hover:bg-[var(--muted)]" value="EPIC">
                  Épica
                </SelectItem>
                <SelectItem className="hover:bg-[var(--muted)]" value="STORY">
                  Historia
                </SelectItem>
                <SelectItem className="hover:bg-[var(--muted)]" value="SUBTASK">
                  Subtarea
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="pb-2 text-sm font-medium" htmlFor="defaultPriority">
              Prioridad por Defecto
            </Label>
            <Select
              value={formData.defaultPriority}
              onValueChange={(value) =>
                onFieldChange("defaultPriority", value as InboxFormData["defaultPriority"])
              }
            >
              <SelectTrigger className="w-full border-[var(--border)] h-10">
                <SelectValue placeholder="Seleccionar prioridad" />
              </SelectTrigger>
              <SelectContent className="bg-[var(--card)] border-[var(--border)]">
                <SelectItem className="hover:bg-[var(--muted)]" value="LOW">
                  Baja
                </SelectItem>
                <SelectItem className="hover:bg-[var(--muted)]" value="MEDIUM">
                  Media
                </SelectItem>
                <SelectItem className="hover:bg-[var(--muted)]" value="HIGH">
                  Alta
                </SelectItem>
                <SelectItem className="hover:bg-[var(--muted)]" value="HIGHEST">
                  Máxima
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="pb-2 text-sm font-medium" htmlFor="defaultStatus">
              Estado por Defecto <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.defaultStatusId}
              onValueChange={(value) => onFieldChange("defaultStatusId", value)}
            >
              <SelectTrigger
                className={`w-full border-[var(--border)] h-10 ${validationErrors.defaultStatusId ? "border-red-500" : ""
                  }`}
              >
                <SelectValue placeholder="Seleccionar estado por defecto" />
              </SelectTrigger>
              <SelectContent className="bg-[var(--card)] border-[var(--border)]">
                {availableStatuses.map((status) => (
                  <SelectItem className="hover:bg-[var(--muted)]" key={status.id} value={status.id}>
                    <div className="flex items-center space-x-2">
                      {status.color && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: status.color }}
                        />
                      )}
                      <span>{status.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.defaultStatusId && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.defaultStatusId}</p>
            )}
          </div>

          <div>
            <Label className="pb-2 text-sm font-medium" htmlFor="defaultAssignee">
              Asignado por Defecto
            </Label>
            <SearchableAssigneeDropdown
              value={formData.defaultAssigneeId}
              onChange={(value) => onFieldChange("defaultAssigneeId", value)}
              users={availableUsers}
              onSearch={onAssigneeSearch}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="pb-2 cursor-pointer text-sm font-medium" htmlFor="autoCreateTask">
                Creación Automática de Tareas
              </Label>
              <p className="text-sm text-[var(--muted-foreground)]/60">
                Convertir automáticamente correos en tareas
              </p>
            </div>
            <Switch
              id="autoCreateTask"
              checked={formData.autoCreateTask}
              onCheckedChange={(checked) => onFieldChange("autoCreateTask", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="pb-2 cursor-pointer text-sm font-medium" htmlFor="autoReply">
                Respuesta Automática
              </Label>
              <p className="text-sm text-[var(--muted-foreground)]/60">Enviar respuestas automáticas</p>
            </div>
            <Switch
              id="autoReply"
              checked={formData.autoReplyEnabled}
              onCheckedChange={(checked) => onFieldChange("autoReplyEnabled", checked)}
            />
          </div>
        </div>

        {formData.autoReplyEnabled && (
          <div>
            <Label className="pb-2 text-sm font-medium" htmlFor="autoReplyTemplate">
              Mensaje de Respuesta Automática <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="autoReplyTemplate"
              value={formData.autoReplyTemplate}
              onChange={(e) => onFieldChange("autoReplyTemplate", e.target.value)}
              placeholder="Gracias por contactarnos. Le responderemos en un plazo de 24 horas."
              rows={3}
              className={validationErrors.autoReplyTemplate ? "border-red-500" : ""}
            />
            {validationErrors.autoReplyTemplate && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.autoReplyTemplate}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <ActionButton onClick={onSubmit} disabled={isSaving} primary>
          {isSaving ? <>Creando...</> : <>{"Siguiente"}</>}
        </ActionButton>
      </div>
    </div>
  );
}
