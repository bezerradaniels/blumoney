import React from 'react';
import { Wallet, TrendingUp, CreditCard as CreditCardIcon, CalendarDays, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatBRL } from '../../utils/formatters';

interface KpiCardsGridProps {
  totalNetBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  creditUtilizationPercentage: number;
  totalUsedCredit: number;
  totalCreditLimit: number;
  nextUpcomingInvoice: {
    invoice: { due_date: string; total_amount: number };
    card?: { name: string; theme_color: string };
  } | null;
}

export const KpiCardsGrid: React.FC<KpiCardsGridProps> = ({
  totalNetBalance,
  monthlyIncome,
  monthlyExpenses,
  creditUtilizationPercentage,
  totalUsedCredit,
  totalCreditLimit,
  nextUpcomingInvoice,
}) => {
  const getDaysUntilDue = (dueDateStr?: string) => {
    if (!dueDateStr) return 0;
    const due = new Date(dueDateStr);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const daysUntilDue = nextUpcomingInvoice
    ? getDaysUntilDue(nextUpcomingInvoice.invoice.due_date)
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Net Balance */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-emerald-400 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Saldo Total Bancário
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
            {formatBRL(totalNetBalance)}
          </h2>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-700 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Patrimônio Atual</span>
          </div>
        </div>
      </div>

      {/* 2. Monthly Income vs Expenses */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-emerald-400 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Entradas vs Saídas (Mês)
          </span>
          <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-emerald-700 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> {formatBRL(monthlyIncome)}
            </span>
            <span className="text-rose-600 flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5" /> {formatBRL(monthlyExpenses)}
            </span>
          </div>
          {/* Income vs Expense Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex border border-slate-200">
            <div
              className="bg-emerald-400 h-full transition-all duration-300"
              style={{
                width: `${monthlyIncome + monthlyExpenses > 0 ? (monthlyIncome / (monthlyIncome + monthlyExpenses)) * 100 : 50}%`,
              }}
            />
            <div
              className="bg-rose-500 h-full transition-all duration-300"
              style={{
                width: `${monthlyIncome + monthlyExpenses > 0 ? (monthlyExpenses / (monthlyIncome + monthlyExpenses)) * 100 : 50}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* 3. Total Credit Utilization */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-emerald-400 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Uso Total de Crédito
          </span>
          <div className="w-8 h-8 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700">
            <CreditCardIcon className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
              {creditUtilizationPercentage}%
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              {formatBRL(totalUsedCredit)} / {formatBRL(totalCreditLimit)}
            </span>
          </div>
          {/* Utilization Meter Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden border border-slate-200">
            <div
              className={`h-full transition-all duration-300 ${
                creditUtilizationPercentage > 80
                  ? 'bg-rose-500'
                  : creditUtilizationPercentage > 50
                  ? 'bg-amber-500'
                  : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, creditUtilizationPercentage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. Next Upcoming Invoice */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-emerald-400 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Próxima Fatura
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <CalendarDays className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          {nextUpcomingInvoice ? (
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700">
                  Vence em {daysUntilDue} dias
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {nextUpcomingInvoice.card?.name}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1 font-mono">
                {formatBRL(nextUpcomingInvoice.invoice.total_amount)}
              </h2>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Nenhuma fatura em aberto</p>
          )}
        </div>
      </div>
    </div>
  );
};
