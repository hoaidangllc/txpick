-- Profit Split v2 migration — run in Supabase SQL Editor

alter table profit_split_history
  add column if not exists my_share_percent  numeric(7,4) not null default 0,
  add column if not exists my_gross_share    numeric(18,4) not null default 0;
