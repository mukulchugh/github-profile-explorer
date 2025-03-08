import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import * as path from "path";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  return {
    plugins: [
      react({
        jsxRuntime: "automatic",
        babel: {
          plugins: isDev ? [] : ["transform-react-remove-prop-types"],
          compact: true,
          configFile: false,
          babelrc: false,
          generatorOpts: {
            compact: true,
            retainLines: false,
            concise: false,
            jsescOption: {
              minimal: true,
            },
          },
        },
      }),
      tailwindcss(),
      nodePolyfills(),
    ],
    server: {
      port: 3000,
      host: "::",
      hmr: { overlay: false },
      watch: {
        usePolling: false,
      },
      fs: {
        strict: true,
      },
      middlewareMode: false,

      warmup: {
        clientFiles: [
          './src/main.tsx',
          './src/index.css',
          './src/components/ui/chart.tsx',
          './src/lib/api.ts',
        ],
      },
    },
    build: {
      target: "esnext",
      minify: "esbuild",
      cssMinify: true,
      assetsInlineLimit: 4096,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-core': ['react'],
            'react-dom': ['react-dom'],
            'react-router': ['react-router-dom'],
            'radix-ui': [
              '@radix-ui/react-alert-dialog',
              '@radix-ui/react-dialog',
              '@radix-ui/react-menubar',
              '@radix-ui/react-popover',
              '@radix-ui/react-scroll-area',
              '@radix-ui/react-separator',
              '@radix-ui/react-slot',
              '@radix-ui/react-tabs',
              '@radix-ui/react-tooltip',
            ],
            'tailwind-ecosystem': [
              'tailwindcss',
              'tailwind-merge',
              'tailwindcss-animate',
              'class-variance-authority',
              'clsx',
            ],
            'ui-components': [
              '@tabler/icons-react',
              'recharts',
              'react-resizable-panels',
              'sonner',
              'cmdk',
              'next-themes',
            ],
          },
          assetFileNames: (assetInfo) => {
            if (assetInfo.name && assetInfo.name.endsWith(".css")) {
              return "assets/css/[name]-[hash][extname]";
            }
            return "assets/[name]-[hash][extname]";
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
        },
        onwarn(warning, warn) {
          // Ignore specific warnings related to dynamic imports in react-router-dom
          if (
            warning.code === 'DYNAMIC_IMPORT_VARIABLES' &&
            warning.message.includes('react-router-dom')
          ) {
            return;
          }
          warn(warning);
        },
      },
      reportCompressedSize: false,
      sourcemap: isDev,
      cssCodeSplit: true,
    },
    optimizeDeps: {
      entries: ['src/main.tsx', 'src/components/**/*.{js,ts}', 'src/hooks/**/*.{js,ts}', 'src/lib/**/*.{js,ts}'],
      force: true,
      // Add direct dependency for react-router-dom to prevent dynamic import warnings
      include: [
        // React ecosystem
        'react', 
        'react-dom',
        'react-router-dom',
        
        // Most frequently used Radix components
        '@radix-ui/react-dialog',
        '@radix-ui/react-slot',
        '@radix-ui/react-popover',
        
        // Icons and UI components
        '@tabler/icons-react',
        'recharts',
        
        // Utility libraries
        'class-variance-authority',
        'clsx',
        'tailwind-merge',
        
        // Tailwind
        '@tailwindcss/vite',
      ], 
      esbuildOptions: {
        target: "esnext",
        logLevel: "error",
        legalComments: 'none',
        minify: true,
        treeShaking: true,
      },
    },
    esbuild: {
      legalComments: "none",
      treeShaking: true,
      jsx: "automatic",
      jsxInject: isDev ? undefined : `import React from 'react'`,
      minifySyntax: true,
      minifyIdentifiers: true,
      minifyWhitespace: true,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        components: path.resolve(__dirname, "src/components"),
        styles: path.resolve(__dirname, "src/styles"),
        ui: path.resolve(__dirname, "src/components/ui"),
        lib: path.resolve(__dirname, "src/lib"),
        hooks: path.resolve(__dirname, "src/hooks"),
      },
    },
    cacheDir: ".vite",
    define: {
      "process.env.NODE_ENV": JSON.stringify(mode),
      "process.env.TAILWIND_MODE": JSON.stringify(isDev ? "watch" : "build"),
    },
  };
});
