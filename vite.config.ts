import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  base: "/sliding-puzzle-react/",
  build: {
    outDir: "dist",
  },
})
