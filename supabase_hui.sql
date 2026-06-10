-- Hui / Group Pot Module — run in Supabase SQL Editor

create table if not exists hui_groups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  member_count int not null default 2,
  amount_per_member numeric(18,4) not null default 0,
  start_date date,
  frequency text not null default 'monthly', -- weekly | biweekly | monthly
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists hui_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  group_id uuid references hui_groups(id) on delete cascade not null,
  name text not null,
  phone text,
  note text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists hui_rounds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  group_id uuid references hui_groups(id) on delete cascade not null,
  round_number int not null,
  round_date date not null,
  winner_member_id uuid references hui_members(id) on delete set null,
  winner_name text,
  bid_amount numeric(18,4) not null default 0,
  gross_pot numeric(18,4) not null,
  winner_receive numeric(18,4) not null,
  bonus_per_remaining numeric(18,4) not null default 0,
  remaining_unpaid_count int not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

-- RLS
alter table hui_groups  enable row level security;
alter table hui_members enable row level security;
alter table hui_rounds  enable row level security;

create policy "Users manage own hui_groups"
  on hui_groups for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own hui_members"
  on hui_members for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own hui_rounds"
  on hui_rounds for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Indexes
create index if not exists hui_groups_user_id  on hui_groups(user_id);
create index if not exists hui_members_group_id on hui_members(group_id);
create index if not exists hui_rounds_group_id  on hui_rounds(group_id);
create index if not exists hui_rounds_created_at on hui_rounds(created_at desc);
