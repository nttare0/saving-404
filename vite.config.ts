import path from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
  },
  preview: {
    host: "0.0.0.0",
    allowedHosts: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return
          if (id.includes("d3-") || id.includes("motion") || id.includes("@number-flow")) {
            return "charts"
          }
          if (id.includes("@radix-ui") || id.includes("sonner") || id.includes("lucide-react")) {
            return "ui"
          }
          return "vendor"
        },
      },
    },
  },
})
