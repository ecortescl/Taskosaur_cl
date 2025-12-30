import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HiPlus, HiEllipsisVertical, HiCheck, HiPencil, HiTrash } from "react-icons/hi2";
import { GripVertical, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjectContext } from "@/contexts/project-context";
import { useOrganization } from "@/contexts/organization-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/DropdownMenu";
import { toast } from "sonner";
import { TaskStatus } from "@/types";
import ActionButton from "../common/ActionButton";
import ConfirmationModal from "../modals/ConfirmationModal";

interface StatusSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onStatusUpdated: () => void;
}

const StatusSettingsModal: React.FC<StatusSettingsModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onStatusUpdated,
}) => {
  const {
    getTaskStatusByProject,
    createTaskStatusFromProject,
    updateTaskStatus,
    deleteTaskStatus,
  } = useProjectContext();
  const { updateTaskStatusPositions } = useOrganization();

  const [statusList, setStatusList] = useState<TaskStatus[]>([]);
  const [loading, setLoading] = useState(false);

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  /* ──────────────────  add / edit state  ────────────────── */
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("#94A3B8");

  const [workFlowStatusToDelete, setWorkFlowStatusToDelete] = useState("");

  useEffect(() => {
    if (isOpen && projectId) fetchStatuses();
  }, [isOpen, projectId]);

  /* ──────────────────  network helpers  ────────────────── */
  const fetchStatuses = async () => {
    setLoading(true);
    try {
      const data = await getTaskStatusByProject(projectId);
      setStatusList(data || []);
    } catch {
      toast.error("Error al obtener los estados");
    } finally {
      setLoading(false);
    }
  };

  const addStatus = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const created = await createTaskStatusFromProject({
        name: newName.trim(),
        projectId,
      });
      setStatusList([...statusList, created]);
      onStatusUpdated();
      toast.success("Estado creado");
      setIsAdding(false);
      setNewName("");
    } catch {
      toast.error("Error al crear el estado");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (s: TaskStatus) => {
    setEditingId(s.id);
    setEditName(s.name);
    setEditColor(s.color || "#94A3B8");
  };

  const saveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    try {
      const updated = await updateTaskStatus(editingId, {
        name: editName.trim(),
        color: editColor,
      });
      setStatusList((prev) => prev.map((s) => (s.id === editingId ? updated : s)));
      onStatusUpdated();
      toast.success("Estado actualizado");
      cancelEdit();
    } catch {
      toast.error("Error al actualizar el estado");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditColor("#94A3B8");
  };

  const removeStatus = async (id: string) => {
    try {
      await deleteTaskStatus(id);
      setStatusList((prev) => prev.filter((s) => s.id !== id));
      onStatusUpdated();
      setWorkFlowStatusToDelete(null);
      toast.success("¡Estado eliminado exitosamente!");
    } catch (error) {
      setWorkFlowStatusToDelete(null);
      toast.error(error.message || "Error al eliminar el estado");
    }
  };

  /* ──────────────────  drag-n-drop  ────────────────── */
  const reorderArray = (list: TaskStatus[], start: number, end: number) => {
    const res = [...list];
    const [removed] = res.splice(start, 1);
    res.splice(end, 0, removed);
    return res;
  };

  const handleDrop = async (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;
    const from = statusList.findIndex((s) => s.id === draggedId);
    const to = statusList.findIndex((s) => s.id === targetId);
    if (from === -1 || to === -1) return;

    const reordered = reorderArray(statusList, from, to).map((s, i) => ({
      ...s,
      position: i + 1,
    }));
    setStatusList(reordered);

    try {
      await updateTaskStatusPositions(reordered.map(({ id, position }) => ({ id, position })));
      onStatusUpdated();
      toast.success("Orden actualizado");
    } catch {
      toast.error("Error al guardar el orden");
      fetchStatuses(); // revert
    }
    setDraggedId(null);
    setDragOverId(null);
  };

  /* ──────────────────  render helpers  ────────────────── */
  const StatusRow = (s: TaskStatus) =>
    editingId === s.id ? (
      /*  -------- edit mode --------  */
      <div className="kanban-status-row-edit">
        <GripVertical size={14} className="kanban-status-row-edit-grip" />
        <input
          type="color"
          value={editColor}
          onChange={(e) => setEditColor(e.target.value)}
          className="kanban-status-row-edit-color"
        />

        <Input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="kanban-status-row-edit-input"
          placeholder="Nombre del estado"
          onKeyDown={(e) => {
            if (e.key === "Enter") saveEdit();
            if (e.key === "Escape") cancelEdit();
          }}
          autoFocus
        />

        <Button size="sm" onClick={saveEdit} disabled={!editName.trim()}>
          <HiCheck size={15} />
        </Button>
        <Button variant="ghost" size="sm" onClick={cancelEdit}>
          <X size={15} />
        </Button>
      </div>
    ) : (
      /*  -------- view mode --------  */
      <div
        draggable
        onDragStart={() => setDraggedId(s.id)}
        onDragEnter={() => draggedId && setDragOverId(s.id)}
        onDragEnd={() => {
          setDraggedId(null);
          setDragOverId(null);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => handleDrop(s.id)}
        className={cn(
          "group kanban-status-row-view",
          draggedId === s.id && "kanban-status-row-view-dragging",
          dragOverId === s.id && draggedId !== s.id && "kanban-status-row-view-drag-over"
        )}
      >
        <GripVertical size={14} className="kanban-status-row-grip" />
        <div
          className="kanban-status-row-color"
          style={{ backgroundColor: s.color || "#94A3B8" }}
        />
        <span className="kanban-status-row-name">{s.name}</span>

        {/* kebab menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="kanban-status-row-menu-trigger">
              <HiEllipsisVertical size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="end" className="kanban-status-row-menu-content">
            <DropdownMenuItem
              onClick={() => startEdit(s)}
              className="cursor-pointer hover:bg-[var(--muted)]"
            >
              <HiPencil size={14} /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setWorkFlowStatusToDelete(s.id)}
              className="kanban-status-row-menu-delete"
            >
              <HiTrash size={14} /> Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="kanban-status-modal-content">
          <DialogHeader>
            <DialogTitle className="kanban-status-modal-title">Configuración de Flujo de Trabajo</DialogTitle>
            <DialogDescription className="kanban-status-modal-description">
              Arrastra las filas para reordenar. Usa el menú para editar o eliminar.
            </DialogDescription>
          </DialogHeader>

          {/* -------- status list -------- */}
          <div className="kanban-status-modal-list">
            {loading ? (
              <div className="kanban-status-modal-loading">Cargando...</div>
            ) : (
              <>
                {statusList.map(StatusRow)}

                {/* -------- new status row -------- */}
                {isAdding ? (
                  <div className="kanban-add-status-row">
                    <GripVertical size={14} className="kanban-add-status-grip" />
                    <div className="kanban-add-status-color" />
                    <input
                      className="kanban-add-status-input"
                      placeholder="Nuevo estado..."
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addStatus();
                        if (e.key === "Escape") {
                          setIsAdding(false);
                          setNewName("");
                        }
                      }}
                      autoFocus
                    />
                    <ActionButton
                      type="submit"
                      primary
                      disabled={!newName.trim()}
                      onClick={addStatus}
                    >
                      {creating ? "..." : "Agregar"}
                    </ActionButton>
                    <ActionButton type="button" secondary onClick={() => setIsAdding(false)}>
                      Cancelar
                    </ActionButton>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    className="kanban-add-status-button"
                    onClick={() => setIsAdding(true)}
                  >
                    <HiPlus size={15} />
                    Agregar estado
                  </Button>
                )}
              </>
            )}
          </div>

          {/* -------- footer -------- */}
          <div className="kanban-status-modal-footer">
            {statusList.length} estado{statusList.length !== 1 && "s"} configurado{statusList.length !== 1 && "s"}
            <ActionButton type="submit" primary onClick={onClose}>
              Listo
            </ActionButton>
          </div>
        </DialogContent>
      </Dialog>
      <ConfirmationModal
        isOpen={!!workFlowStatusToDelete}
        onClose={() => setWorkFlowStatusToDelete(null)}
        onConfirm={() => removeStatus(workFlowStatusToDelete!)}
        title="Eliminar Estado"
        message="¿Eliminar el estado? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </>
  );
};

export default StatusSettingsModal;
