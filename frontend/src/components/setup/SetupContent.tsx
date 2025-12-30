import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import Image from "next/image";
import { Shield } from "lucide-react";

export function SetupContent() {
  const { resolvedTheme } = useTheme();

  return (
    <div className="setup-hero-container">
      {/* Main Content */}
      <div className="setup-hero-content">
        {/* Brand Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="setup-brand-header"
        >
          <div className="">
            <div className="flex items-center">
              <Image
                src="https://landing-quiebre-test.vercel.app/Logo_quiebre_calado.svg"
                alt="QUIEBRE.CL Logo"
                width={50}
                height={50}
                className="size-6 lg:size-10"
              />
              <h1 className="setup-brand-title">QUIEBRE.CL</h1>
            </div>
          </div>

          <h2 className="setup-hero-heading">
            Comienza tu
            <br />
            <span className="setup-hero-heading-gradient">viaje de productividad</span>
          </h2>

          <p className="setup-hero-description">
            Configura tu cuenta de súper administrador para desbloquear todo el poder de la
            plataforma de gestión de proyectos impulsada por IA de QUIEBRE.CL para toda tu organización.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
