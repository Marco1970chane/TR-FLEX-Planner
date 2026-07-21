import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",

      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png"
      ],

      manifest: {
        name: "TR-FLEX Planner",
        short_name: "TR-FLEX",
        description: "TR-FLEX Personeelsplanner",
        theme_color: "#2563eb",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",

        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "planner-icon-1024.png",
            sizes: "1024x1024",
            type: "image/png",
            purpose: "any"
          }
        ]
      }
    })
  ]
});