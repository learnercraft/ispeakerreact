import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";

import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const isElectron = mode === "electron";
    const isDev = mode === "development";

    return {
        base: process.env.VITE_BASE || (isElectron || isDev ? "/" : "/ispeaker/"),
        /*build: {
            rollupOptions: {
                output: {
                    manualChunks(id) {
                        if (id.includes("node_modules")) {
                            return id.toString().split("node_modules/")[1].split("/")[0].toString();
                        }
                    },
                },
            },
        },*/
        plugins: [react(), visualizer()],
    };
});
