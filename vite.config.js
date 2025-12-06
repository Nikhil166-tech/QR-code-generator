import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // 👇 IMPORTANT for GitHub Pages deployment
  // because your repo name is QR-code-generator
  base: "/QR-code-generator/",
});
