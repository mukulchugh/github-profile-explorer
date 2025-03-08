import { createContext } from "react";

export type ViewType = "search" | "watchlist" | "history" | "compare" | "profile";

export interface ViewContextProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  compareUsernames: string[] | null;
  setCompareUsernames: (usernames: string[]) => void;
}

export const ViewContext = createContext<ViewContextProps | undefined>(undefined);
