"use client";
import { useAuth } from "@/contexts/auth-context";
import { HiCog6Tooth, HiSparkles } from "react-icons/hi2";
import ProfileSection from "@/components/settings/ProfileSection";
import ResetPasswordSection from "@/components/settings/ResetPasswordSection";
import DangerZoneSection from "@/components/settings/DangerZoneSection";
import AISettingsModal from "@/components/settings/AISettings";
import { useState } from "react";
import ActionButton from "@/components/common/ActionButton";
import { PageHeader } from "@/components/common/PageHeader";

export default function ProfilePage() {
  const { getCurrentUser } = useAuth();
  const currentUser = getCurrentUser();
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  if (!currentUser) {
    return (
      <div className="dashboard-container">
        <div className="space-y-6">
          <div className="bg-[var(--card)] rounded-[var(--card-radius)] border border-[var(--border)] p-8 text-center">
            <div className="w-10 h-10 rounded-md bg-[var(--primary)]/10 flex items-center justify-center mx-auto mb-4">
              <HiCog6Tooth className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
              Autenticación Requerida
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              Por favor, inicie sesión para acceder a la configuración de su cuenta.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div>
        {/* Header */}
        <PageHeader
          icon={<HiCog6Tooth className="w-5 h-5 text-[var(--primary)]" />}
          title="Configuración de Perfil"
          description="Gestione la configuración de su perfil, preferencias y opciones de seguridad para personalizar su experiencia."
          actions={
            <ActionButton
              secondary
              leftIcon={<HiSparkles />}
              onClick={() => setIsAIModalOpen(true)}
            >
              Configuración de IA
            </ActionButton>
          }
        />

        {/* Settings Sections */}
        <div className="space-y-4">
          <ProfileSection />
          <ResetPasswordSection />
          <DangerZoneSection />
        </div>

        {/* AI Settings Modal */}
        <AISettingsModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
      </div>
    </div>
  );
}
