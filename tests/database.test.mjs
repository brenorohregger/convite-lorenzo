import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'
import { demoGifts } from '../src/data/gifts.js'

const schema = await readFile(new URL('../supabase/schema.sql', import.meta.url), 'utf8')
let db
before(async () => {
  db = new PGlite()
  await db.exec('create role anon; create role authenticated; create role sem_acesso;')
  await db.exec(schema)
})
after(async () => { await db.close() })

test('as nove sugestões e tamanhos correspondem ao modelo e à prévia', async () => {
  const { rows } = await db.query('select id,title,description,category,icon,sort_order,reserved_at from public.gifts order by sort_order')
  assert.deepEqual(rows, demoGifts)
})

test('o visitante lê a lista, mas não edita, inclui ou apaga presentes diretamente', async () => {
  await db.exec('set role anon')
  assert.equal((await db.query('select * from public.gifts')).rows.length, 9)
  for (const sql of ["update public.gifts set reserved_at = null", "delete from public.gifts", "insert into public.gifts(id,title) values ('falso','Falso')"]) {
    await assert.rejects(() => db.exec(sql), /permission denied/)
  }
  await db.exec('reset role')
})

test('uma reserva anônima persiste e todas as próximas tentativas são recusadas', async () => {
  await db.exec('set role anon')
  const first = await db.query("select public.reserve_gift('perfume') as result")
  assert.equal(first.rows[0].result, 'reserved')
  const attempts = await Promise.all(Array.from({ length: 20 }, () => db.query("select public.reserve_gift('perfume') as result")))
  assert.ok(attempts.every(r => r.rows[0].result === 'already_reserved'))
  const { rows } = await db.query("select reserved_at from public.gifts where id='perfume'")
  assert.ok(rows[0].reserved_at)
  await db.exec('reset role')
})

test('identificadores inexistentes, nulos e excessivos não fazem reservas', async () => {
  for (const value of ['nao-existe', null, 'x'.repeat(101)]) {
    const { rows } = await db.query('select public.reserve_gift($1) as result', [value])
    assert.equal(rows[0].result, 'unavailable')
  }
})

test('presentes inativos ficam ocultos e não podem ser reservados', async () => {
  await db.exec("update public.gifts set active=false where id='casaco-5'; set role anon")
  assert.equal((await db.query("select * from public.gifts where id='casaco-5'")).rows.length, 0)
  assert.equal((await db.query("select public.reserve_gift('casaco-5') as result")).rows[0].result, 'unavailable')
  await db.exec('reset role')
})

test('somente os papéis autorizados conseguem executar a função', async () => {
  await db.exec('grant usage on schema public to sem_acesso; set role sem_acesso')
  await assert.rejects(() => db.query("select public.reserve_gift('calca-5')"), /permission denied/)
  await db.exec('reset role; set role authenticated')
  assert.equal((await db.query("select public.reserve_gift('calca-5') as result")).rows[0].result, 'reserved')
  await db.exec('reset role')
})

test('executar a instalação de novo não libera presentes reservados', async () => {
  await db.exec(schema)
  assert.equal((await db.query("select public.reserve_gift('perfume') as result")).rows[0].result, 'already_reserved')
  assert.equal((await db.query('select count(*)::integer as n from public.gifts')).rows[0].n, 9)
})
