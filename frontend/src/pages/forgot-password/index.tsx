import { useAuth } from "@/contexts/auth-context";
import AuthRedirect from "@/components/auth/AuthRedirect";
import { useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Loader2, Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { LoginContent } from "@/components/login/LoginContent";
import { ModeToggle } from "@/components/header/ModeToggle";
import { ForgotPasswordData } from "@/types";

function ForgotPasswordForm() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const requestData: ForgotPasswordData = {
        email: email.trim(),
      };

      const response = await forgotPassword(requestData);

      if (response.success) {
        setIsSuccess(true);
      } else {
        setError(response.message || "No se pudo enviar el correo de restablecimiento. Por favor, inténtalo de nuevo.");
      }
    } catch (err: any) {
      setError(err.message || "No se pudo enviar el correo de restablecimiento. Por favor, inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
      if (error) setError("");
    },
    [error]
  );

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="login-form-container"
      >
        {/* Success Header */}
        <div className="login-form-header">
          <div className="login-form-header-content">
            <h1 className="login-form-title">Revisa tu correo</h1>
            <p className="login-form-subtitle">Hemos enviado un enlace para restablecer tu contraseña a {email}</p>
          </div>
        </div>

        {/* Success Alert */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
        >
          <Alert className="login-error-alert border-green-200 bg-green-50 text-green-800 dark:border-green-800/30 dark:bg-green-900/20">
            <CheckCircle2 className="login-field-icon text-green-600" />
            <AlertDescription className="font-medium">
              <span className="login-error-title text-green-800 dark:text-green-200">
                Correo enviado con éxito
              </span>
              <span className="login-error-message text-green-700 dark:text-green-300">
                Por favor, revisa tu bandeja de entrada y haz clic en el enlace de restablecimiento.
              </span>
            </AlertDescription>
          </Alert>
        </motion.div>

        {/* Back to Login */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Link href="/login">
            <Button variant="outline" className="login-signup-button">
              <ArrowLeft className="login-button-arrow" />
              Volver al inicio de sesión
            </Button>
          </Link>
        </motion.div>

        {/* Try Different Email */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button
            variant="outline"
            onClick={() => {
              setIsSuccess(false);
              setEmail("");
              setError("");
            }}
            className="login-signup-button"
          >
            Probar con otro correo
            <ArrowRight className="login-button-arrow" />
          </Button>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="login-footer"
        >
          <p className="login-footer-text">
            ¿No recibiste el correo? Revisa tu carpeta de spam o{" "}
            <Link href="/support" className="login-footer-link">
              contacta al soporte técnico
            </Link>
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="login-form-container"
    >
      {/* Header */}
      <div className="login-form-header">
        <div className="login-form-header-content">
          <h1 className="login-form-title">Restablece tu contraseña</h1>
          <p className="login-form-subtitle">
            Ingresa tu dirección de correo electrónico y te enviaremos un enlace de restablecimiento
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
        >
          <Alert variant="destructive" className="login-error-alert">
            <AlertCircle className="login-field-icon" />
            <AlertDescription className="font-medium">
              <span className="login-error-title">Error al restablecer</span>
              <span className="login-error-message">{error}</span>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="login-form">
        {/* Email Field */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="login-field-container"
        >
          <Label htmlFor="email" className="login-field-label">
            <Mail className="login-field-icon" />
            <span>Correo electrónico</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={handleChange}
            placeholder="Ingresa tu correo electrónico"
            className="login-input"
          />
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button
            type="submit"
            disabled={isLoading || !email.trim()}
            className="login-submit-button"
          >
            {isLoading ? (
              <>
                <Loader2 className="login-loading-spinner" />
                Enviando enlace...
              </>
            ) : (
              <>
                Enviar enlace de restablecimiento
                <ArrowRight className="login-button-arrow" />
              </>
            )}
          </Button>
        </motion.div>
      </form>

      {/* Divider */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="login-divider-container"
      >
        <div className="login-divider-line">
          <div className="login-divider-border" />
        </div>
        <div className="login-divider-text-container">
          <span className="login-divider-text">¿Recuerdas tu contraseña?</span>
        </div>
      </motion.div>

      {/* Back to Login Link */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Link href="/login">
          <Button variant="outline" className="login-signup-button">
            <ArrowLeft className="login-button-arrow" />
            Volver al inicio de sesión
          </Button>
        </Link>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="login-footer"
      >
        <p className="login-footer-text">
          ¿Necesitas ayuda?{" "}
          <Link href="/support" className="login-footer-link">
            Contacta a nuestro equipo de soporte
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
}

export default function ForgotPasswordPage() {
  const { checkOrganizationAndRedirect } = useAuth();

  const redirectTo = async () => {
    return await checkOrganizationAndRedirect();
  };

  return (
    <AuthRedirect redirectTo={redirectTo}>
      <div className="min-h-screen bg-[var(--background)]">
        <div className="min-h-screen flex bg-[var(--background)]">
          <div className="lg:w-1/2 relative">
            <LoginContent />
          </div>
          <div className="login-form-mode-toggle">
            <ModeToggle />
          </div>
          <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
            <div className="w-full max-w-md">
              <ForgotPasswordForm />
            </div>
          </div>
        </div>
      </div>
    </AuthRedirect>
  );
}
