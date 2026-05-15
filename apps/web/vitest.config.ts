import { defineConfig } from "vitest/config"
import { playwright } from "@vitest/browser-playwright"
import react from "@vitejs/plugin-react"
import { fileURLToPath } from "node:url"

const rootDir = fileURLToPath(new URL(".", import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": rootDir,
    },
  },
  test: {
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
  },
})
