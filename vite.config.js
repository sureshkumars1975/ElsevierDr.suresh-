import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  // Relative paths so the build works from any folder or sub-path.
  base: './',
  // Inline JS/CSS into index.html so it also opens directly via file://.
  plugins: [react(), viteSingleFile()],
});
