import { HiExclamationTriangle } from "react-icons/hi2";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui";

export const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  sprintName,
  isDeleting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  sprintName: string;
  isDeleting: boolean;
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-md bg-[var(--card)] border-none shadow-lg ">
      <DialogHeader>
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[var(--destructive)]/10 mb-4">
          <HiExclamationTriangle className="h-6 w-6 text-[var(--destructive)]" />
        </div>
        <DialogTitle className="text-center text-lg font-semibold text-[var(--destructive)]">
          Eliminar Sprint
        </DialogTitle>
        <DialogDescription className="text-center text-[var(--muted-foreground)]">
          ¿Está seguro de que desea eliminar{" "}
          <span className="font-semibold text-[var(--foreground)]">"{sprintName}"</span>? Esta
          acción no se puede deshacer y eliminará todos los datos asociados.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="gap-2 mt-4 flex flex-row">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isDeleting}
          className="flex-1 h-10 border-none bg-[var(--primary)]/5 hover:bg-[var(--primary)]/10 text-[var(--foreground)]"
        >
          Cancelar
        </Button>
        <Button
          variant="destructive"
          onClick={onConfirm}
          disabled={isDeleting}
          className="flex-1 h-10 bg-[var(--destructive)] hover:bg-[var(--destructive)]/90 text-white"
        >
          {isDeleting ? (
            <>
              <div className="w-4 h-4 border-2 border-[var(--destructive-foreground)] border-t-transparent rounded-full animate-spin mr-2" />
              Eliminando...
            </>
          ) : (
            "Eliminar Sprint"
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
