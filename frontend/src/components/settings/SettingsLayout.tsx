import React, { useState, useEffect } from "react";

interface Organization {
  id: string;
  name: string;
  plan?: string;
}

interface SettingsLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function SettingsLayout({
  children,
  activeSection,
  onSectionChange,
}: SettingsLayoutProps) {
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);

  useEffect(() => {
    const getOrganizationData = () => {
      try {
        const orgId = localStorage.getItem("currentOrganizationId");
        const currentOrg = localStorage.getItem("currentOrganizationId");

        if (currentOrg) {
          try {
            const parsedOrg = JSON.parse(currentOrg);
            setCurrentOrganization({
              id: parsedOrg.id,
              name: parsedOrg.name,
              plan: parsedOrg.plan || "Gratis",
            });
          } catch {
            if (orgId) {
              setCurrentOrganization({
                id: orgId,
                name: "Organización Seleccionada",
                plan: "Gratis",
              });
            }
          }
        } else if (orgId) {
          setCurrentOrganization({
            id: orgId,
            name: "Organización Seleccionada",
            plan: "Gratis",
          });
        }
      } catch (error) {
        console.error("Error getting organization from localStorage:", error);
      }
    };

    getOrganizationData();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "currentOrganizationId" || e.key === "currentOrganization") {
        getOrganizationData();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const settingsSections = [
    {
      id: "profile",
      title: "Perfil",
      icon: "👤",
      description: "Información personal y preferencias",
    },
    {
      id: "account",
      title: "Cuenta",
      icon: "⚙️",
      description: "Configuración de la cuenta y seguridad",
    },
    {
      id: "notifications",
      title: "Notificaciones",
      icon: "🔔",
      description: "Preferencias de notificaciones por email y push",
    },
    {
      id: "ai-chat",
      title: "Chat de IA",
      icon: "🤖",
      description: "Configuración y ajustes del asistente de IA",
    },
    {
      id: "appearance",
      title: "Apariencia",
      icon: "🎨",
      description: "Preferencias de tema y visualización",
    },
    {
      id: "organization",
      title: "Organización",
      icon: "🏢",
      description: "Configuración de la organización y miembros",
    },
    {
      id: "projects",
      title: "Proyectos",
      icon: "📁",
      description: "Configuración de proyectos y valores predeterminados",
    },
    {
      id: "integrations",
      title: "Integraciones",
      icon: "🔌",
      description: "Integraciones de terceros y APIs",
    },
    {
      id: "security",
      title: "Seguridad",
      icon: "🔒",
      description: "Ajustes de seguridad y privacidad",
    },
    {
      id: "billing",
      title: "Facturación",
      icon: "💳",
      description: "Información de suscripción y facturación",
    },
    {
      id: "advanced",
      title: "Avanzado",
      icon: "⚡",
      description: "Opciones de configuración avanzada",
    },
  ];

  return (
    <div className="settings-layout-container settings-layout-container-dark">
      <div className="settings-layout-wrapper">
        <div className="settings-layout-header">
          <h1 className="settings-layout-title settings-layout-title-dark">Configuración</h1>
          <p className="settings-layout-subtitle settings-layout-subtitle-dark">
            Administre su cuenta, organización y preferencias
          </p>
        </div>

        <div className="settings-layout-grid">
          {/* Settings Navigation */}
          <div className="settings-nav">
            <nav className="settings-nav-list">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => onSectionChange(section.id)}
                  className={`settings-nav-item ${activeSection === section.id
                    ? "settings-nav-item-active settings-nav-item-active-dark"
                    : "settings-nav-item-inactive settings-nav-item-inactive-dark"
                    }`}
                >
                  <span className="settings-nav-item-icon">{section.icon}</span>
                  <div className="settings-nav-item-content">
                    <div className="settings-nav-item-title">{section.title}</div>
                    <div className="settings-nav-item-description settings-nav-item-description-dark">
                      {section.description}
                    </div>
                  </div>
                </button>
              ))}
            </nav>

            {/* Organization Context */}
            {currentOrganization && (
              <div className="settings-org-context settings-org-context-dark">
                <h3 className="settings-org-context-title settings-org-context-title-dark">
                  Organización Actual
                </h3>
                <div className="settings-org-context-content">
                  <div className="settings-org-context-avatar settings-org-context-avatar-dark">
                    <span className="settings-org-context-avatar-text settings-org-context-avatar-text-dark">
                      {currentOrganization.name.charAt(0)}
                    </span>
                  </div>
                  <div className="settings-org-context-info">
                    <div className="settings-org-context-name settings-org-context-name-dark">
                      {currentOrganization.name}
                    </div>
                    <div className="settings-org-context-plan settings-org-context-plan-dark">
                      Plan {currentOrganization.plan}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Settings Content */}
          <div className="settings-content">
            <div className="settings-content-card settings-content-card-dark">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
