-- 1. CONTAS BANCÁRIAS (bank_accounts)
create table if not exists public.bank_accounts (
  id text primary key,
  user_id uuid default auth.uid(),
  name text not null,
  type text not null check (type in ('checking', 'savings', 'investment')),
  current_balance numeric not null default 0,
  color text not null default '#10b981',
  account_number text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.bank_accounts add column if not exists user_id uuid default auth.uid();

-- 2. CARTÕES DE CRÉDITO (credit_cards)
create table if not exists public.credit_cards (
  id text primary key,
  user_id uuid default auth.uid(),
  name text not null,
  account_id text,
  total_limit numeric not null default 0,
  available_limit numeric not null default 0,
  closing_day integer not null check (closing_day >= 1 and closing_day <= 31),
  due_day integer not null check (due_day >= 1 and due_day <= 31),
  card_brand text not null default 'other',
  theme_color text not null default '#6366f1',
  last_digits text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.credit_cards add column if not exists user_id uuid default auth.uid();

-- 3. FATURAS DE CARTÃO (card_invoices)
create table if not exists public.card_invoices (
  id text primary key,
  user_id uuid default auth.uid(),
  credit_card_id text not null references public.credit_cards(id) on delete cascade,
  month integer not null check (month >= 1 and month <= 12),
  year integer not null,
  due_date text not null,
  status text not null check (status in ('open', 'closed', 'paid', 'overdue')),
  total_amount numeric not null default 0,
  pdf_source_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.card_invoices add column if not exists user_id uuid default auth.uid();

-- 4. PESSOAS E EMPRESAS / FAVORECIDOS (entities)
create table if not exists public.entities (
  id text primary key,
  user_id uuid default auth.uid(),
  name text not null,
  type text not null check (type in ('individual', 'company')),
  document text,
  email text,
  phone text,
  pix_keys jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.entities add column if not exists user_id uuid default auth.uid();

-- 5. TRANSAÇÕES FIXAS / RECORRENTES (recurring_transactions)
create table if not exists public.recurring_transactions (
  id text primary key,
  user_id uuid default auth.uid(),
  type text not null check (type in ('income', 'expense')),
  description text not null,
  amount numeric not null default 0,
  category text not null,
  due_day integer not null check (due_day >= 1 and due_day <= 31),
  payment_method text default 'pix',
  account_id text,
  entity_id text,
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.recurring_transactions add column if not exists user_id uuid default auth.uid();

-- 6. TRANSAÇÕES FINANCEIRAS (transactions)
create table if not exists public.transactions (
  id text primary key,
  user_id uuid default auth.uid(),
  type text not null check (type in ('income', 'expense', 'transfer')),
  description text not null,
  amount numeric not null default 0,
  date text not null,
  category text not null,
  account_id text,
  credit_card_id text,
  invoice_id text,
  installment_group_id text,
  installment_current integer,
  installment_total integer,
  payment_method text default 'pix',
  entity_id text,
  is_paid boolean default true,
  paid_at timestamp with time zone,
  recurring_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.transactions add column if not exists user_id uuid default auth.uid();

-- SEGURANÇA: HABILITAR ROW LEVEL SECURITY (RLS)
alter table public.bank_accounts enable row level security;
alter table public.credit_cards enable row level security;
alter table public.card_invoices enable row level security;
alter table public.entities enable row level security;
alter table public.recurring_transactions enable row level security;
alter table public.transactions enable row level security;

-- POLÍTICAS RLS
drop policy if exists "Users can manage their own bank_accounts" on public.bank_accounts;
create policy "Users can manage their own bank_accounts" on public.bank_accounts
  for all to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

drop policy if exists "Users can manage their own credit_cards" on public.credit_cards;
create policy "Users can manage their own credit_cards" on public.credit_cards
  for all to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

drop policy if exists "Users can manage their own card_invoices" on public.card_invoices;
create policy "Users can manage their own card_invoices" on public.card_invoices
  for all to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

drop policy if exists "Users can manage their own entities" on public.entities;
create policy "Users can manage their own entities" on public.entities
  for all to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

drop policy if exists "Users can manage their own recurring_transactions" on public.recurring_transactions;
create policy "Users can manage their own recurring_transactions" on public.recurring_transactions
  for all to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

drop policy if exists "Users can manage their own transactions" on public.transactions;
create policy "Users can manage their own transactions" on public.transactions
  for all to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

-- PERMISSÕES DE ROLE
grant select, insert, update, delete on public.bank_accounts to authenticated;
grant select, insert, update, delete on public.credit_cards to authenticated;
grant select, insert, update, delete on public.card_invoices to authenticated;
grant select, insert, update, delete on public.entities to authenticated;
grant select, insert, update, delete on public.recurring_transactions to authenticated;
grant select, insert, update, delete on public.transactions to authenticated;
