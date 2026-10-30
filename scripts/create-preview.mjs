// Cria uma prévia autossuficiente, que também abre com dois cliques no Windows.
// Use npm run preview:file para gerar após editar o código.
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const dist = path.join(root, 'dist')
let html = await readFile(path.join(dist, 'index.html'), 'utf8')
const script = html.match(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/)
const style = html.match(/<link\b[^>]*href="([^"]+\.css)"[^>]*>/)
if (!script || !style) throw new Error('Gere o build de demonstração antes da prévia.')
let js = await readFile(path.join(dist, script[1].replace(/^\//, '')), 'utf8')
let css = await readFile(path.join(dist, style[1].replace(/^\//, '')), 'utf8')
if (/<script[^>]+src/.test(js)) throw new Error('A prévia não pode depender de scripts externos.')
const urls = [...new Set([...css.matchAll(/url\(([^)]+)\)/g)].map(m => m[1].replace(/^['"]|['"]$/g, '')))]
for (const url of urls) {
  if (url.startsWith('data:')) continue
  const file = path.join(dist, url.replace(/^\//, ''))
  const bytes = await readFile(file)
  const mime = url.endsWith('.woff2') ? 'font/woff2' : 'font/woff'
  css = css.split(url).join(`data:${mime};base64,${bytes.toString('base64')}`)
}
const favicon = await readFile(path.join(dist, 'favicon.svg'))
html = html.replace(script[0], () => `<script type="module">${js.replace(/<\/script/gi, '<\\/script')}</script>`)
html = html.replace(style[0], () => `<style>${css.replace(/<\/style/gi, '<\\/style')}</style>`)
html = html.replace('href="/favicon.svg"', `href="data:image/svg+xml;base64,${favicon.toString('base64')}"`)
html = html.replace('<title>', '<!-- PRÉVIA DE DEMONSTRAÇÃO: reservas locais, sem banco compartilhado. -->\n<title>')
const out = path.join(root, 'ABRIR_PREVIA.html')
await writeFile(out, html)
console.log(`Prévia autossuficiente criada: ${path.basename(out)} (${Math.round(Buffer.byteLength(html) / 1024)} KiB).`)
