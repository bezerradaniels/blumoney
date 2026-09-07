import { createClient } from '@supabase/supabase-js';
import type { BankAccount, CreditCard, CardInvoice, Transaction } from '../types/financial';

export interface Database {
  public: {
    Tables: {
      bank_accounts: {
        Row: BankAccount;
        Insert: Omit<BankAccount, 'id'> & { id?: string };
        Update: Partial<BankAccount>;
      };
      credit_cards: {
        Row: CreditCard;
        Insert: Omit<CreditCard, 'id'> & { id?: string };
        Update: Partial<CreditCard>;
      };
      card_invoices: {
        Row: CardInvoice;
        Insert: Omit<CardInvoice, 'id'> & { id?: string };
        Update: Partial<CardInvoice>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, 'id'> & { id?: string };
        Update: Partial<Transaction>;
      };
    };
  };
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
