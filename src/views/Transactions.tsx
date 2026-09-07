import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import type { Transaction, BankAccount, CreditCard } from '../types/financial';
import { RecentTransactionsTable } from '../components/dashboard/RecentTransactionsTable';
import { Button } from '../components/ui/Button';
import { Plus, Search } from 'lucide-react';

interface TransactionsViewProps {
  transactions: Transaction[];
  accounts: BankAccount[];
  cards: CreditCard[];
  onOpenNewTransaction: () => void;
  onDeleteTransaction: (id: string) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  accounts,
  cards,
  onOpenNewTransaction,
  onDeleteTransaction,
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
    <PageContainer
      title="Histórico Completo de Transações"
      subtitle="Filtre, pesquise e gerencie todas as entradas, saídas, parcelamentos e transferências."
      actions={
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={onOpenNewTransaction}
        >
          Nova Transação
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Search & Filters Bar */}
        <div className="dash-card p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 w-full relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por descrição ou categoria..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none cursor-pointer"
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
              className="bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none cursor-pointer"
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
              className="bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none cursor-pointer"
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
          onDeleteTransaction={onDeleteTransaction}
          limit={100}
        />
      </div>
    </PageContainer>
  );
};
