import * as React from "react";
import { useContext, useState } from "react";
import { ViewContext, ViewType } from "../contexts/view-context";

/**
 * Hook to access the view control context
 * Provides access to view state management throughout the application
 */
export function useViewControl() {
  const context = useContext(ViewContext);
  if (context === undefined) {
    throw new Error("useViewControl must be used within a ViewControlProvider");
  }
  return context;
}

/**
 * Provider component that wraps the application and provides view control context
 */
export function ViewControlProvider({ children }: { children: React.ReactNode }) {
  const [activeView, setActiveView] = useState<ViewType>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [compareUsernames, setCompareUsernames] = useState<string[] | null>(null);

  return (
    <ViewContext.Provider
      value={{
        activeView,
        setActiveView,
        searchQuery,
        setSearchQuery,
        compareUsernames,
        setCompareUsernames,
      }}
    >
      {children}
    </ViewContext.Provider>
  );
}
