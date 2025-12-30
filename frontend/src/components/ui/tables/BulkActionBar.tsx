import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import { useState } from "react";

interface BulkActionBarProps {
  selectedCount: number;
  onDelete: () => void;
  onClear: () => void;
  onAllDeleteSelect: () => void;
  totalTask?: number;
  currentTaskCount?: number;
  allDelete?: boolean;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  onDelete,
  onClear,
  onAllDeleteSelect,
  totalTask,
  currentTaskCount,
  allDelete,
}) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  if (selectedCount === 0) return null;

  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = () => {
    onDelete();
    setShowDeleteConfirmation(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  const allSelected = currentTaskCount && selectedCount >= currentTaskCount;
  return (
    <>
      <div className="fixed bottom-8 left-[65vw] -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5 duration-300">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-2xl px-4 py-2.5 flex items-center gap-3">
          <div className="flex items-center justify-center gap-2 text-xs">
            <div className="font-semibold rounded-full bg-primary/10 px-3 py-1">
              {selectedCount} {selectedCount === 1 ? "tarea seleccionada" : "tareas seleccionadas"}
            </div>

            {/* ✅ Gmail-like “Select all” link */}
            {allSelected &&
              (!allDelete ? (
                <>
                  <span>–</span>
                  <button
                    onClick={onAllDeleteSelect}
                    className="text-primary hover:underline font-medium"
                  >
                    Seleccionar las {totalTask} tareas
                  </button>
                </>
              ) : (
                <>
                  <span>–</span>
                  <button
                    onClick={onAllDeleteSelect}
                    className="text-primary hover:underline font-medium"
                  >
                    Limpiar todas las {totalTask} tareas seleccionadas
                  </button>
                </>
              ))}
          </div>

          <div className="h-5 w-px bg-[var(--border)] flex-shrink-0" />

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteClick}
              className="text-destructive hover:text-destructive flex items-center justify-center hover:bg-destructive/10 h-8 px-2"
            >
              <Trash2 className="size-3" />
              <span className="text-sm">Eliminar</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Eliminar Tareas"
        message={`¿Estás seguro de que quieres eliminar ${selectedCount} ${selectedCount === 1 ? "tarea" : "tareas"
          }? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </>
  );
};
