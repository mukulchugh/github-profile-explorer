import * as React from "react";
import { createContext, useContext, useState } from "react";

type ViewType = "search" | "watchlist" | "history" | "compare";

interface ViewContextProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  compareUsernames: string[] | null;
  setCompareUsernames: (usernames: string[]) => void;
}

const ViewContext = createContext<ViewContextProps | undefined>(undefined);

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

export function useViewControl() {
  const context = useContext(ViewContext);
  if (context === undefined) {
    throw new Error("useViewControl must be used within a ViewControlProvider");
  }
  return context;
}
