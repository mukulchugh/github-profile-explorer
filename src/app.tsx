import { Toaster } from "sonner";
import { Home } from "./pages/home";

export function App() {
  return (
    <>
      <Home />
      <Toaster position="top-right" />
    </>
  );
}
