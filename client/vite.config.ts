import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// The actual frontend source lives in ../artifacts/dragonzstore.
// Vite uses that as the project root (finds index.html there) and
// writes the production build into this client/dist folder.
const frontendRoot = path.resolve(__dirname, "../artifacts/dragonzstore");
const outDir = path.resolve(__dirname, "dist");

export default defineConfig({
  root: frontendRoot,
  base: "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(frontendRoot, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    outDir,
    emptyOutDir: true,
  },
});
