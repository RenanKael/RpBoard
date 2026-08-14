import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

const outDir = resolve('mobile/assets/rpboard-web')

function fixMobileHtml(html) {
  const headEnd = html.indexOf('</head>')
  const scriptStart = html.indexOf('<script')

  if (scriptStart === -1 || scriptStart > headEnd) {
    return html.replace(/\stype="module"/g, '')
  }

  const scriptEnd = html.indexOf('</script>', scriptStart)
  if (scriptEnd === -1) return html

  const scriptTag = html
    .slice(scriptStart, scriptEnd + '</script>'.length)
    .replace(/\stype="module"/g, '')
    .replace(/\scrossorigin/g, '')

  const withoutHeadScript =
    html.slice(0, scriptStart) + html.slice(scriptEnd + '</script>'.length)

  return withoutHeadScript.replace('</body>', `  ${scriptTag}\n  </body>`)
}

export default defineConfig({
  plugins: [
    react(),
    viteSingleFile(),
    {
      name: 'fix-mobile-html',
      closeBundle() {
        const htmlPath = resolve(outDir, 'index.html')
        const html = readFileSync(htmlPath, 'utf8')
        writeFileSync(htmlPath, fixMobileHtml(html))
      },
    },
  ],
  build: {
    outDir,
    emptyOutDir: true,
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    modulePreload: false,
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
      },
    },
  },
})
