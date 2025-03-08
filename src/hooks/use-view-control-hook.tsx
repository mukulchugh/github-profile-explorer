import { useContext } from "react";
import { ViewContext } from "../contexts/view-context";

export function useViewControl() {
  const context = useContext(ViewContext);
  if (context === undefined) {
    throw new Error("useViewControl must be used within a ViewControlProvider");
  }
  return context;
}
