import * as React from "react";
import { useState } from "react";
import { ViewContext, ViewType } from "../contexts/view-context";

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
