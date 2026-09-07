export type AccountType = 'checking' | 'savings' | 'investment';

export type CardBrand = 'visa' | 'mastercard' | 'elo' | 'amex' | 'other';

export type InvoiceStatus = 'open' | 'closed' | 'paid' | 'overdue';

export type TransactionType = 'income' | 'expense' | 'transfer';

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
  monthKey: string; // e.g. "2026-10"
  label: string; // e.g. "Out 26"
  monthNumber: number;
  year: number;
  totalAmount: number;
  cardBreakdown: Record<string, number>;
}
