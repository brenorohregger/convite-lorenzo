import test from 'node:test'
import assert from 'node:assert/strict'
import { validatePublicConfig } from '../scripts/public-config.mjs'

const correct = { VITE_SUPABASE_URL: 'https://projeto.supabase.co', VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_exemplo_de_chave_publica', VITE_DEMO_MODE: 'false' }
test('somente configuração pública válida permite a publicação', () => {
  assert.equal(validatePublicConfig(correct), null)
  assert.ok(validatePublicConfig({}))
  assert.ok(validatePublicConfig({ ...correct, VITE_DEMO_MODE: 'true' }))
  assert.ok(validatePublicConfig({ ...correct, VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_secret_nunca_deve_ir_no_frontend' }))
  assert.ok(validatePublicConfig({ ...correct, VITE_SUPABASE_URL: 'http://projeto.supabase.co' }))
  assert.ok(validatePublicConfig({ ...correct, VITE_SUPABASE_URL: 'https://SEU-PROJETO.supabase.co' }))
})
