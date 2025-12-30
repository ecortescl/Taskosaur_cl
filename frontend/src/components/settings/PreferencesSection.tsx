"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import ActionButton from "@/components/common/ActionButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { HiBell, HiGlobeAlt } from "react-icons/hi2";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

export default function PreferencesSection() {
  const { getCurrentUser, updateUser } = useAuth();
  const currentUser = getCurrentUser();

  const fetchingRef = useRef(false);
  const [loading, setLoading] = useState(false);
  const [preferencesData, setPreferencesData] = useState({
    timezone: "(UTC-08:00) Hora del Pacífico (EE. UU. y Canadá)",
    notifications: {
      comments: true,
      assignments: true,
      updates: true,
    },
  });

  useEffect(() => {
    if (!currentUser) return;
    setPreferencesData((prev) => ({
      ...prev,
      timezone: currentUser.timezone || prev.timezone,
    }));
  }, []);

  const handlePreferencesSubmit = useCallback(async () => {
    if (!currentUser || fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);
    try {
      await updateUser(currentUser.id, {
        timezone: preferencesData.timezone,
        preferences: {
          theme: "light",
          notifications: {
            email: preferencesData.notifications.comments,
            push: preferencesData.notifications.assignments,
          },
        },
      });
      toast.success("¡Preferencias actualizadas con éxito!");
    } catch {
      toast.error("Error al actualizar las preferencias. Por favor, inténtelo de nuevo.");
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [currentUser, preferencesData, updateUser]);

  return (
    <Card className="border-none bg-[var(--card)]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-lg font-medium text-[var(--foreground)]">
              <HiBell className="w-5 h-5 text-[var(--primary)]" />
              Preferencias de la Cuenta
            </CardTitle>
            <CardDescription className="text-sm text-[var(--muted-foreground)] mt-1">
              Personalice su configuración de notificaciones, zona horaria y otras preferencias de la cuenta.
            </CardDescription>
          </div>
          <Badge
            variant="secondary"
            className="text-xs bg-[var(--primary)]/10 text-[var(--primary)] border-none"
          >
            Personal
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Timezone */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <HiGlobeAlt className="w-4 h-4 text-[var(--primary)]" />
              <Label className="text-sm font-medium text-[var(--foreground)]">Zona Horaria</Label>
            </div>
            <div className="max-w-md">
              <Select
                value={preferencesData.timezone}
                onValueChange={(value) =>
                  setPreferencesData((prev) => ({
                    ...prev,
                    timezone: value,
                  }))
                }
              >
                <SelectTrigger className="h-8 border-none bg-[var(--background)]">
                  <SelectValue placeholder="Seleccione su zona horaria" />
                </SelectTrigger>
                <SelectContent className="border-none bg-[var(--card)]">
                  <SelectItem value="(UTC-08:00) Pacific Time (US & Canada)">
                    (UTC-08:00) Hora del Pacífico (EE. UU. y Canadá)
                  </SelectItem>
                  <SelectItem value="(UTC-05:00) Eastern Time (US & Canada)">
                    (UTC-05:00) Hora del Este (EE. UU. y Canadá)
                  </SelectItem>
                  <SelectItem value="(UTC+00:00) London">(UTC+00:00) Londres</SelectItem>
                  <SelectItem value="(UTC+01:00) Berlin, Paris, Rome">
                    (UTC+01:00) Berlín, París, Roma
                  </SelectItem>
                  <SelectItem value="(UTC+08:00) Singapore, Hong Kong">
                    (UTC+08:00) Singapur, Hong Kong
                  </SelectItem>
                  <SelectItem value="(UTC+09:00) Tokyo">(UTC+09:00) Tokio</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Se utiliza para mostrar las fechas y horas en la zona horaria local.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <ActionButton
              onClick={handlePreferencesSubmit}
              disabled={loading}
              primary
              className="h-8 px-3 text-sm bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--primary-foreground)] border-none"
            >
              {loading ? (
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </div>
              ) : (
                "Guardar Preferencias"
              )}
            </ActionButton>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
