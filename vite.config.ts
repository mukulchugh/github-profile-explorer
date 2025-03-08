import react from "@vitejs/plugin-react";
import * as path from "path";
import { defineConfig } from "vite";

export default defineConfig(() => {
  return {
    plugins: [react()],
    server: {
      port: 3000,
      host: "::",
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    cacheDir: ".vite",
  };
});
