import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import packageJson from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()], // Remova o 'removeConsole()' para teste
  define: {
    'process.env': process.env,
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version),
  },
  server: {
    host: true,
    port: 8080,
  },
  esbuild: {
    pure: ["console.log"], // Remove console.log durante o build
  },
  build: {
    outDir: 'dist',
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  optimizeDeps: {
    include: ["next-themes"],
  },
});
