import { cn } from "@/lib/utils";
import { IconProps } from "@tabler/icons-react";
import * as React from "react";

interface EmptyStateProps {
  icon: React.ComponentType<IconProps>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[300px] w-full flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center",
        className
      )}
    >
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
