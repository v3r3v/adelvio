import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import {fileURLToPath} from 'node:url';
import {prerenderHome} from './scripts/prerender';

export default defineConfig({
  root: fileURLToPath(new URL('./pages/', import.meta.url)),
  base: '/adelvio/',
  publicDir: fileURLToPath(new URL('./public/', import.meta.url)),
  plugins: [react(), prerenderHome()],
  css: {postcss: {plugins: [tailwindcss()]}},
  build: {
    rollupOptions: {input: {home: fileURLToPath(new URL('./pages/index.html', import.meta.url)), portal: fileURLToPath(new URL('./pages/portal/index.html', import.meta.url))}},
    outDir: fileURLToPath(new URL('./dist-pages/', import.meta.url)),
    emptyOutDir: true,
  },
});
