-- Execute todo este arquivo no SQL Editor do SEU projeto Supabase.
-- Não solicita login dos convidados e não registra nomes ou e-mails.
begin;

create table if not exists public.gifts (
  id text primary key check (char_length(id) between 1 and 100),
  title text not null,
  description text not null default '',
  category text not null default 'Presentes',
  icon text not null default 'gift',
  sort_order integer not null default 0,
  active boolean not null default true,
  reserved_at timestamptz
);

alter table public.gifts enable row level security;
revoke all on table public.gifts from public, anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select on table public.gifts to anon, authenticated;

drop policy if exists "Convidados leem presentes ativos" on public.gifts;
create policy "Convidados leem presentes ativos" on public.gifts
  for select to anon, authenticated using (active = true);

-- Escrita restrita: os convidados só podem fazer uma reserva nesta função.
-- SECURITY DEFINER é necessário porque UPDATE direto não é concedido ao visitante.
-- search_path vazio e nomes qualificados evitam desvio para objetos de outro schema.
create or replace function public.reserve_gift(p_gift_id text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  chosen_id text;
begin
  if p_gift_id is null or char_length(p_gift_id) not between 1 and 100 then
    return 'unavailable';
  end if;

  -- UPDATE condicional é atômico. Se duas pessoas tentarem ao mesmo tempo,
  -- o PostgreSQL bloqueia a linha e reavalia a condição após a primeira reserva.
  update public.gifts
     set reserved_at = pg_catalog.statement_timestamp()
   where id = p_gift_id and active = true and reserved_at is null
   returning id into chosen_id;

  if chosen_id is not null then return 'reserved'; end if;
  if exists (select 1 from public.gifts where id = p_gift_id and active = true) then
    return 'already_reserved';
  end if;
  return 'unavailable';
end;
$$;

revoke all on function public.reserve_gift(text) from public, anon, authenticated;
grant execute on function public.reserve_gift(text) to anon, authenticated;

-- ON CONFLICT DO NOTHING preserva presentes e reservas ao executar de novo.
insert into public.gifts (id, title, description, category, icon, sort_order) values
('perfume', 'Perfume', 'Um cheirinho para acompanhar as aventuras.', 'Cuidados', 'perfume', 1),
('tenis-25-1', 'Tênis', 'Tamanho 25 · opção 1 de 2', 'Calçados', 'shoe', 2),
('tenis-25-2', 'Tênis', 'Tamanho 25 · opção 2 de 2', 'Calçados', 'shoe', 3),
('calca-5', 'Calça', 'Tamanho 5', 'Roupinhas', 'pants', 4),
('conjunto-5', 'Conjunto', 'Tamanho 5', 'Roupinhas', 'outfit', 5),
('casaco-5', 'Casaco', 'Tamanho 5', 'Roupinhas', 'jacket', 6),
('homem-aranha', 'Brinquedo do Homem-Aranha', 'Para muitas missões e brincadeiras!', 'Diversão', 'spider', 7),
('brinquedo-1', 'Brinquedo', 'Escolha livre · opção 1 de 2', 'Diversão', 'blocks', 8),
('brinquedo-2', 'Brinquedo', 'Escolha livre · opção 2 de 2', 'Diversão', 'rocket', 9)
on conflict (id) do nothing;

commit;
