import { defineConfig } from "eslint/config";

// Use the recommended Next.js config; keep minimal to avoid unexpected shape issues.
export default defineConfig({
  extends: ["next/core-web-vitals"],
  rules: {
    // project-specific overrides can go here
  },
});
