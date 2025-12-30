import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HiExclamation } from "react-icons/hi";

interface ProjectDetailErrorProps {
  error: string;
  workspaceSlug: string;
  projectSlug: string;
}

export const ProjectDetailError: React.FC<ProjectDetailErrorProps> = ({
  error,
  workspaceSlug,
  projectSlug,
}) => {
  return (
    <div className="projects-error-container">
      <div className="projects-error-wrapper">
        <Card className="projects-error-card projects-error-card-dark">
          <CardHeader className="projects-error-header">
            <HiExclamation className="projects-error-icon" />
            <div className="projects-error-content">
              <CardTitle className="projects-error-title projects-error-title-dark">
                {error === "Project not found" ? "Proyecto No Encontrado" : "Error al Cargar Proyecto"}
              </CardTitle>
              <CardDescription className="projects-error-description projects-error-description-dark">
                {error === "Project not found"
                  ? `El proyecto "${projectSlug}" no existe en el espacio de trabajo "${workspaceSlug}".`
                  : error || "Ocurrió un error inesperado al cargar el proyecto."}
              </CardDescription>
              <Link
                href={`/${workspaceSlug}`}
                className="projects-error-link projects-error-link-dark"
              >
                Volver al Espacio de Trabajo
              </Link>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};
