export function validatePublicConfig(env) {
  if (env.VITE_DEMO_MODE === 'true') return 'Defina VITE_DEMO_MODE=false para usar o banco real.'
  let url
  try { url = new URL(env.VITE_SUPABASE_URL) } catch { return 'Preencha VITE_SUPABASE_URL com a URL do seu projeto.' }
  if (url.protocol !== 'https:' || url.username || url.password || /SEU-PROJETO/i.test(url.hostname)) {
    return 'VITE_SUPABASE_URL deve ser a URL HTTPS real do seu projeto Supabase.'
  }
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || ''
  if (!key.startsWith('sb_publishable_') || /COLE_|SUA_CHAVE/i.test(key) || key.length < 25) {
    return 'Preencha VITE_SUPABASE_PUBLISHABLE_KEY com a chave pública sb_publishable_. Nunca use uma chave secreta.'
  }
  return null
}
