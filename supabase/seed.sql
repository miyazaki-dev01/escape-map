insert into public.health_checks
  (status, note, created_at)
values
  ('ok', 'local seed: baseline', now()),
  ('api-ok', 'local seed: via api check', now());
