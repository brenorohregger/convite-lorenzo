import { build, loadEnv } from 'vite'
import { validatePublicConfig } from './public-config.mjs'

const demo = process.argv.includes('--demo')
if (demo) process.env.VITE_DEMO_MODE = 'true'
const env = { ...loadEnv('production', process.cwd(), ''), ...process.env }
if (!demo) {
  const problem = validatePublicConfig(env)
  if (problem) {
    console.error(`\nNão foi possível gerar o site para publicação: ${problem}\nLeia o README.md. Para somente testar o visual, use npm run build:preview.\n`)
    process.exit(1)
  }
}
await build()
if (demo) console.warn('\nPRÉVIA: este build é demonstrativo e não faz reservas compartilhadas. Não envie o link da prévia aos convidados.\n')
