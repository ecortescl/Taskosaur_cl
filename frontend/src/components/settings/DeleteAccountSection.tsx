"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HiExclamationTriangle } from "react-icons/hi2";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/router";
import { toast } from "sonner";

export default function DeleteAccountSection() {
  const { getCurrentUser, deleteUser } = useAuth();
  const currentUser = getCurrentUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!currentUser) return;
    if (!confirm("¿Está seguro de que desea eliminar su cuenta? Esta acción no se puede deshacer.")) return;
    setLoading(true);
    try {
      await deleteUser(currentUser.id);
      toast.success("¡Cuenta eliminada con éxito!");
      router.push("/login");
    } catch {
      toast.error("Error al eliminar la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-md bg-red-50 shadow-sm border border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-red-700">
          <HiExclamationTriangle className="w-5 h-5" /> Eliminar Cuenta
        </CardTitle>
        <CardDescription className="text-red-500">
          Elimine permanentemente su cuenta y todos los datos asociados.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="destructive" onClick={handleDelete} disabled={loading}>
          {loading ? "Eliminando..." : "Eliminar Cuenta"}
        </Button>
      </CardContent>
    </Card>
  );
}
