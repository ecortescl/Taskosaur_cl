// pages/invite/invalid.tsx
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HiExclamationTriangle, HiArrowLeft } from "react-icons/hi2";

export default function InvalidInvitePage() {
  const router = useRouter();
  const { msg } = router.query;

  const errorMessage = (msg as string) || "Enlace de invitación inválido o expirado";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <HiExclamationTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">Invitación inválida</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <HiExclamationTriangle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>

          <div className="text-sm text-gray-600 space-y-2">
            <p>Esto podría suceder si:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>El enlace de invitación ha expirado</li>
              <li>La invitación ya ha sido utilizada</li>
              <li>La invitación ha sido cancelada</li>
              <li>El enlace está mal formado o incompleto</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => router.push("/")}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Ir al inicio
            </Button>

            <Button onClick={() => router.push("/login")} variant="outline" className="w-full">
              <HiArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio de sesión
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              ¿Necesitas ayuda? Contacta a tu administrador o a la persona que te envió la invitación.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
