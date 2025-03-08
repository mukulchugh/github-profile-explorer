import { Toaster } from "sonner";
import { Home } from "./pages/home-page";

export function App() {
  return (
    <>
      <Home />
      <Toaster position="top-right" />
    </>
  );
}
