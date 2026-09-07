export type AccountType = 'checking' | 'savings' | 'investment';

export type CardBrand = 'visa' | 'mastercard' | 'elo' | 'amex' | 'other';

export type InvoiceStatus = 'open' | 'closed' | 'paid' | 'overdue';

export type TransactionType = 'income' | 'expense' | 'transfer';

export type PaymentMethod =
  | 'pix'
  | 'boleto'
  | 'mercado_pago'
  | 'credit_card'
  | 'debit_card'
  | 'cash'
  | 'transfer';

export type EntityType = 'individual' | 'company';

export type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';

export interface PixKey {
  id: string;
  key_type: PixKeyType;
  key_value: string;
}

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  document?: string;
  email?: string;
  phone?: string;
  pix_keys: PixKey[];
  created_at?: string;
}

export interface RecurringTransaction {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  category: string;
  due_day: number; // 1-31
  payment_method?: PaymentMethod;
  account_id?: string;
  entity_id?: string;
  is_active: boolean;
  created_at?: string;
}

export interface BankAccount {
  id: string;
  name: string;
  type: AccountType;
  current_balance: number;
  color: string;
  account_number?: string;
  created_at?: string;
}

export interface CreditCard {
  id: string;
  name: string;
  account_id?: string;
  total_limit: number;
  available_limit: number;
  closing_day: number; // 1-31
  due_day: number; // 1-31
  card_brand: CardBrand;
  theme_color: string;
  last_digits?: string;
  created_at?: string;
}

export interface CardInvoice {
  id: string;
  credit_card_id: string;
  month: number; // 1-12
  year: number;
  due_date: string; // ISO format YYYY-MM-DD
  status: InvoiceStatus;
  total_amount: number;
  pdf_source_url?: string;
  created_at?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  date: string; // ISO string
  category: string;
  account_id?: string;
  credit_card_id?: string;
  invoice_id?: string;
  installment_group_id?: string;
  installment_current?: number;
  installment_total?: number;
  payment_method?: PaymentMethod;
  entity_id?: string;
  is_paid?: boolean;
  paid_at?: string;
  recurring_id?: string;
  created_at?: string;
}

export interface ParsedInvoiceItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  installment?: {
    current: number;
    total: number;
  };
  selected: boolean;
}

export interface MonthlyProjection {
  monthKey: string;
  label: string;
  monthNumber: number;
  year: number;
  totalAmount: number;
  cardBreakdown: Record<string, number>;
}
