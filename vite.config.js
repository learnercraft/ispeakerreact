import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import packageJson from "./package.json";

import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const isElectron = mode === "electron";
    const isDev = mode === "development";
    const base = process.env.VITE_BASE || isElectron ? "./" : isDev ? "/" : "/ispeakerreact/";

    return {
        base: base,
        build: {
            rollupOptions: {
                output: {
                    manualChunks(id) {
                        if (id.includes("node_modules")) {
                            return id.toString().split("node_modules/")[1].split("/")[0].toString();
                        }
                    },
                },
            },
            manifest: true,
        },
        plugins: [
            react(),
            visualizer(),
            VitePWA({
                registerType: "autoUpdate",
                manifest: {
                    name: "iSpeakerReact",
                    short_name: "iSpeakerReact",
                    theme_color: "#fcfcfc",
                    description:
                        "An English-learning interactive tool written in React, designed to help learners practice speaking and listening.",
                    icons: [
                        {
                            src: `${base}images/icons/ios/192.png`,
                            sizes: "192x192",
                            type: "image/png",
                        },
                        {
                            src: `${base}images/icons/ios/512.png`,
                            sizes: "512x512",
                            type: "image/png",
                        },
                    ],
                    screenshots: [
                        {
                            src: `${base}images/screenshots/screenshot-00.webp`,
                            sizes: "1920x1080",
                            type: "image/webp",
                            form_factor: "wide",
                        },
                        {
                            src: `${base}images/screenshots/screenshot-01.webp`,
                            sizes: "1920x1080",
                            type: "image/webp",
                            form_factor: "wide",
                        },
                        {
                            src: `${base}images/screenshots/screenshot-02.webp`,
                            sizes: "1920x1080",
                            type: "image/webp",
                            form_factor: "wide",
                        },
                        {
                            src: `${base}images/screenshots/screenshot-03.webp`,
                            sizes: "1920x1080",
                            type: "image/webp",
                            form_factor: "wide",
                        },
                        {
                            src: `${base}images/screenshots/screenshot-04.webp`,
                            sizes: "1920x1080",
                            type: "image/webp",
                            form_factor: "wide",
                        },
                        {
                            src: `${base}images/screenshots/screenshot-05.webp`,
                            sizes: "1920x1080",
                            type: "image/webp",
                            form_factor: "wide",
                        },
                        {
                            src: `${base}images/screenshots/screenshot-06.webp`,
                            sizes: "1920x1080",
                            type: "image/webp",
                            form_factor: "wide",
                        },
                        {
                            src: `${base}images/screenshots/screenshot-07.webp`,
                            sizes: "1920x1080",
                            type: "image/webp",
                            form_factor: "wide",
                        },
                    ],
                },
                workbox: {
                    runtimeCaching: [
                        {
                            urlPattern: /\.(?:js|css|json|png|jpg|jpeg|svg|ico|woff2)$/, // Cache everything except audio
                            handler: "CacheFirst",
                            options: {
                                cacheName: "app-dynamic-cache",
                                expiration: {
                                    maxEntries: 100,
                                    //maxAgeSeconds: 7 * 24 * 60 * 60, // Cache for 1 week
                                },
                            },
                        },
                    ],
                },
            }),
        ],
        define: {
            __APP_VERSION__: JSON.stringify(packageJson.version), // Inject version
        },
        server: {
            fs: {
                // Allow serving files from one level up to the project root
                allow: [".."],
            },
        },
    };
});
