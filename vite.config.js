import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
    base: './',
    build: {
        emptyOutDir: true, // dist 폴더를 빌드 전에 비움
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
})
