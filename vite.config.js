import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

const isSingleFile = process.env.BUILD_MODE === 'singlefile'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: isSingleFile ? [react(), viteSingleFile()] : [react()],
  define: { __SINGLEFILE__: JSON.stringify(isSingleFile) },
  base: isSingleFile ? './' : '/Amateur-Radio-DXCC-Analyzer-Pro/',
  build: {
    outDir: isSingleFile ? 'dist-standalone' : 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
