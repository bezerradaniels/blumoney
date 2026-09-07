import React from 'react';
import {
  ShoppingBag,
  Utensils,
  Home,
  Briefcase,
  Car,
  Tv,
  HeartPulse,
  GraduationCap,
  Sparkles,
  Layers,
  Trash2,
} from 'lucide-react';
import type { Transaction, BankAccount, CreditCard } from '../../types/financial';
import { formatBRL, formatDate, getCategoryBadgeStyle } from '../../utils/formatters';

interface RecentTransactionsTableProps {
  transactions: Transaction[];
  accounts: BankAccount[];
  cards: CreditCard[];
  onDeleteTransaction?: (id: string) => void;
  limit?: number;
}

export const RecentTransactionsTable: React.FC<RecentTransactionsTableProps> = ({
  transactions,
  accounts,
  cards,
  onDeleteTransaction,
  limit = 6,
}) => {
  const getCategoryIcon = (category: string) => {
    const catLower = category.toLowerCase();
    if (catLower.includes('ali') || catLower.includes('food')) return Utensils;
    if (catLower.includes('mora') || catLower.includes('hous')) return Home;
    if (catLower.includes('salá') || catLower.includes('sala')) return Briefcase;
    if (catLower.includes('trans') || catLower.includes('car')) return Car;
    if (catLower.includes('assi') || catLower.includes('sub')) return Tv;
    if (catLower.includes('saú') || catLower.includes('heal')) return HeartPulse;
    if (catLower.includes('educ') || catLower.includes('scho')) return GraduationCap;
    if (catLower.includes('comp') || catLower.includes('shop')) return ShoppingBag;
    return Sparkles;
  };

  const getSourceBadge = (tx: Transaction) => {
    if (tx.credit_card_id) {
      const card = cards.find((c) => c.id === tx.credit_card_id);
      return (
        <span className="text-[10px] bg-slate-800 text-purple-300 border border-slate-700 px-2 py-0.5 rounded flex items-center gap-1 font-medium">
          💳 {card ? card.name : 'Cartão de Crédito'}
        </span>
      );
    }
    if (tx.account_id) {
      const acc = accounts.find((a) => a.id === tx.account_id);
      return (
        <span className="text-[10px] bg-slate-800 text-blue-300 border border-slate-700 px-2 py-0.5 rounded flex items-center gap-1 font-medium">
          🏦 {acc ? acc.name : 'Conta Bancária'}
        </span>
      );
    }
    return null;
  };

  const displayedTransactions = limit ? transactions.slice(0, limit) : transactions;

  return (
    <div className="dash-card p-6 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Transações Recentes</h3>
          <p className="text-xs text-slate-400">Últimas movimentações registradas</p>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {transactions.length} no total
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-3">Descrição & Categoria</th>
              <th className="py-2.5 px-3">Origem</th>
              <th className="py-2.5 px-3">Data</th>
              <th className="py-2.5 px-3 text-right">Valor</th>
              {onDeleteTransaction && <th className="py-2.5 px-3 text-center">Ações</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {displayedTransactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                  Nenhuma transação encontrada.
                </td>
              </tr>
            ) : (
              displayedTransactions.map((tx) => {
                const Icon = getCategoryIcon(tx.category);
                const badgeStyle = getCategoryBadgeStyle(tx.category);
                const isIncome = tx.type === 'income';

                return (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors group">
                    {/* Description & Category */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${badgeStyle.bg} ${badgeStyle.border} ${badgeStyle.text}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                            <span>{tx.description}</span>
                            {tx.installment_total && tx.installment_total > 1 && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-indigo-500/15 text-indigo-300 rounded border border-indigo-500/30 flex items-center gap-0.5">
                                <Layers className="w-2.5 h-2.5" /> [{tx.installment_current}/{tx.installment_total}]
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {tx.category}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Origem Badge */}
                    <td className="py-3 px-3">{getSourceBadge(tx)}</td>

                    {/* Date */}
                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                      {formatDate(tx.date, 'dd/MM/yyyy')}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`font-mono font-bold text-xs ${
                          isIncome ? 'text-emerald-400' : 'text-slate-100'
                        }`}
                      >
                        {isIncome ? '+' : '-'} {formatBRL(tx.amount)}
                      </span>
                    </td>

                    {/* Actions */}
                    {onDeleteTransaction && (
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-all rounded hover:bg-slate-800"
                          title="Excluir Transação"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
