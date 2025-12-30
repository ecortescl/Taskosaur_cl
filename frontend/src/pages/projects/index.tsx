import ProjectsContent from "@/components/projects/ProjectsContent";
import { TokenManager } from "@/lib/api";

export default function ProjectsPage() {
  const orgId = TokenManager.getCurrentOrgId();
  return (
    <ProjectsContent
      contextType="organization"
      contextId={orgId}
      title="Tus Proyectos"
      description="Administra y organiza tus proyectos dentro de esta organización."
      emptyStateTitle="No se encontraron proyectos"
      emptyStateDescription="Crea tu primer proyecto para comenzar a organizar tus tareas y colaborar con tu equipo."
      enablePagination={true}
      generateProjectLink={(project) => `/${project.workspace.slug}/${project.slug}`}
    />
  );
}
