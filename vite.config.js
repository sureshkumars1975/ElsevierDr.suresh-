import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  // Source entry lives in src/ so the repo-root index.html can be the built app
  // (GitHub Pages "deploy from branch" serves the repo root as-is).
  root: 'src',
  // Relative paths so the build works from any folder or sub-path.
  base: './',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  // Inline JS/CSS into index.html so it also opens directly via file://.
  plugins: [react(), viteSingleFile()],
});
