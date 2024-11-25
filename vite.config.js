import vitePluginGLSL from 'vite-plugin-glsl';
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
    base: './',
    plugins: [vitePluginGLSL()],
    build: {
        emptyOutDir: true, // dist 폴더를 빌드 전에 비움
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
})
