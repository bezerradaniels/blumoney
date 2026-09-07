import React, { useState } from 'react';
import type { Transaction, BankAccount, CreditCard, Entity } from '../types/financial';
import { RecentTransactionsTable } from '../components/dashboard/RecentTransactionsTable';
import { Button } from '../components/ui/Button';
import { Plus, Search, Receipt } from 'lucide-react';

interface TransactionsViewProps {
  transactions: Transaction[];
  accounts: BankAccount[];
  cards: CreditCard[];
  entities?: Entity[];
  onOpenNewTransaction: () => void;
  onDeleteTransaction: (id: string) => void;
  onTogglePaid?: (id: string, isPaid: boolean) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  accounts,
  cards,
  entities = [],
  onOpenNewTransaction,
  onDeleteTransaction,
  onTogglePaid,
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  const filteredTransactions = transactions.filter((tx) => {
    // Search Query
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchDesc = tx.description.toLowerCase().includes(q);
      const matchCat = tx.category.toLowerCase().includes(q);
      if (!matchDesc && !matchCat) return false;
    }

    // Type Filter
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

    // Category Filter
    if (categoryFilter !== 'all' && tx.category !== categoryFilter) return false;

    // Source Filter
    if (sourceFilter !== 'all') {
      if (sourceFilter.startsWith('acc_') && tx.account_id !== sourceFilter) return false;
      if (sourceFilter.startsWith('card_') && tx.credit_card_id !== sourceFilter) return false;
    }

    return true;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-emerald-600" /> Histórico de Transações
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Filtre e gerencie todas as receitas, despesas, parcelamentos e status de pagamento (Pago / Pendente).
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4 text-slate-950" />}
          onClick={onOpenNewTransaction}
        >
          Nova Transação
        </Button>
      </div>

      <div className="space-y-6">
        {/* Search & Filters Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 w-full relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por descrição ou categoria..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">Todos os Tipos</option>
              <option value="expense">Despesas</option>
              <option value="income">Receitas</option>
              <option value="transfer">Transferências</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">Todas as Categorias</option>
              <option value="Alimentação">Alimentação</option>
              <option value="Moradia">Moradia</option>
              <option value="Transporte">Transporte</option>
              <option value="Compras">Compras</option>
              <option value="Assinaturas">Assinaturas</option>
              <option value="Saúde">Saúde</option>
              <option value="Educação">Educação</option>
              <option value="Salário">Salário</option>
              <option value="Investimentos">Investimentos</option>
            </select>

            {/* Source Filter */}
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">Todas as Origens</option>
              <optgroup label="Contas Bancárias">
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    🏦 {a.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Cartões de Crédito">
                {cards.map((c) => (
                  <option key={c.id} value={c.id}>
                    💳 {c.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Transactions Table Container */}
        <RecentTransactionsTable
          transactions={filteredTransactions}
          accounts={accounts}
          cards={cards}
          entities={entities}
          onDeleteTransaction={onDeleteTransaction}
          onTogglePaid={onTogglePaid}
          limit={100}
        />
      </div>
    </div>
  );
};
