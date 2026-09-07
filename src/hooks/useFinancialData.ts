import { useState, useEffect, useMemo } from 'react';
import type {
  BankAccount,
  CreditCard,
  CardInvoice,
  Transaction,
  ParsedInvoiceItem,
} from '../types/financial';
import {
  INITIAL_BANK_ACCOUNTS,
  INITIAL_CREDIT_CARDS,
  INITIAL_INVOICES,
  INITIAL_TRANSACTIONS,
} from '../services/mockData';
import { generateInstallmentTransactions } from '../utils/installmentCalculator';

const STORAGE_KEYS = {
  ACCOUNTS: 'dashbite_accounts_v1',
  CARDS: 'dashbite_cards_v1',
  INVOICES: 'dashbite_invoices_v1',
  TRANSACTIONS: 'dashbite_transactions_v1',
};

export function useFinancialData() {
  const [accounts, setAccounts] = useState<BankAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    return saved ? JSON.parse(saved) : INITIAL_BANK_ACCOUNTS;
  });

  const [cards, setCards] = useState<CreditCard[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CARDS);
    return saved ? JSON.parse(saved) : INITIAL_CREDIT_CARDS;
  });

  const [invoices, setInvoices] = useState<CardInvoice[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVOICES);
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  // Derived financial metrics
  const totalNetBalance = useMemo(() => {
    return accounts.reduce((sum, acc) => sum + acc.current_balance, 0);
  }, [accounts]);

  const totalCreditLimit = useMemo(() => {
    return cards.reduce((sum, card) => sum + card.total_limit, 0);
  }, [cards]);

  const totalAvailableCredit = useMemo(() => {
    return cards.reduce((sum, card) => sum + card.available_limit, 0);
  }, [cards]);

  const totalUsedCredit = useMemo(() => {
    return totalCreditLimit - totalAvailableCredit;
  }, [totalCreditLimit, totalAvailableCredit]);

  const creditUtilizationPercentage = useMemo(() => {
    if (totalCreditLimit === 0) return 0;
    return Math.round((totalUsedCredit / totalCreditLimit) * 100);
  }, [totalCreditLimit, totalUsedCredit]);

  const monthlyIncome = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    return transactions
      .filter((t) => {
        if (t.type !== 'income') return false;
        const d = new Date(t.date);
        return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const monthlyExpenses = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    return transactions
      .filter((t) => {
        if (t.type !== 'expense') return false;
        const d = new Date(t.date);
        return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  // Next upcoming credit card invoice
  const nextUpcomingInvoice = useMemo(() => {
    const openInvoices = invoices.filter((i) => i.status === 'open');
    if (openInvoices.length === 0) return null;

    openInvoices.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
    const nextInv = openInvoices[0];
    const card = cards.find((c) => c.id === nextInv.credit_card_id);

    return {
      invoice: nextInv,
      card,
    };
  }, [invoices, cards]);

  // Add new single or installment transaction
  const addTransaction = (newTxData: {
    type: 'income' | 'expense' | 'transfer';
    description: string;
    amount: number;
    date: string;
    category: string;
    account_id?: string;
    credit_card_id?: string;
    installmentTotal?: number;
  }) => {
    const {
      type,
      description,
      amount,
      date,
      category,
      account_id,
      credit_card_id,
      installmentTotal = 1,
    } = newTxData;

    // Case 1: Credit Card Purchase with Smart Installments (> 1)
    if (credit_card_id && type === 'expense' && installmentTotal > 1) {
      const card = cards.find((c) => c.id === credit_card_id);
      if (!card) return;

      const result = generateInstallmentTransactions({
        description,
        totalAmount: amount,
        date,
        category,
        creditCard: card,
        installmentTotal,
        existingInvoices: invoices,
      });

      setCards((prev) => prev.map((c) => (c.id === card.id ? result.updatedCard : c)));
      setInvoices(result.generatedInvoices);
      setTransactions((prev) => [...result.transactions, ...prev]);
      return;
    }

    // Case 2: Single Credit Card purchase (1 installment)
    if (credit_card_id && type === 'expense') {
      const card = cards.find((c) => c.id === credit_card_id);
      if (card) {
        const result = generateInstallmentTransactions({
          description,
          totalAmount: amount,
          date,
          category,
          creditCard: card,
          installmentTotal: 1,
          existingInvoices: invoices,
        });

        setCards((prev) => prev.map((c) => (c.id === card.id ? result.updatedCard : c)));
        setInvoices(result.generatedInvoices);
        setTransactions((prev) => [...result.transactions, ...prev]);
        return;
      }
    }

    // Case 3: Debit/Account Transaction (Income or Expense)
    const singleTx: Transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type,
      description,
      amount,
      date,
      category,
      account_id,
      created_at: new Date().toISOString(),
    };

    if (account_id) {
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id !== account_id) return acc;
          const delta = type === 'income' ? amount : -amount;
          return {
            ...acc,
            current_balance: acc.current_balance + delta,
          };
        })
      );
    }

    setTransactions((prev) => [singleTx, ...prev]);
  };

  // Import items reconciled from PDF Invoice Parser
  const importParsedInvoiceItems = (items: ParsedInvoiceItem[], creditCardId: string) => {
    const card = cards.find((c) => c.id === creditCardId);
    if (!card) return;

    let updatedCard = { ...card };
    let currentInvoices = [...invoices];
    const newTxs: Transaction[] = [];

    items.forEach((item) => {
      if (!item.selected) return;

      const instTotal = item.installment?.total || 1;
      const result = generateInstallmentTransactions({
        description: item.description,
        totalAmount: item.amount * instTotal,
        date: item.date,
        category: item.category,
        creditCard: updatedCard,
        installmentTotal: instTotal,
        existingInvoices: currentInvoices,
      });

      updatedCard = result.updatedCard;
      currentInvoices = result.generatedInvoices;
      newTxs.push(...result.transactions);
    });

    setCards((prev) => prev.map((c) => (c.id === card.id ? updatedCard : c)));
    setInvoices(currentInvoices);
    setTransactions((prev) => [...newTxs, ...prev]);
  };

  // Add Bank Account
  const addBankAccount = (accData: Omit<BankAccount, 'id'>) => {
    const newAcc: BankAccount = {
      ...accData,
      id: `acc_${Date.now()}`,
    };
    setAccounts((prev) => [...prev, newAcc]);
  };

  // Add Credit Card
  const addCreditCard = (cardData: Omit<CreditCard, 'id' | 'available_limit'>) => {
    const newCard: CreditCard = {
      ...cardData,
      id: `card_${Date.now()}`,
      available_limit: cardData.total_limit,
    };
    setCards((prev) => [...prev, newCard]);
  };

  // Transfer between bank accounts
  const transferBetweenAccounts = (fromAccountId: string, toAccountId: string, amount: number) => {
    if (fromAccountId === toAccountId || amount <= 0) return;

    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === fromAccountId) {
          return { ...acc, current_balance: acc.current_balance - amount };
        }
        if (acc.id === toAccountId) {
          return { ...acc, current_balance: acc.current_balance + amount };
        }
        return acc;
      })
    );

    const transferTx: Transaction = {
      id: `tx_trf_${Date.now()}`,
      type: 'transfer',
      description: 'Transferência entre contas',
      amount,
      date: new Date().toISOString().split('T')[0],
      category: 'Transferência',
      account_id: fromAccountId,
      created_at: new Date().toISOString(),
    };

    setTransactions((prev) => [transferTx, ...prev]);
  };

  // Delete transaction
  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Pay invoice
  const payInvoice = (invoiceId: string, bankAccountId: string) => {
    const invoice = invoices.find((i) => i.id === invoiceId);
    const card = cards.find((c) => c.id === invoice?.credit_card_id);
    if (!invoice || !card) return;

    // Deduct amount from bank account
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === bankAccountId) {
          return { ...acc, current_balance: acc.current_balance - invoice.total_amount };
        }
        return acc;
      })
    );

    // Restore available limit on card
    setCards((prev) =>
      prev.map((c) => {
        if (c.id === card.id) {
          return {
            ...c,
            available_limit: Math.min(c.total_limit, c.available_limit + invoice.total_amount),
          };
        }
        return c;
      })
    );

    // Mark invoice paid
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: 'paid' as const } : inv))
    );
  };

  // Reset demo data
  const resetToDemoData = () => {
    setAccounts(INITIAL_BANK_ACCOUNTS);
    setCards(INITIAL_CREDIT_CARDS);
    setInvoices(INITIAL_INVOICES);
    setTransactions(INITIAL_TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
    localStorage.removeItem(STORAGE_KEYS.CARDS);
    localStorage.removeItem(STORAGE_KEYS.INVOICES);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
  };

  return {
    accounts,
    cards,
    invoices,
    transactions,
    totalNetBalance,
    totalCreditLimit,
    totalAvailableCredit,
    totalUsedCredit,
    creditUtilizationPercentage,
    monthlyIncome,
    monthlyExpenses,
    nextUpcomingInvoice,
    addTransaction,
    importParsedInvoiceItems,
    addBankAccount,
    addCreditCard,
    transferBetweenAccounts,
    deleteTransaction,
    payInvoice,
    resetToDemoData,
  };
}
