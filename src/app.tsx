import { Toaster } from "sonner";
import { Home } from "./pages/_home";

export function App() {
  return (
    <>
      <Home />
      <Toaster position="top-right" />
    </>
  );
}
