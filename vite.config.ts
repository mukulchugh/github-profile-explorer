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
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom", "react-router-dom"],
            "ui-components": [
              "@radix-ui/react-avatar",
              "@radix-ui/react-dialog",
              "@radix-ui/react-dropdown-menu",
              "@radix-ui/react-menubar",
              "@radix-ui/react-popover",
              "@radix-ui/react-separator",
              "@radix-ui/react-slot",
              "@radix-ui/react-tabs",
              "@radix-ui/react-toggle",
              "@radix-ui/react-toggle-group",
              "@radix-ui/react-tooltip",
            ],
            "data-libs": ["@tanstack/react-query", "recharts"],
            utils: ["date-fns", "clsx", "tailwind-merge", "class-variance-authority"],
          },
        },
      },
    },
  };
});
