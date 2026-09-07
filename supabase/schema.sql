-- Schema SQL Completo para o projeto DashBite Finance no Supabase Project: bsvuplgmkqhzhhmnvtpp

-- 1. Tabela de Contas Bancárias
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('checking', 'savings', 'investment')),
  current_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  color TEXT NOT NULL DEFAULT '#34d399',
  account_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tabela de Cartões de Crédito
CREATE TABLE IF NOT EXISTS public.credit_cards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  account_id TEXT REFERENCES public.bank_accounts(id) ON DELETE SET NULL,
  total_limit NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  available_limit NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  closing_day INT NOT NULL CHECK (closing_day BETWEEN 1 AND 31),
  due_day INT NOT NULL CHECK (due_day BETWEEN 1 AND 31),
  card_brand TEXT NOT NULL DEFAULT 'other',
  theme_color TEXT NOT NULL DEFAULT '#34d399',
  last_digits TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabela de Faturas de Cartão
CREATE TABLE IF NOT EXISTS public.card_invoices (
  id TEXT PRIMARY KEY,
  credit_card_id TEXT NOT NULL REFERENCES public.credit_cards(id) ON DELETE CASCADE,
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INT NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'closed', 'paid', 'overdue')),
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  pdf_source_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Tabela de Pessoas e Empresas (Contatos/Fornecedores)
CREATE TABLE IF NOT EXISTS public.entities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('individual', 'company')),
  document TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Tabela de Chaves PIX vinculadas às Pessoas/Empresas
CREATE TABLE IF NOT EXISTS public.entity_pix_keys (
  id TEXT PRIMARY KEY,
  entity_id TEXT NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  key_type TEXT NOT NULL CHECK (key_type IN ('cpf', 'cnpj', 'email', 'phone', 'random')),
  key_value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Tabela de Transações Fixas / Recorrentes
CREATE TABLE IF NOT EXISTS public.recurring_transactions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  description TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  category TEXT NOT NULL DEFAULT 'Moradia',
  due_day INT NOT NULL CHECK (due_day BETWEEN 1 AND 31),
  payment_method TEXT DEFAULT 'pix',
  account_id TEXT REFERENCES public.bank_accounts(id) ON DELETE SET NULL,
  entity_id TEXT REFERENCES public.entities(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Tabela de Transações
CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  description TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  category TEXT NOT NULL DEFAULT 'Geral',
  account_id TEXT REFERENCES public.bank_accounts(id) ON DELETE SET NULL,
  credit_card_id TEXT REFERENCES public.credit_cards(id) ON DELETE SET NULL,
  invoice_id TEXT REFERENCES public.card_invoices(id) ON DELETE SET NULL,
  installment_group_id TEXT,
  installment_current INT,
  installment_total INT,
  payment_method TEXT DEFAULT 'pix',
  entity_id TEXT REFERENCES public.entities(id) ON DELETE SET NULL,
  is_paid BOOLEAN NOT NULL DEFAULT true,
  paid_at TIMESTAMPTZ,
  recurring_id TEXT REFERENCES public.recurring_transactions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security) em todas as tabelas
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_pix_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para acesso total
CREATE POLICY "Permitir acesso completo a bank_accounts" ON public.bank_accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso completo a credit_cards" ON public.credit_cards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso completo a card_invoices" ON public.card_invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso completo a entities" ON public.entities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso completo a entity_pix_keys" ON public.entity_pix_keys FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso completo a recurring_transactions" ON public.recurring_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso completo a transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);
