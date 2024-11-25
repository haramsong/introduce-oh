import vitePluginGLSL from 'vite-plugin-glsl';
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
    base: './',
    plugins: [vitePluginGLSL()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
})
