import { supabase, isSupabaseConfigured } from './supabaseClient';
import type {
  BankAccount,
  CreditCard,
  CardInvoice,
  Transaction,
  Entity,
  RecurringTransaction,
} from '../types/financial';

export interface RemoteFinancialData {
  accounts: BankAccount[];
  cards: CreditCard[];
  invoices: CardInvoice[];
  transactions: Transaction[];
  entities: Entity[];
  recurringTransactions: RecurringTransaction[];
}

// Fetch all financial data for the logged-in user
export async function fetchRemoteFinancialData(): Promise<RemoteFinancialData | null> {
  if (!isSupabaseConfigured) return null;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  try {
    const [accRes, cardRes, invRes, txRes, entRes, recRes] = await Promise.all([
      supabase.from('bank_accounts').select('*'),
      supabase.from('credit_cards').select('*'),
      supabase.from('card_invoices').select('*'),
      supabase.from('transactions').select('*').order('date', { ascending: false }),
      supabase.from('entities').select('*'),
      supabase.from('recurring_transactions').select('*'),
    ]);

    if (accRes.error || cardRes.error || invRes.error || txRes.error || entRes.error || recRes.error) {
      console.warn('Supabase fetch returned error:', {
        accErr: accRes.error,
        cardErr: cardRes.error,
        invErr: invRes.error,
        txErr: txRes.error,
        entErr: entRes.error,
        recErr: recRes.error,
      });
      return null;
    }

    return {
      accounts: (accRes.data as BankAccount[]) || [],
      cards: (cardRes.data as CreditCard[]) || [],
      invoices: (invRes.data as CardInvoice[]) || [],
      transactions: (txRes.data as Transaction[]) || [],
      entities: (entRes.data as Entity[]) || [],
      recurringTransactions: (recRes.data as RecurringTransaction[]) || [],
    };
  } catch (err) {
    console.error('Error fetching remote financial data from Supabase:', err);
    return null;
  }
}

// Sync local data to remote (Upsert all)
export async function pushLocalDataToSupabase(data: RemoteFinancialData): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return false;

  try {
    if (data.accounts.length > 0) {
      await supabase.from('bank_accounts').upsert(data.accounts);
    }
    if (data.cards.length > 0) {
      await supabase.from('credit_cards').upsert(data.cards);
    }
    if (data.invoices.length > 0) {
      await supabase.from('card_invoices').upsert(data.invoices);
    }
    if (data.entities.length > 0) {
      await supabase.from('entities').upsert(data.entities);
    }
    if (data.recurringTransactions.length > 0) {
      await supabase.from('recurring_transactions').upsert(data.recurringTransactions);
    }
    if (data.transactions.length > 0) {
      await supabase.from('transactions').upsert(data.transactions);
    }
    return true;
  } catch (err) {
    console.error('Error pushing local data to Supabase:', err);
    return false;
  }
}

// Individual mutation helpers
export async function syncBankAccount(account: BankAccount) {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('bank_accounts').upsert(account);
  } catch (err) {
    console.error(err);
  }
}

export async function syncAccounts(accounts: BankAccount[]) {
  if (!isSupabaseConfigured || accounts.length === 0) return;
  try {
    await supabase.from('bank_accounts').upsert(accounts);
  } catch (err) {
    console.error(err);
  }
}

export async function syncCreditCard(card: CreditCard) {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('credit_cards').upsert(card);
  } catch (err) {
    console.error(err);
  }
}

export async function syncCards(cards: CreditCard[]) {
  if (!isSupabaseConfigured || cards.length === 0) return;
  try {
    await supabase.from('credit_cards').upsert(cards);
  } catch (err) {
    console.error(err);
  }
}

export async function syncInvoices(invoices: CardInvoice[]) {
  if (!isSupabaseConfigured || invoices.length === 0) return;
  try {
    await supabase.from('card_invoices').upsert(invoices);
  } catch (err) {
    console.error(err);
  }
}

export async function syncTransaction(transaction: Transaction) {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('transactions').upsert(transaction);
  } catch (err) {
    console.error(err);
  }
}

export async function syncTransactions(transactions: Transaction[]) {
  if (!isSupabaseConfigured || transactions.length === 0) return;
  try {
    await supabase.from('transactions').upsert(transactions);
  } catch (err) {
    console.error(err);
  }
}

export async function deleteTransactionRemote(id: string) {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('transactions').delete().eq('id', id);
  } catch (err) {
    console.error(err);
  }
}

export async function syncEntity(entity: Entity) {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('entities').upsert(entity);
  } catch (err) {
    console.error(err);
  }
}

export async function deleteEntityRemote(id: string) {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('entities').delete().eq('id', id);
  } catch (err) {
    console.error(err);
  }
}

export async function syncRecurring(recurring: RecurringTransaction) {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('recurring_transactions').upsert(recurring);
  } catch (err) {
    console.error(err);
  }
}

export async function deleteRecurringRemote(id: string) {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('recurring_transactions').delete().eq('id', id);
  } catch (err) {
    console.error(err);
  }
}
