import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import { compression } from "vite-plugin-compression2";

import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    base: "/ispeaker/",
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
    build: {
        rollupOptions: {
          input: {
            main: "./index.html",
          },
        },
      },
    server: {
        historyApiFallback: true,
    },
    plugins: [
        react(),
        visualizer(),
        compression({
            threshold: 1025,
            algorithm: "brotliCompress",
        }),
    ],
});
