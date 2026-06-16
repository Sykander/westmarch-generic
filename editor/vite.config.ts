import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/westmarch-generic/",
  plugins: [react()],
  build: {
    outDir: "../public",
    emptyOutDir: true,
  },
});
