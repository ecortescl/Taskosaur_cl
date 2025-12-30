import ActionButton from "@/components/common/ActionButton";
import { HiCalendar } from "react-icons/hi2";
import { NewTaskModal } from "@/components/tasks/NewTaskModal";
import { useState } from "react";
interface DashboardHeaderProps {
  currentUser: any;
  greeting: string;
  currentDate: string;
  onTodayAgendaClick: () => void;
}

export function DashboardHeader({
  currentUser,
  greeting,
  currentDate,
  onTodayAgendaClick,
}: DashboardHeaderProps) {
  const [isNewTaskModalOpen, setNewTaskModalOpen] = useState(false);

  return (
    <div className="dashboard-header">
      <div className="dashboard-user-section">
        <div className="dashboard-user-avatar">
          {currentUser?.firstName?.charAt(0) || "U"}
          {currentUser?.lastName?.charAt(0) || ""}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="dashboard-greeting font-bold text-[var(--foreground)]">
              {greeting}, {currentUser?.firstName || "Usuario"}!
            </h1>
          </div>
          <p className="dashboard-date-info">{currentDate} • ¿Listo para cumplir tus objetivos?</p>
        </div>
      </div>

      <div className="dashboard-header-actions">
        <ActionButton
          onClick={onTodayAgendaClick}
          secondary
          rightIcon={<HiCalendar className="dashboard-icon-sm" />}
        >
          Agenda de hoy
        </ActionButton>

        {/* New Task Button and Modal */}
        {(() => {
          return (
            <>
              <ActionButton showPlusIcon primary onClick={() => setNewTaskModalOpen(true)}>
                Nueva Tarea
              </ActionButton>
              <NewTaskModal
                isOpen={isNewTaskModalOpen}
                onClose={() => setNewTaskModalOpen(false)}
              />
            </>
          );
        })()}
      </div>
    </div>
  );
}
