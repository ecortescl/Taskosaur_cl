import { useRouter } from "next/router";
import ProjectsContent from "@/components/projects/ProjectsContent";

// Only allow safe slugs - letters, numbers, dashes, underscores
const isSafeSlug = (slug?: string) => typeof slug === "string" && /^[a-zA-Z0-9_-]+$/.test(slug);

export default function WorkspaceProjectsPage() {
  const router = useRouter();
  const { workspaceSlug } = router.query;

  return (
    <ProjectsContent
      contextType="workspace"
      contextId={workspaceSlug as string}
      workspaceSlug={workspaceSlug as string}
      title="Proyectos"
      description="Administra y organiza tus proyectos dentro de este espacio de trabajo."
      emptyStateTitle="No se encontraron proyectos"
      emptyStateDescription="Crea tu primer proyecto para comenzar a organizar tus tareas y colaborar con tu equipo."
      enablePagination={false}
      generateProjectLink={(project, ws) =>
        isSafeSlug(ws) && isSafeSlug(project?.slug)
          ? `/${ws}/${project.slug}`
          : undefined
      }
    />
  );
}
