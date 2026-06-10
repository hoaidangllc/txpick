-- Hui v3 migration — run AFTER supabase_hui.sql and supabase_hui_v2.sql

alter table hui_members
  add column if not exists paid_rounds_count numeric(10,2) not null default 0,
  add column if not exists owed_rounds_count numeric(10,2) not null default 0,
  add column if not exists previous_debt     numeric(18,4) not null default 0;
