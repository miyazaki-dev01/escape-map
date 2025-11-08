-- 疎通テーブル
create table if not exists public.health_checks (
  id uuid primary key default gen_random_uuid(),
  status text not null,
  note text,
  created_at timestamptz not null default now()
);

-- RLS設定
alter table public.health_checks enable row level security;

-- ポリシー設定
create policy "read health checks"
on public.health_checks
for select to anon, authenticated
using (true);