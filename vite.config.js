import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import packageJson from "./package.json";

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
            tailwindcss(),
            !isElectron &&
                VitePWA({
                    registerType: "autoUpdate",
                    manifest: {
                        name: "iSpeakerReact",
                        short_name: "iSpeakerReact",
                        theme_color: "#fdfdf5",
                        background_color: "#2a303c",
                        description:
                            "An English-learning interactive tool written in React, designed to help learners practice speaking and listening.",
                        lang: "en",
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
                        id: "page.yell0wsuit.ispeakerreact",
                        dir: "auto",
                        orientation: "any",
                        categories: ["education"],
                        prefer_related_applications: false,
                    },
                    workbox: {
                        // Exclude index.html from caching
                        // globIgnores: ["**/index.html"],
                        runtimeCaching: [
                            {
                                // Files that need caching permanently
                                urlPattern: /\.(?:woff2|ttf|jpg|jpeg|webp|svg|ico|png)$/,
                                handler: "CacheFirst",
                                options: {
                                    cacheName: "permanent-cache",
                                    expiration: {
                                        maxEntries: 50,
                                        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                                    },
                                },
                            },
                            {
                                // Cache other assets dynamically with versioning
                                urlPattern: /\.(?:js|css|json|html)$/,
                                handler: "CacheFirst",
                                options: {
                                    cacheName: `dynamic-cache-v${packageJson.version}`,
                                    expiration: {
                                        maxEntries: 100,
                                        maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
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
