import { cn } from "@/lib/utils";
import { IconAlertCircle } from "@tabler/icons-react";
import React from "react";

interface ErrorStateProps {
  message: string;
  onReset: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message, onReset }) => {
  return (
    <div className="w-full max-w-md mx-auto mt-12 animate-fade-in">
      <div
        className={cn(
          "glass rounded-2xl p-8 text-center",
          "border-2 border-destructive/10"
        )}
      >
        <div className="flex justify-center">
          <div
            className={cn(
              "rounded-full p-3",
              "bg-destructive/10 text-destructive"
            )}
          >
            <IconAlertCircle className="h-8 w-8" />
          </div>
        </div>

        <h2 className="mt-4 text-xl font-semibold">
          Oops, something went wrong
        </h2>

        <p className="mt-2 text-muted-foreground">
          {message || "An error occurred while fetching data from GitHub."}
        </p>

        <button
          onClick={onReset}
          className={cn(
            "mt-6 inline-flex items-center justify-center",
            "rounded-xl px-5 py-2.5",
            "text-sm font-medium",
            "transition-all duration-200 ease-out",
            "bg-secondary hover:bg-secondary/80",
            "focus:outline-none focus:ring-2 focus:ring-primary/20"
          )}
        >
          Try again
        </button>
      </div>
    </div>
  );
};

export default ErrorState;
