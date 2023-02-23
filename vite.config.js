import { resolve } from "path";
import { defineConfig } from "vite";

const root = resolve(__dirname, "src");
const outDir = resolve(__dirname, "dist");

export default defineConfig({
  base: "./",
  publicDir: "../static/",
  server: {
    host: true,
    port: 3333,
  },
  root,
  build: {
    outDir,
    rollupOptions: {
      input: {
        index: resolve(root, "index.html"),
        "01": resolve(root, "01", "index.html"),
      },
    },
  },
});
