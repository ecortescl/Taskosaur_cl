import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import Image from "next/image";

export function LoginContent() {
  const { resolvedTheme } = useTheme();
  return (
    <div className="login-hero-container">
      {/* Main Content */}
      <div className="login-hero-content">
        {/* Brand Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="login-brand-header"
        >
          <div className="">
            <div className="flex items-center">

              <h1 className="login-brand-title">QUIEBRE.CL</h1>
            </div>
          </div>

          <h2 className="login-hero-heading">
            Agencia de Marketing
            <br />
            <span className="login-hero-heading-gradient">Gestor de Tareas</span>
          </h2>

          <p className="login-hero-description">
            Software de gestion de tareas para equipo de trabajo de la agencia de marketing
          </p>
        </motion.div>
      </div>
    </div>
  );
}
