-- Мировая таблица рекордов для «Жизнь — симулятор».
-- Supabase → SQL Editor → New query → вставить всё → Run. Повторный запуск безопасен.

create table if not exists public.lives (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  pid        text not null check (pid ~ '^[a-z0-9]{12,40}$'),
  nick       text not null check (char_length(nick) between 2 and 20),
  score      int  not null check (score between 0 and 3000),
  grade      text check (grade in ('S','A','B','C','D','F')),
  age        int  not null check (age between 0 and 130),
  country    text check (char_length(country) <= 6),
  flag       text check (char_length(flag) <= 16),
  born       int  check (born between 1850 and 2200),
  died       int  check (died between 1850 and 2300),
  cause      text check (char_length(cause) <= 80),
  ach        int  check (ach between 0 and 1000),
  kids       int  check (kids between 0 and 100),
  daily      text check (daily ~ '^\d{4}-\d{2}-\d{2}$'),
  mode       text check (char_length(mode) <= 20),
  lang       text check (lang in ('ru','en','uk')),
  check (died >= born)
);
create index if not exists lives_score_idx   on public.lives (score desc);
create index if not exists lives_daily_idx   on public.lives (daily, score desc);
create index if not exists lives_country_idx on public.lives (country, score desc);
create index if not exists lives_created_idx on public.lives (created_at);
create index if not exists lives_pid_idx     on public.lives (pid, created_at);

-- Читать могут все, добавлять могут все, менять и удалять никто (кроме вас в панели Supabase).
alter table public.lives enable row level security;
drop policy if exists "lives read"   on public.lives;
drop policy if exists "lives insert" on public.lives;
create policy "lives read"   on public.lives for select to anon, authenticated using (true);
create policy "lives insert" on public.lives for insert to anon, authenticated with check (true);
grant select, insert on public.lives to anon, authenticated;

-- Не больше 30 результатов в час с одного устройства; время ставит сервер.
create or replace function public.lives_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.lives where pid = new.pid and created_at > now() - interval '1 hour') >= 30 then
    raise exception 'rate limit';
  end if;
  new.created_at := now();
  return new;
end $$;
drop trigger if exists lives_guard on public.lives;
create trigger lives_guard before insert on public.lives for each row execute function public.lives_guard();
