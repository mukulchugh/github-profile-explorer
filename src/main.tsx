import { queryClient } from "@/lib/query-client";
import { runStorageMigrations } from "@/lib/storage-migrations";
import { Home } from "@/pages/Home";
import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import "./index.css";

// Run storage migrations before starting the app
runStorageMigrations().then((success) => {
  if (!success) {
    console.warn("Storage migrations failed or were skipped");
  }
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
        </Routes>
        <Toaster position="top-right" />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
