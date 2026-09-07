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
  // Days until next invoice due date
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
      <div className="dash-card p-5 dash-card-hover flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Saldo Total Bancário
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {formatBRL(totalNetBalance)}
          </h2>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span className="font-semibold">+4.2%</span>
            <span className="text-slate-500">em relação ao mês anterior</span>
          </div>
        </div>
      </div>

      {/* 2. Monthly Income vs Expenses */}
      <div className="dash-card p-5 dash-card-hover flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Entradas vs Saídas (Mês)
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-emerald-400" /> {formatBRL(monthlyIncome)}
            </span>
            <span className="text-slate-400 flex items-center gap-1">
              <ArrowDownRight className="w-3 h-3 text-rose-400" /> {formatBRL(monthlyExpenses)}
            </span>
          </div>
          {/* Income vs Expense Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
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
      <div className="dash-card p-5 dash-card-hover flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Uso Total de Crédito
          </span>
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <CreditCardIcon className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {creditUtilizationPercentage}%
            </h2>
            <span className="text-xs text-slate-400">
              {formatBRL(totalUsedCredit)} / {formatBRL(totalCreditLimit)}
            </span>
          </div>
          {/* Utilization Meter Bar */}
          <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                creditUtilizationPercentage > 80
                  ? 'bg-rose-500'
                  : creditUtilizationPercentage > 50
                  ? 'bg-amber-500'
                  : 'bg-indigo-500'
              }`}
              style={{ width: `${Math.min(100, creditUtilizationPercentage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. Next Upcoming Invoice */}
      <div className="dash-card p-5 dash-card-hover flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Próxima Fatura
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <CalendarDays className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          {nextUpcomingInvoice ? (
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-400">
                  Vence em {daysUntilDue} dias
                </span>
                <span className="text-[11px] text-slate-400">
                  {nextUpcomingInvoice.card?.name}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
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
