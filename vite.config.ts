import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "favicon.svg", "favicon-32x32.png", "favicon-16x16.png", "logo-192.png", "logo-512.png", "maskable-black.png"],
      manifest: {
        name: "VoiceKhata",
        short_name: "VoiceKhata",
        start_url: "/",
        display: "standalone",
        theme_color: "#000000",
        background_color: "#000000",
        icons: [
          {
            src: "/logo-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/logo-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/maskable-black.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        navigateFallback: "index.html",
        navigateFallbackDenylist: [
          /^\/api/,
          /^\/auth/,
          /^\/__/,
        ],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 5173,
    watch: {
      ignored: ["**/.edge_data/**", "**/scratch/**", "**/dist/**", "**/dev-dist/**"],
    },
    proxy: {
      "/scan": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      "/merchant": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      "/stock": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {                  // ← splits the big bundle
          vendor: ["react", "react-dom"],
          charts: ["recharts"],
          supabase: ["@supabase/supabase-js"],
        },
      },
    },
  },
})