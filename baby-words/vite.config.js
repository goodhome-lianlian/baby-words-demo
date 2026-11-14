import fs from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Older mobile browsers and file:// viewers are stricter about module scripts,
// so the inlined bundle ships as a classic script at the end of <body>.
function classicScriptAtEndOfBody() {
  let outDir
  return {
    name: 'classic-script-at-end-of-body',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      const file = path.join(outDir, 'index.html')
      const html = fs.readFileSync(file, 'utf8')
      const start = html.search(/<script type="module"[^>]*>/)
      if (start === -1) throw new Error('inlined module script not found')
      const openEnd = html.indexOf('>', start) + 1
      const close = html.indexOf('</script>', openEnd)
      const code = html.slice(openEnd, close)
      const withoutScript = html.slice(0, start) + html.slice(close + '</script>'.length)
      const bodyEnd = withoutScript.lastIndexOf('</body>')
      fs.writeFileSync(
        file,
        `${withoutScript.slice(0, bodyEnd)}<script>${code}</script>\n${withoutScript.slice(bodyEnd)}`,
      )
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), viteSingleFile(), classicScriptAtEndOfBody()],
  build: {
    target: 'es2017',
    modulePreload: false,
    rolldownOptions: {
      output: { format: 'iife' },
    },
  },
})
