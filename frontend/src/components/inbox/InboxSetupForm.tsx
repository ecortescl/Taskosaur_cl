import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { HiEnvelope, HiCog } from "react-icons/hi2";

// Form validation schema using Zod
const inboxSetupSchema = z.object({
  name: z.string().min(1, "El nombre del inbox es obligatorio").max(100),
  description: z.string().optional(),
  emailAddress: z.string().email("Se requiere una dirección de correo válida").optional().or(z.literal("")),
  emailSignature: z.string().optional(),
  autoReplyEnabled: z.boolean().optional(),
  autoReplyTemplate: z.string().optional(), // ✅ MUST BE PRESENT
  autoCreateTask: z.boolean().optional(),
  defaultTaskType: z.enum(["TASK", "BUG", "EPIC", "STORY", "SUBTASK"]).optional(),
  defaultPriority: z.enum(["LOWEST", "LOW", "MEDIUM", "HIGH", "HIGHEST"]).optional(),
  defaultStatusId: z.string().min(1, "El estado por defecto es obligatorio"),
});

export type InboxSetupFormData = z.infer<typeof inboxSetupSchema>;

interface InboxSetupFormProps {
  onSubmit: (data: InboxSetupFormData) => Promise<void>;
  onCancel: () => void;
  availableStatuses: Array<{ id: string; name: string; color?: string }>;
  defaultValues?: Partial<InboxSetupFormData>;
  isLoading?: boolean;
}

export default function InboxSetupForm({
  onSubmit,
  onCancel,
  availableStatuses,
  defaultValues,
  isLoading = false,
}: InboxSetupFormProps) {
  const form = useForm<InboxSetupFormData>({
    resolver: zodResolver(inboxSetupSchema),
    defaultValues: {
      name: "Inbox del Proyecto",
      autoCreateTask: true,
      autoReplyEnabled: false,
      defaultTaskType: "TASK",
      defaultPriority: "MEDIUM",
      defaultStatusId: availableStatuses[0]?.id || "",
      ...defaultValues,
    },
  });

  const {
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;
  const autoReplyEnabled = watch("autoReplyEnabled");

  const handleFormSubmit = async (data: InboxSetupFormData) => {
    try {
      await onSubmit(data);
      toast.success("Configuración del inbox completada con éxito");
    } catch (error) {
      toast.error("Error al configurar el inbox");
      console.error("Inbox setup error:", error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <HiEnvelope className="w-5 h-5" />
          <span>Configurar Integración de Email</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información Básica</h3>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Inbox *</FormLabel>
                    <FormControl>
                      <Input placeholder="Inbox de Soporte" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormDescription>Un nombre descriptivo para tu inbox de correo</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Integración de email para soporte al cliente"
                        rows={2}
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>Descripción opcional del propósito de este inbox</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emailAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección de Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="soporte@empresa.com"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      La dirección de email para este inbox (se puede configurar más tarde)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Task Creation Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Ajustes de Creación de Tareas</h3>

              <FormField
                control={form.control}
                name="autoCreateTask"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Crear Tareas Automáticamente</FormLabel>
                      <FormDescription>
                        Convertir automáticamente los emails entrantes en tareas
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="defaultTaskType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Tarea por Defecto</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo de tarea" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="TASK">Tarea</SelectItem>
                          <SelectItem value="BUG">Error</SelectItem>
                          <SelectItem value="EPIC">Épica</SelectItem>
                          <SelectItem value="STORY">Historia</SelectItem>
                          <SelectItem value="SUBTASK">Subtarea</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="defaultPriority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridad por Defecto</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar prioridad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="LOW">Baja</SelectItem>
                          <SelectItem value="MEDIUM">Media</SelectItem>
                          <SelectItem value="HIGH">Alta</SelectItem>
                          <SelectItem value="HIGHEST">Muy Alta</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="defaultStatusId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado por Defecto *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado por defecto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableStatuses.map((status) => (
                          <SelectItem key={status.id} value={status.id}>
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
                    <FormDescription>
                      Estado asignado a las nuevas tareas creadas desde emails
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Auto-Reply Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Ajustes de Respuesta Automática</h3>

              <FormField
                control={form.control}
                name="autoReplyEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Activar Respuesta Automática</FormLabel>
                      <FormDescription>Enviar respuestas automáticas a los emails entrantes</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {autoReplyEnabled && (
                <FormField
                  control={form.control}
                  name="autoReplyTemplate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mensaje de Respuesta Automática</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Gracias por contactarnos. Responderemos dentro de las próximas 24 horas."
                          rows={4}
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription>Mensaje enviado automáticamente a los remitentes de los emails</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Email Signature */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Firma de Email</h3>

              <FormField
                control={form.control}
                name="emailSignature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Firma</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="--&#10;Saludos cordiales,&#10;Equipo de Soporte"
                        rows={3}
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>Firma añadida a todas las respuestas de email salientes</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Form Actions */}
            <div className="flex space-x-4 pt-6 border-t">
              <Button type="submit" disabled={isSubmitting || isLoading} className="flex-1">
                {isSubmitting ? (
                  <>
                    <HiCog className="w-4 h-4 mr-2 animate-spin" />
                    Creando Inbox...
                  </>
                ) : (
                  "Crear Inbox"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting || isLoading}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
