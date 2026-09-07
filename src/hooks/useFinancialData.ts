import { useState, useEffect, useMemo } from 'react';
import type {
  BankAccount,
  CreditCard,
  CardInvoice,
  Transaction,
  ParsedInvoiceItem,
  Entity,
  RecurringTransaction,
  PaymentMethod,
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
  ENTITIES: 'dashbite_entities_v1',
  RECURRING: 'dashbite_recurring_v1',
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

  const [entities, setEntities] = useState<Entity[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ENTITIES);
    return saved ? JSON.parse(saved) : [];
  });

  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RECURRING);
    return saved ? JSON.parse(saved) : [];
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ENTITIES, JSON.stringify(entities));
  }, [entities]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(recurringTransactions));
  }, [recurringTransactions]);

  // Self-healing: reconcile any paid non-card transactions missing account_id
  useEffect(() => {
    const unassignedPaidTxs = transactions.filter(
      (t) => (t.type === 'income' || t.type === 'expense') && !t.credit_card_id && (t.is_paid !== false) && (!t.account_id || t.account_id === '')
    );

    if (unassignedPaidTxs.length > 0) {
      let mainAcc = accounts[0];
      let updatedAccounts = [...accounts];

      if (!mainAcc) {
        mainAcc = {
          id: `acc_main_${Date.now()}`,
          name: 'Conta Principal',
          type: 'checking',
          current_balance: 0,
          color: '#10b981',
        };
        updatedAccounts = [mainAcc];
      }

      let totalDelta = 0;
      const updatedTxs = transactions.map((t) => {
        if ((t.type === 'income' || t.type === 'expense') && !t.credit_card_id && (t.is_paid !== false) && (!t.account_id || t.account_id === '')) {
          const delta = t.type === 'income' ? t.amount : -t.amount;
          totalDelta += delta;
          return { ...t, account_id: mainAcc.id };
        }
        return t;
      });

      updatedAccounts = updatedAccounts.map((acc) =>
        acc.id === mainAcc.id ? { ...acc, current_balance: acc.current_balance + totalDelta } : acc
      );

      setAccounts(updatedAccounts);
      setTransactions(updatedTxs);
    }
  }, []);

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
    payment_method?: PaymentMethod;
    entity_id?: string;
    is_paid?: boolean;
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
      payment_method,
      entity_id,
      is_paid = true,
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

      const updatedTxs = result.transactions.map((tx) => ({
        ...tx,
        payment_method: payment_method || ('credit_card' as PaymentMethod),
        entity_id,
        is_paid,
      }));

      setCards((prev) => prev.map((c) => (c.id === card.id ? result.updatedCard : c)));
      setInvoices(result.generatedInvoices);
      setTransactions((prev) => [...updatedTxs, ...prev]);
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

        const updatedTxs = result.transactions.map((tx) => ({
          ...tx,
          payment_method: payment_method || ('credit_card' as PaymentMethod),
          entity_id,
          is_paid,
        }));

        setCards((prev) => prev.map((c) => (c.id === card.id ? result.updatedCard : c)));
        setInvoices(result.generatedInvoices);
        setTransactions((prev) => [...updatedTxs, ...prev]);
        return;
      }
    }

    // Case 3: Debit/Account Transaction (Income or Expense)
    let targetAccountId = account_id || (accounts[0] ? accounts[0].id : undefined);
    let currentAccounts = [...accounts];

    if (!targetAccountId && currentAccounts.length === 0) {
      const defaultAcc: BankAccount = {
        id: `acc_main_${Date.now()}`,
        name: 'Conta Principal',
        type: 'checking',
        current_balance: 0,
        color: '#10b981',
      };
      targetAccountId = defaultAcc.id;
      currentAccounts = [defaultAcc];
    }

    const singleTx: Transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      type,
      description,
      amount,
      date,
      category,
      account_id: targetAccountId,
      payment_method: payment_method || 'pix',
      entity_id,
      is_paid,
      created_at: new Date().toISOString(),
    };

    if (targetAccountId && is_paid) {
      currentAccounts = currentAccounts.map((acc) => {
        if (acc.id !== targetAccountId) return acc;
        const delta = type === 'income' ? amount : -amount;
        return {
          ...acc,
          current_balance: acc.current_balance + delta,
        };
      });
    }

    setAccounts(currentAccounts);
    setTransactions((prev) => [singleTx, ...prev]);
  };

  // Toggle paid status on a transaction
  const togglePaidTransaction = (txId: string, isPaid: boolean) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id !== txId) return t;

        const targetAccountId = t.account_id || (accounts[0] ? accounts[0].id : undefined);

        // If paid status changes, adjust bank account balance accordingly
        if (targetAccountId && t.is_paid !== isPaid) {
          const delta = t.type === 'income' ? t.amount : -t.amount;
          const sign = isPaid ? 1 : -1;

          setAccounts((accs) =>
            accs.map((a) => (a.id === targetAccountId ? { ...a, current_balance: a.current_balance + delta * sign } : a))
          );
        }

        return {
          ...t,
          account_id: targetAccountId,
          is_paid: isPaid,
          paid_at: isPaid ? new Date().toISOString() : undefined,
        };
      })
    );
  };

  // Entity Management (Pessoas e Empresas)
  const addEntity = (entityData: Omit<Entity, 'id'>) => {
    const newEntity: Entity = {
      ...entityData,
      id: `ent_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      created_at: new Date().toISOString(),
    };
    setEntities((prev) => [...prev, newEntity]);
  };

  const updateEntity = (id: string, entityData: Omit<Entity, 'id'>) => {
    setEntities((prev) =>
      prev.map((e) => (e.id === id ? { ...entityData, id } : e))
    );
  };

  const deleteEntity = (id: string) => {
    setEntities((prev) => prev.filter((e) => e.id !== id));
  };

  // Recurring Transactions Management (Transações Fixas)
  const addRecurring = (recurringData: Omit<RecurringTransaction, 'id'>) => {
    const newRec: RecurringTransaction = {
      ...recurringData,
      id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      created_at: new Date().toISOString(),
    };
    setRecurringTransactions((prev) => [...prev, newRec]);

    // Automatically generate item into current month transactions as PENDENTE
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(newRec.due_day).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    addTransaction({
      type: newRec.type,
      description: newRec.description,
      amount: newRec.amount,
      date: formattedDate,
      category: newRec.category,
      account_id: newRec.account_id,
      payment_method: newRec.payment_method || 'pix',
      entity_id: newRec.entity_id,
      is_paid: false,
    });
  };

  const updateRecurring = (id: string, recurringData: Omit<RecurringTransaction, 'id'>) => {
    setRecurringTransactions((prev) =>
      prev.map((r) => (r.id === id ? { ...recurringData, id } : r))
    );
  };

  const deleteRecurring = (id: string) => {
    setRecurringTransactions((prev) => prev.filter((r) => r.id !== id));
  };

  // Generate current month transactions from all active recurring items
  const generateMonthlyTransactions = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');

    recurringTransactions.forEach((rec) => {
      if (!rec.is_active) return;
      const day = String(rec.due_day).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      addTransaction({
        type: rec.type,
        description: rec.description,
        amount: rec.amount,
        date: formattedDate,
        category: rec.category,
        account_id: rec.account_id,
        payment_method: rec.payment_method || 'pix',
        entity_id: rec.entity_id,
        is_paid: false,
      });
    });
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
      payment_method: 'transfer',
      is_paid: true,
      created_at: new Date().toISOString(),
    };

    setTransactions((prev) => [transferTx, ...prev]);
  };

  // Delete transaction
  const deleteTransaction = (id: string) => {
    const txToDelete = transactions.find((t) => t.id === id);
    if (txToDelete && txToDelete.is_paid !== false && txToDelete.account_id && txToDelete.type !== 'transfer') {
      const delta = txToDelete.type === 'income' ? txToDelete.amount : -txToDelete.amount;
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === txToDelete.account_id
            ? { ...acc, current_balance: acc.current_balance - delta }
            : acc
        )
      );
    }
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Pay invoice
  const payInvoice = (invoiceId: string, bankAccountId: string) => {
    const invoice = invoices.find((i) => i.id === invoiceId);
    const card = cards.find((c) => c.id === invoice?.credit_card_id);
    if (!invoice || !card) return;

    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === bankAccountId) {
          return { ...acc, current_balance: acc.current_balance - invoice.total_amount };
        }
        return acc;
      })
    );

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
    setEntities([]);
    setRecurringTransactions([]);
    localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
    localStorage.removeItem(STORAGE_KEYS.CARDS);
    localStorage.removeItem(STORAGE_KEYS.INVOICES);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.ENTITIES);
    localStorage.removeItem(STORAGE_KEYS.RECURRING);
  };

  return {
    accounts,
    cards,
    invoices,
    transactions,
    entities,
    recurringTransactions,
    totalNetBalance,
    totalCreditLimit,
    totalAvailableCredit,
    totalUsedCredit,
    creditUtilizationPercentage,
    monthlyIncome,
    monthlyExpenses,
    nextUpcomingInvoice,
    addTransaction,
    togglePaidTransaction,
    importParsedInvoiceItems,
    addBankAccount,
    addCreditCard,
    transferBetweenAccounts,
    deleteTransaction,
    payInvoice,
    addEntity,
    updateEntity,
    deleteEntity,
    addRecurring,
    updateRecurring,
    deleteRecurring,
    generateMonthlyTransactions,
    resetToDemoData,
  };
}
