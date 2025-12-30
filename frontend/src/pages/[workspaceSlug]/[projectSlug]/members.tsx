import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import ActionButton from "@/components/common/ActionButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import UserAvatar from "@/components/ui/avatars/UserAvatar";
import { invitationApi } from "@/utils/api/invitationsApi";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HiMagnifyingGlass,
  HiUsers,
  HiExclamationTriangle,
  HiCog,
  HiFolder,
  HiXMark,
} from "react-icons/hi2";
import { useWorkspaceContext } from "@/contexts/workspace-context";
import { useProjectContext } from "@/contexts/project-context";
import { useAuth } from "@/contexts/auth-context";
import { useGlobalFetchPrevention } from "@/hooks/useGlobalFetchPrevention";

import { Member, Project, ProjectMember, Workspace } from "@/types";
import { Button } from "@/components/ui";
import { X } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { ProjectInviteMemberModal } from "@/components/projects/ProjectInviteMemberModal";
import Tooltip from "@/components/common/ToolTip";
import { roles } from "@/utils/data/projectData";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import PendingInvitations, { PendingInvitationsRef } from "@/components/common/PendingInvitations";
import WorkspaceMembersSkeleton from "@/components/skeletons/WorkspaceMembersSkeleton";
import ErrorState from "@/components/common/ErrorState";
import Pagination from "@/components/common/Pagination";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "organizations-status-badge-active";
    case "PENDING":
      return "organizations-status-badge-pending";
    case "INACTIVE":
      return "organizations-status-badge-inactive";
    case "SUSPENDED":
      return "organizations-status-badge-suspended";
    default:
      return "organizations-status-badge-inactive";
  }
};

const getRoleBadgeClass = (role: string) => {
  switch (role) {
    case "OWNER":
      return "organizations-role-badge-super-admin";
    case "MANAGER":
      return "organizations-role-badge-manager";
    case "DEVELOPER":
      return "organizations-role-badge-member";
    case "VIEWER":
      return "organizations-role-badge-viewer";
    default:
      return "organizations-role-badge-viewer";
  }
};

const EmptyState = ({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) => (
  <div className="text-center py-8 flex flex-col items-center justify-center">
    <Icon className="w-12 h-12 mx-auto text-[var(--muted-foreground)] mb-4" />
    <p className="text-sm font-medium text-[var(--foreground)] mb-2">{title}</p>
    <p className="text-xs text-[var(--muted-foreground)]">{description}</p>
  </div>
);

function ProjectMembersContent() {
  const params = useParams();
  const router = useRouter();
  const workspaceSlug = params?.workspaceSlug as string;
  const projectSlug = params?.projectSlug as string;

  const { getWorkspaceBySlug } = useWorkspaceContext();
  const {
    getProjectsByWorkspace,
    updateProjectMemberRole,
    removeProjectMember,
    getProjectMembersPagination,
  } = useProjectContext();
  const { isAuthenticated, getCurrentUser, getUserAccess } = useAuth();

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingMember, setUpdatingMember] = useState<string | null>(null);
  const [removingMember, setRemovingMember] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 1000);
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef<string>("");
  const currentRouteRef = useRef<string>("");
  const isInitializedRef = useRef(false);
  const fetchPrevention = useGlobalFetchPrevention();
  const [memberToRemove, setMemberToRemove] = useState<any>(null);
  const pendingInvitationsRef = useRef<PendingInvitationsRef>(null);
  const [userAccess, setUserAccess] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMembers, setTotalMembers] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  useEffect(() => {
    if (!workspace?.id) return;
    getUserAccess({ name: "workspace", id: workspace?.id })
      .then((data) => {
        setHasAccess(data?.canChange || data?.role === "OWNER" || data?.role === "MANAGER");
      })
      .catch((error) => {
        console.error("Error fetching user access:", error);
      });
  }, [workspace]);

  useEffect(() => {
    if (!project?.id) return;
    getUserAccess({ name: "project", id: project?.id })
      .then((data) => {
        setUserAccess(data);
        setHasAccess(data?.canChange || data?.role === "OWNER" || data?.role === "MANAGER");
      })
      .catch((error) => {
        console.error("Error fetching user access:", error);
      });
  }, [project]);

  const getRoleLabel = (role: string) => {
    const roleConfig = roles.find((r) => r.name === role);
    if (!roleConfig) return role;
    switch (roleConfig.name) {
      case "OWNER":
        return "Dueño";
      case "MANAGER":
        return "Gestor";
      case "DEVELOPER":
        return "Desarrollador";
      case "VIEWER":
        return "Espectador";
      default:
        return roleConfig.name;
    }
  };

  const getCurrentUserId = () => getCurrentUser()?.id;
  const isCurrentUserOwner = project?.createdBy === getCurrentUserId();

  // Check if current user can manage members
  const canManageMembers = () => {
    return userAccess?.role === "OWNER" || userAccess?.role === "MANAGER" || hasAccess;
  };

  // Check if a member's role can be updated
  const canUpdateMemberRole = (member: Member) => {
    const currentUserId = getCurrentUserId();
    if (isCurrentUserOwner) {
      return false;
    }
    // Current user cannot modify their own role
    if (member.userId === currentUserId) {
      return false;
    }

    // Only owner can modify other owners
    if (member.role === "OWNER" && !isCurrentUserOwner) {
      return false;
    }

    return canManageMembers();
  };

  // Check if a member can be removed
  const canRemoveMember = (member: Member) => {
    const currentUserId = getCurrentUserId();
    if (isCurrentUserOwner) {
      return false;
    }
    // User can always remove themselves (leave workspace)
    if (member.userId === currentUserId) {
      return true;
    }

    // Owner cannot be removed by others
    if (member.role === "OWNER" && !isCurrentUserOwner) {
      return false;
    }

    // Manager cannot remove other managers
    // if (userAccess?.role === "MANAGER" && member.role === "MANAGER") {
    //   return false;
    // }

    return canManageMembers();
  };

  // Get available roles for a member
  const getAvailableRolesForMember = () => {
    const availableRoles = roles.filter((role) => {
      // Manager cannot assign Owner role
      if (userAccess?.role === "MANAGER" && role.name === "OWNER") {
        return false;
      }
      return true;
    });

    return availableRoles;
  };

  const fetchMembers = useCallback(
    async (searchValue = "", page = 1) => {
      const pageKey = `${workspaceSlug}/${projectSlug}/members`;
      const requestId = `${pageKey}-${Date.now()}-${Math.random()}`;

      if (!isMountedRef.current) {
        return;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      requestIdRef.current = requestId;
      currentRouteRef.current = pageKey;

      if (!workspaceSlug || !projectSlug || !isAuthenticated()) {
        setError("Autenticación requerida");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        fetchPrevention.markFetchStart("project-members");

        if (requestIdRef.current !== requestId || !isMountedRef.current) {
          return;
        }
        const workspaceData = workspace || (await getWorkspaceBySlug(workspaceSlug));
        if (!workspaceData) {
          setError("Espacio de trabajo no encontrado");
          setLoading(false);
          return;
        }
        setWorkspace(workspaceData);
        const projectsData = await getProjectsByWorkspace(workspaceData.id);
        const foundProject = projectsData?.find((p: any) => p.slug === projectSlug);
        if (!foundProject) {
          setError("Proyecto no encontrado");
          setLoading(false);
          return;
        }
        setProject({
          ...foundProject,
          description: foundProject.description || "",
        });

        if (requestIdRef.current !== requestId || !isMountedRef.current) {
          return;
        }

        try {
          const membersData = await getProjectMembersPagination(
            foundProject.id,
            searchValue,
            page,
            pageSize
          );
          if (requestIdRef.current !== requestId || !isMountedRef.current) {
            return;
          }
          setTotalMembers(membersData.total);
          if (Array.isArray(membersData.data) && membersData.data.length > 0) {
            const processedMembers = membersData.data.map((member: ProjectMember) => ({
              id: member.id,
              email: member.user?.email || "",
              firstName: member.user?.firstName || "Desconocido",
              lastName: member.user?.lastName || "Usuario",
              username: member.user?.username || "",
              role: member.role || "DEVELOPER",
              status: member.user?.status || "ACTIVE",
              avatarUrl: member.user?.avatar || "",
              joinedAt: member.joinedAt || member.createdAt || new Date().toISOString(),
              lastActive: member.user?.lastLoginAt || "",
              userId: member?.userId,
              projectId: member?.projectId,
            }));
            setMembers(processedMembers);
            fetchPrevention.markFetchComplete("project-members", processedMembers);
          } else {
            setMembers([]);
            fetchPrevention.markFetchComplete("project-members", []);
          }
        } catch (membersError) {
          console.error("Failed to fetch members:", membersError);
          setError("Error al cargar los miembros del proyecto");
          setMembers([]);
          fetchPrevention.markFetchComplete("project-members", []);
        }

        isInitializedRef.current = true;
      } catch (err) {
        if (requestIdRef.current === requestId && isMountedRef.current) {
          setError(err?.message ? err.message : "Error al cargar los datos");
          setMembers([]);
          isInitializedRef.current = false;
        }
      } finally {
        if (requestIdRef.current === requestId && isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [workspaceSlug, workspace]
  );

  useEffect(() => {
    const initializeData = async () => {
      if (!isInitializedRef.current) {
        await fetchMembers();
      }
    };

    const pageKey = `${workspaceSlug}/${projectSlug}/members`;
    if (currentRouteRef.current !== pageKey) {
      isInitializedRef.current = false;
      setWorkspace(null);
      setProject(null);
      setMembers([]);
      setError(null);
    }

    const timeoutId = setTimeout(() => {
      initializeData();
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [workspaceSlug, projectSlug]);

  useEffect(() => {
    fetchMembers(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      isInitializedRef.current = false;
      currentRouteRef.current = "";
      requestIdRef.current = "";

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  const activeMembers = members.filter((member) => member.status?.toLowerCase() !== "pending");

  const refreshMembers = async () => {
    if (!project) return;

    try {
      const membersData = await getProjectMembersPagination(
        project.id,
        searchTerm,
        currentPage,
        pageSize
      );

      if (Array.isArray(membersData.data) && membersData.data.length > 0) {
        const processedMembers = membersData.data.map((member: ProjectMember) => ({
          id: member.id,
          email: member.user?.email || "",
          firstName: member.user?.firstName || "Desconocido",
          lastName: member.user?.lastName || "Usuario",
          username: member.user?.username || "",
          role: member.role || "DEVELOPER",
          status: member.user?.status || "ACTIVE",
          avatarUrl: member.user?.avatar,
          joinedAt: member.joinedAt || member.createdAt || new Date().toISOString(),
          lastActive: member.user?.lastLoginAt,
          userId: member?.userId,
          projectId: member?.projectId,
        }));
        setMembers(processedMembers);
      } else {
        setMembers([]);
      }
      setError(null);
    } catch (err) {
      setError(err?.message ? err.message : "Error al cargar los miembros");
      setMembers([]);
    }
  };

  const retryFetch = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    isInitializedRef.current = false;
    currentRouteRef.current = "";
    requestIdRef.current = "";
    setMembers([]);
    setWorkspace(null);
    setProject(null);
    setError(null);
    setLoading(true);
  };

  function updateLocalStorageUser(newRole: string) {
    const tampUser = localStorage.getItem("user");
    const updateRole = JSON.parse(tampUser);
    const finalUser = {
      ...updateRole,
      role: newRole,
    };
    localStorage.setItem("user", JSON.stringify(finalUser));
  }

  const handleRoleUpdate = async (memberId: string, newRole: string) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      toast.error("Usuario no autenticado");
      return;
    }

    try {
      setUpdatingMember(memberId);
      await updateProjectMemberRole(memberId, currentUser.id, newRole);
      updateLocalStorageUser(newRole);
      await refreshMembers();
      toast.success("Rol del miembro actualizado con éxito");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar el rol";
      toast.error(errorMessage);
    } finally {
      setUpdatingMember(null);
    }
  };

  const handleRemoveMember = async (member: ProjectMember) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      toast.error("Usuario no autenticado");
      return;
    }

    try {
      setRemovingMember(member?.id);
      await removeProjectMember(member?.id, currentUser.id);
      await refreshMembers();
      setMemberToRemove(null);

      // If user removed themselves, redirect to project page
      if (member.userId === currentUser.id) {
        toast.success("Has salido del proyecto");
        router.push(`/workspaces/${workspaceSlug}/projects/${projectSlug}`);
        return;
      }

      toast.success("Miembro eliminado con éxito");
    } catch (err) {
      const errorMessage = err.message ? err.message : "Error al eliminar el miembro";
      toast.error(errorMessage);
      setMemberToRemove(null);
    } finally {
      setRemovingMember(null);
    }
  };

  const handleInvite = async (email: string, role: string) => {
    if (!project) {
      toast.error("Proyecto no encontrado");
      throw new Error("Proyecto no encontrado");
    }

    const validation = invitationApi.validateInvitationData({
      inviteeEmail: email,
      projectId: project.id,
      role: role,
    });

    if (!validation.isValid) {
      validation.errors.forEach((error) => toast.error(error));
      throw new Error("Error de validación");
    }

    try {
      await invitationApi.createInvitation({
        inviteeEmail: email,
        projectId: project.id,
        role: role,
      });

      toast.success(`Invitación enviada a ${email}`);

      if (pendingInvitationsRef.current) {
        await pendingInvitationsRef.current.refreshInvitations();
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Failed to send invitation";
      toast.error(errorMessage);
      console.error("Invite member error:", error);
      throw error;
    }
  };

  const handleInviteWithLoading = async (email: string, role: string) => {
    setInviteLoading(true);
    try {
      await handleInvite(email, role);
    } finally {
      setInviteLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-419", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return <WorkspaceMembersSkeleton />;
  }

  if (error && !members.length) {
    return <ErrorState error={error} onRetry={retryFetch} />;
  }

  return (
    <div className="dashboard-container space-y-6 pt-0" data-automation-id="invite-member-btn">
      <PageHeader
        title={`Miembros de ${project?.name || "Proyecto"}`}
        description={
          workspace?.name && project?.name
            ? `Gestiona los miembros de ${project.name} en el espacio de trabajo ${workspace.name}`
            : "Gestiona los miembros del proyecto y sus permisos"
        }
        actions={
          hasAccess && (
            <ActionButton
              primary
              onClick={() => setShowInviteModal(true)}
              showPlusIcon={true}
              disabled={inviteLoading}
            >
              {inviteLoading ? (
                <div className="w-4 h-4 border-2 border-[var(--primary-foreground)] border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : null}
              Invitar Miembro
            </ActionButton>
          )
        }
      />

      {/* Main Content - Single Column Layout like MembersManager */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Members List - Takes most space */}
        <div className="lg:col-span-2">
          <Card className="bg-[var(--card)] rounded-[var(--card-radius)] border-none shadow-sm">
            <CardHeader className="pb-2 px-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-md font-semibold text-[var(--foreground)] flex items-center gap-2">
                  <HiUsers className="w-5 h-5 text-[var(--muted-foreground)]" />
                  Miembros del Equipo ({activeMembers.length})
                </CardTitle>
                <div className="relative w-full sm:w-auto">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HiMagnifyingGlass className="w-4 text-[var(--muted-foreground)]" />
                  </div>
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-9 w-full sm:w-64 border-input bg-background text-[var(--foreground)]"
                    placeholder="Buscar miembros..."
                  />

                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                    >
                      <HiXMark size={16} />
                    </button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* Table Header - Desktop Only */}
              <div className="hidden lg:block px-4 py-3 bg-[var(--muted)]/30 border-b border-[var(--border)]">
                <div className="grid grid-cols-12 gap-3 text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">
                  <div className="col-span-4">Miembro</div>
                  <div className="col-span-2">Estado</div>
                  <div className="col-span-2">Unido</div>
                  <div className="col-span-2">Rol</div>
                  <div className="col-span-2">Acción</div>
                </div>
              </div>

              {/* Table Content */}
              {activeMembers.length === 0 && !loading ? (
                <EmptyState
                  icon={HiUsers}
                  title={
                    searchTerm
                      ? "No se encontraron miembros que coincidan con tu búsqueda"
                      : "No se encontraron miembros en este proyecto"
                  }
                  description={
                    searchTerm
                      ? "Intenta ajustar tus términos de búsqueda"
                      : "Comienza invitando a miembros del equipo para colaborar en este proyecto"
                  }
                />
              ) : (
                <div className="divide-y divide-[var(--border)] lg:divide-y-0">
                  {activeMembers.map((member) => {
                    const currentUserId = getCurrentUserId();
                    const isCurrentUser = member.userId === currentUserId;
                    const canEditRole = canUpdateMemberRole(member);
                    const canRemove = canRemoveMember(member);
                    const availableRoles = getAvailableRolesForMember();
                    const isOwner = member.role === "OWNER";

                    return (
                      <div key={member.id}>
                        <div className="block lg:hidden p-4 hover:bg-[var(--accent)]/30 transition-colors">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="relative">
                                  <UserAvatar
                                    user={{
                                      firstName: member.firstName,
                                      lastName: member.lastName,
                                      avatar: member.avatarUrl,
                                    }}
                                    size="sm"
                                  />
                                  {/* Active Status Indicator - Green Dot */}
                                  {(member.status || "ACTIVE") === "ACTIVE" && (
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[var(--card)] rounded-full"></div>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-medium text-[var(--foreground)] truncate">
                                    {member.firstName} {member.lastName}
                                  </div>
                                  <div className="text-xs text-[var(--muted-foreground)] truncate">
                                    {member.email}
                                  </div>
                                </div>
                              </div>

                              {/* Action Button */}
                              {canRemove && (
                                <Tooltip
                                  content={
                                    isCurrentUser
                                      ? "Salir del Proyecto"
                                      : isOwner
                                        ? "El dueño del proyecto no puede ser eliminado"
                                        : userAccess?.role === "MANAGER" &&
                                          member.role === "MANAGER"
                                          ? "No se puede eliminar a otros gestores"
                                          : "Eliminar Miembro"
                                  }
                                  position="top"
                                  color="danger"
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setMemberToRemove(member)}
                                    disabled={removingMember === member.id}
                                    className="h-9 min-w-[36px] border-none bg-[var(--destructive)]/10 hover:bg-[var(--destructive)]/20 text-[var(--destructive)] transition-all duration-200 flex-shrink-0"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </Tooltip>
                              )}
                            </div>

                            {/* Row 2: Role */}
                            <div className="flex items-center gap-2">
                              {canEditRole ? (
                                <Select
                                  value={member.role}
                                  onValueChange={(value) => handleRoleUpdate(member.id, value)}
                                  disabled={updatingMember === member.id}
                                >
                                  <SelectTrigger className="h-8 text-xs border-[var(--border)] bg-background text-[var(--foreground)] w-auto min-w-[100px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="border-none bg-[var(--card)]">
                                    {availableRoles.map((role) => (
                                      <SelectItem
                                        key={role.id}
                                        value={role.name}
                                        className="hover:bg-[var(--hover-bg)]"
                                      >
                                        {role.name.charAt(0) + role.name.slice(1).toLowerCase()}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Badge
                                  className={`text-[10px] px-2 py-0.5 rounded-md border-none h-6 ${getRoleBadgeClass(
                                    member.role
                                  )}`}
                                >
                                  {member.role === "OWNER"
                                    ? "Dueño"
                                    : member.role === "MANAGER"
                                      ? "Gestor"
                                      : member.role === "DEVELOPER"
                                        ? "Desarrollador"
                                        : member.role === "VIEWER"
                                          ? "Espectador"
                                          : member.role}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Desktop Layout (>= lg) - EXACT ORIGINAL */}
                        <div className="hidden lg:block px-4 py-3 hover:bg-[var(--accent)]/30 transition-colors">
                          <div className="grid grid-cols-12 gap-3 items-center">
                            {/* Member Info */}
                            <div className="col-span-4">
                              <div className="flex items-center gap-3">
                                <UserAvatar
                                  user={{
                                    firstName: member.firstName,
                                    lastName: member.lastName,
                                    avatar: member.avatarUrl,
                                  }}
                                  size="sm"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-medium text-[var(--foreground)] truncate">
                                    {member.firstName} {member.lastName}
                                  </div>
                                  <div className="text-xs text-[var(--muted-foreground)] truncate">
                                    {member.email}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Status */}
                            <div className="col-span-2">
                              <Badge
                                variant="outline"
                                className={`text-xs bg-transparent px-2 py-1 rounded-md border-none ${getStatusBadgeClass(
                                  member.status || "ACTIVE"
                                )}`}
                              >
                                {member.status === "ACTIVE"
                                  ? "Activo"
                                  : member.status === "PENDING"
                                    ? "Pendiente"
                                    : member.status === "INACTIVE"
                                      ? "Inactivo"
                                      : member.status === "SUSPENDED"
                                        ? "Suspendido"
                                        : member.status || "Activo"}
                              </Badge>
                            </div>

                            {/* Joined Date */}
                            <div className="col-span-2">
                              <span className="text-sm text-[var(--muted-foreground)]">
                                {formatDate(
                                  typeof member.joinedAt === "string"
                                    ? member.joinedAt
                                    : (member.joinedAt as Date)?.toISOString()
                                )}
                              </span>
                            </div>

                            {/* Role */}
                            <div className="col-span-2">
                              {canEditRole ? (
                                <Select
                                  value={member.role}
                                  onValueChange={(value) => handleRoleUpdate(member.id, value)}
                                  disabled={updatingMember === member.id}
                                >
                                  <SelectTrigger className="h-7 text-xs border-none shadow-none bg-background text-[var(--foreground)]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="border-none bg-[var(--card)]">
                                    {availableRoles.map((role) => (
                                      <SelectItem
                                        key={role.id}
                                        value={role.name}
                                        className="hover:bg-[var(--hover-bg)]"
                                      >
                                        {role.name === "OWNER"
                                          ? "Dueño"
                                          : role.name === "MANAGER"
                                            ? "Gestor"
                                            : role.name === "DEVELOPER"
                                              ? "Desarrollador"
                                              : role.name === "VIEWER"
                                                ? "Espectador"
                                                : role.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Badge
                                  className={`text-xs px-2 py-1 rounded-md border-none ${getRoleBadgeClass(
                                    member.role
                                  )}`}
                                >
                                  {member.role === "OWNER"
                                    ? "Dueño"
                                    : member.role === "MANAGER"
                                      ? "Gestor"
                                      : member.role === "DEVELOPER"
                                        ? "Desarrollador"
                                        : member.role === "VIEWER"
                                          ? "Espectador"
                                          : member.role}
                                </Badge>
                              )}
                            </div>

                            {/* Action */}
                            <div className="col-span-2">
                              {canRemove && (
                                <Tooltip
                                  content={
                                    isCurrentUser
                                      ? "Salir del Proyecto"
                                      : isOwner
                                        ? "El dueño del proyecto no puede ser eliminado"
                                        : userAccess?.role === "MANAGER" &&
                                          member.role === "MANAGER"
                                          ? "No se puede eliminar a otros gestores"
                                          : "Eliminar Miembro"
                                  }
                                  position="top"
                                  color="danger"
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setMemberToRemove(member)}
                                    disabled={removingMember === member.id}
                                    className="h-7 border-none bg-[var(--destructive)]/10 hover:bg-[var(--destructive)]/20 text-[var(--destructive)] transition-all duration-200"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </Tooltip>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div className="px-4">
                    {totalMembers > 10 && (
                      <Pagination
                        pagination={{
                          currentPage: currentPage,
                          totalPages: Math.ceil(totalMembers / pageSize),
                          totalCount: totalMembers,
                          hasNextPage: currentPage * pageSize < totalMembers,
                          hasPrevPage: currentPage > 1,
                        }}
                        pageSize={pageSize}
                        onPageChange={async (page) => {
                          setCurrentPage(page);
                          await fetchMembers(page === 1 ? debouncedSearchTerm : searchTerm, page);
                        }}
                      />
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Project Info & Recent Activity - Small Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Project Info Card */}
          <Card className="bg-[var(--card)] rounded-[var(--card-radius)] border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-semibold text-[var(--foreground)] flex items-center gap-2">
                <HiFolder className="w-5 h-5 text-[var(--muted-foreground)]" />
                Información del Proyecto
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {project?.name || "Proyecto Desconocido"}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {project?.description || "Sin descripción disponible"}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                  <span>Espacio de Trabajo:</span>
                  <span className="font-medium text-[var(--foreground)]">
                    {workspace?.name || "Desconocido"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                  <span>Miembros:</span>
                  <span className="font-medium text-[var(--foreground)]">{members.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                  <span>Miembros Activos:</span>
                  <span className="font-medium text-[var(--foreground)]">
                    {members.filter((m) => m.status === "ACTIVE").length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Member Roles Summary */}
          <Card className="bg-[var(--card)] rounded-[var(--card-radius)] border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-semibold text-[var(--foreground)] flex items-center gap-2">
                <HiCog className="w-5 h-5 text-[var(--muted-foreground)]" />
                Distribución de Roles
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {roles.map((role) => {
                  const count = members.filter(
                    (m) => m.role === role.name && m.status?.toLowerCase() !== "pending"
                  ).length;
                  return (
                    <div key={role.id} className="flex items-center justify-between text-xs">
                      <span className="text-[var(--muted-foreground)]">
                        {role.name === "OWNER"
                          ? "Dueño"
                          : role.name === "MANAGER"
                            ? "Gestor"
                            : role.name === "DEVELOPER"
                              ? "Desarrollador"
                              : role.name === "VIEWER"
                                ? "Espectador"
                                : role.name}
                      </span>
                      <Badge
                        variant={role.variant}
                        className="h-5 px-2 text-xs border-none bg-[var(--primary)]/10 text-[var(--primary)]"
                      >
                        {count}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Pending Invitations */}
          {hasAccess && (
            <PendingInvitations
              ref={pendingInvitationsRef}
              entity={project}
              entityType="project"
              members={members}
            />
          )}
        </div>
      </div>

      <ProjectInviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInviteWithLoading}
        availableRoles={getAvailableRolesForMember()}
      />

      {memberToRemove && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setMemberToRemove(null)}
          onConfirm={() => handleRemoveMember(memberToRemove)}
          title={memberToRemove.userId === getCurrentUserId() ? "Salir del Proyecto" : "Eliminar Miembro"}
          message={
            memberToRemove.userId === getCurrentUserId()
              ? "¿Estás seguro de que deseas salir de este proyecto? Perderás el acceso a todos los recursos del proyecto."
              : "¿Estás seguro de que deseas eliminar a este miembro del Proyecto?"
          }
          confirmText={memberToRemove.userId === getCurrentUserId() ? "Salir" : "Eliminar"}
          cancelText="Cancelar"
        />
      )}
    </div>
  );
}

export default function ProjectMembersPage() {
  return <ProjectMembersContent />;
}
