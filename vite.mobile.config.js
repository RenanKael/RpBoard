import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Build variant that inlines all JS/CSS into a single index.html so it can
// be loaded fully offline inside a WebView (no relative asset requests).
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: 'mobile/assets/rpboard-web',
    emptyOutDir: true,
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
  },
})
