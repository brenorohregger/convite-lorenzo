import { createClient } from '@supabase/supabase-js'
import { demoGifts } from '../data/gifts'
import { validatePublicConfig } from '../../scripts/public-config.mjs'

const config = import.meta.env
const configProblem = validatePublicConfig(config)
export const isDemo = config.VITE_DEMO_MODE === 'true' || (import.meta.env.DEV && !config.VITE_SUPABASE_URL && !config.VITE_SUPABASE_PUBLISHABLE_KEY)
export const isConfigured = !configProblem && !isDemo
const storageKey = 'lorenzo-demo-v1'
let memoryReservations = []

const client = isConfigured ? createClient(config.VITE_SUPABASE_URL, config.VITE_SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  global: { fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }) },
}) : null

function readDemoReservations() {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || '[]')
    return Array.isArray(value) ? value.filter(id => typeof id === 'string') : []
  } catch { return memoryReservations }
}

export async function listGifts() {
  if (isDemo) {
    const selected = readDemoReservations()
    return demoGifts.map(g => ({ ...g, reserved_at: selected.includes(g.id) ? 'demo' : null }))
  }
  if (!client) throw new Error('A lista de presentes ainda não foi conectada. Tente novamente mais tarde.')
  const { data, error } = await client.from('gifts')
    .select('id,title,description,category,icon,sort_order,reserved_at')
    .eq('active', true).order('sort_order').order('id')
    .abortSignal(AbortSignal.timeout(12000))
  if (error) throw error
  return data || []
}

export async function reserveGift(id) {
  if (isDemo) {
    const reserve = () => {
      const selected = readDemoReservations()
      if (!demoGifts.some(g => g.id === id)) return 'unavailable'
      if (selected.includes(id)) return 'already_reserved'
      memoryReservations = [...selected, id]
      try { localStorage.setItem(storageKey, JSON.stringify(memoryReservations)) } catch { /* prévia em memória */ }
      return 'reserved'
    }
    return navigator.locks ? navigator.locks.request(storageKey, reserve) : reserve()
  }
  if (!client) throw new Error('A lista ainda não está disponível para reservas.')
  // Uma única operação no PostgreSQL decide quem conseguiu reservar.
  // Nunca fazemos SELECT seguido de UPDATE no navegador.
  const { data, error } = await client.rpc('reserve_gift', { p_gift_id: id })
    .abortSignal(AbortSignal.timeout(15000))
  if (error) throw error
  if (!['reserved', 'already_reserved', 'unavailable'].includes(data)) throw new Error('Resposta inesperada do banco.')
  return data
}

export function resetDemo() {
  if (!isDemo) return
  memoryReservations = []
  try { localStorage.removeItem(storageKey) } catch { /* prévia em memória */ }
}
