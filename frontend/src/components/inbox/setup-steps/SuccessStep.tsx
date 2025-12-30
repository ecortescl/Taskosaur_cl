import React from "react";
import { HiCheckCircle } from "react-icons/hi2";
import ActionButton from "@/components/common/ActionButton";

interface SuccessStepProps {
  onFinish: () => void;
}

export default function SuccessStep({ onFinish }: SuccessStepProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <HiCheckCircle className="w-12 h-12 text-[var(--status-active-bg)] mb-4" aria-hidden="true" />

      <h3 className="text-base font-semibold text-[var(--foreground)] mb-1">
        Integración de Email Activa
      </h3>
      <p className="text-xs text-[var(--muted-foreground)] mb-4">
        Tu cuenta de email está lista para usar.
      </p>

      <ActionButton onClick={onFinish} secondary>
        Finalizar Configuración
      </ActionButton>
    </div>
  );
}
