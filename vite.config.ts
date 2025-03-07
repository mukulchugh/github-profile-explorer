import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { ConfigEnv, defineConfig, UserConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
      TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
      react(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  })
);
