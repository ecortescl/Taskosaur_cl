import type React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PriorityBadgeProps {
  priority: string;
  className?: string;
}

type Props = PriorityBadgeProps & React.ComponentProps<typeof Badge>;

const PriorityBadge: React.FC<Props> = ({ priority, className, ...props }) => {
  const getPriorityConfig = (priority: string) => {
    const normalizedPriority = String(priority || "low").toLowerCase();

    switch (normalizedPriority) {
      case "highest":
        return {
          color: "#dc2626",
          label: "Máxima",
        };
      case "high":
        return {
          color: "#ea580c",
          label: "Alta",
        };
      case "medium":
        return {
          color: "#d97706",
          label: "Media",
        };
      case "low":
        return {
          color: "#16a34a",
          label: "Baja",
        };
      default:
        return {
          color: "#6b7280",
          label: "Sin Prioridad",
        };
    }
  };

  const config = getPriorityConfig(priority);

  return (
    <Badge
      className={cn(
        "inline-flex items-center gap-1.5 w-20 py-1 text-[13px] font-medium rounded-full border-0 shadow-sm text-white cursor-pointer",
        className
      )}
      style={{
        backgroundColor: config.color,
      }}
      {...props}
    >
      <span>{config.label}</span>
    </Badge>
  );
};

export { PriorityBadge };
