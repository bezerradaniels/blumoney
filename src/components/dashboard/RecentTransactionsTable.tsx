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
  CheckCircle2,
  Clock,
  Users,
} from 'lucide-react';
import type { Transaction, BankAccount, CreditCard, Entity } from '../../types/financial';
import { formatBRL, formatDate } from '../../utils/formatters';
import { Badge } from '../ui/Badge';

interface RecentTransactionsTableProps {
  transactions: Transaction[];
  accounts: BankAccount[];
  cards: CreditCard[];
  entities?: Entity[];
  onDeleteTransaction?: (id: string) => void;
  onTogglePaid?: (id: string, isPaid: boolean) => void;
  limit?: number;
}

export const RecentTransactionsTable: React.FC<RecentTransactionsTableProps> = ({
  transactions,
  accounts,
  cards,
  entities = [],
  onDeleteTransaction,
  onTogglePaid,
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

  const paymentMethodLabels: Record<string, string> = {
    pix: 'PIX',
    boleto: 'Boleto',
    mercado_pago: 'Mercado Pago',
    credit_card: 'Cartão Crédito',
    debit_card: 'Débito',
    cash: 'Dinheiro',
    transfer: 'Transferência',
  };

  const getSourceBadge = (tx: Transaction) => {
    if (tx.credit_card_id) {
      const card = cards.find((c) => c.id === tx.credit_card_id);
      return (
        <span className="text-[10px] bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded-full font-semibold">
          💳 {card ? card.name : 'Cartão Crédito'}
        </span>
      );
    }
    if (tx.account_id) {
      const acc = accounts.find((a) => a.id === tx.account_id);
      return (
        <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
          🏦 {acc ? acc.name : 'Conta'}
        </span>
      );
    }
    return null;
  };

  const displayedTransactions = limit ? transactions.slice(0, limit) : transactions;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Transações Recentes</h3>
          <p className="text-xs text-slate-500">Movimentações e parcelamentos registrados</p>
        </div>
        <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
          {transactions.length} registros
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-500 uppercase text-[10px] font-semibold tracking-wider">
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Descrição & Categoria</th>
              <th className="py-2.5 px-3">Favorecido / Pessoa</th>
              <th className="py-2.5 px-3">Pagamento / Origem</th>
              <th className="py-2.5 px-3">Data</th>
              <th className="py-2.5 px-3 text-right">Valor</th>
              {onDeleteTransaction && <th className="py-2.5 px-3 text-center">Ações</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayedTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                  Nenhuma transação registrada ainda.
                </td>
              </tr>
            ) : (
              displayedTransactions.map((tx) => {
                const Icon = getCategoryIcon(tx.category);
                const isIncome = tx.type === 'income';
                const isPaid = tx.is_paid !== false; // default true if undefined
                const entity = entities.find((e) => e.id === tx.entity_id);

                return (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors group">
                    {/* Paid Checkbox */}
                    <td className="py-3 px-3">
                      {onTogglePaid ? (
                        <button
                          onClick={() => onTogglePaid(tx.id, !isPaid)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border cursor-pointer transition-all ${
                            isPaid
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                          title="Clique para alterar status (Pago / Pendente)"
                        >
                          {isPaid ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>PAGO</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>PENDENTE</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <Badge variant={isPaid ? 'emerald' : 'amber'}>
                          {isPaid ? 'PAGO' : 'PENDENTE'}
                        </Badge>
                      )}
                    </td>

                    {/* Description & Category */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-slate-100 border border-slate-200 text-slate-700">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
                            <span>{tx.description}</span>
                            {tx.installment_total && tx.installment_total > 1 && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-teal-50 text-teal-800 rounded border border-teal-200 flex items-center gap-0.5">
                                <Layers className="w-2.5 h-2.5 text-teal-600" /> [{tx.installment_current}/{tx.installment_total}]
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {tx.category}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Entity Favorecido */}
                    <td className="py-3 px-3">
                      {entity ? (
                        <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" /> {entity.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">-</span>
                      )}
                    </td>

                    {/* Payment Method & Source */}
                    <td className="py-3 px-3 space-y-0.5">
                      {getSourceBadge(tx)}
                      {tx.payment_method && (
                        <span className="block text-[10px] text-slate-500 font-medium">
                          {paymentMethodLabels[tx.payment_method] || tx.payment_method}
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                      {formatDate(tx.date, 'dd/MM/yyyy')}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`font-mono font-bold text-xs ${
                          isIncome ? 'text-emerald-700' : 'text-slate-900'
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
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all cursor-pointer"
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
