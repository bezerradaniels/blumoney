import React from 'react';
import { KpiCardsGrid } from '../components/dashboard/KpiCard';
import { CashFlowChart } from '../components/dashboard/CashFlowChart';
import { ProjectionBarChart } from '../components/dashboard/ProjectionBarChart';
import { CardsWallet } from '../components/dashboard/CardsWallet';
import { RecentTransactionsTable } from '../components/dashboard/RecentTransactionsTable';
import type { BankAccount, CreditCard, CardInvoice, Transaction, Entity } from '../types/financial';
import { calculate6MonthProjections } from '../utils/projectionsCalculator';
import { LayoutDashboard } from 'lucide-react';

interface DashboardViewProps {
  accounts: BankAccount[];
  cards: CreditCard[];
  invoices: CardInvoice[];
  transactions: Transaction[];
  entities?: Entity[];
  totalNetBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  creditUtilizationPercentage: number;
  totalUsedCredit: number;
  totalCreditLimit: number;
  nextUpcomingInvoice: {
    invoice: CardInvoice;
    card?: CreditCard;
  } | null;
  onOpenPdfUpload: () => void;
  onDeleteTransaction: (id: string) => void;
  onTogglePaid?: (id: string, isPaid: boolean) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  accounts,
  cards,
  invoices,
  transactions,
  entities = [],
  totalNetBalance,
  monthlyIncome,
  monthlyExpenses,
  creditUtilizationPercentage,
  totalUsedCredit,
  totalCreditLimit,
  nextUpcomingInvoice,
  onOpenPdfUpload,
  onDeleteTransaction,
  onTogglePaid,
}) => {
  const projections = calculate6MonthProjections(cards, transactions);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-emerald-600" /> Visão Geral do Dashboard
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Acompanhe seus saldos bancários, faturas de cartão, compromissos futuros e histórico em tempo real.
        </p>
      </div>

      <div className="space-y-6">
        {/* Top KPI Cards Grid */}
        <KpiCardsGrid
          totalNetBalance={totalNetBalance}
          monthlyIncome={monthlyIncome}
          monthlyExpenses={monthlyExpenses}
          creditUtilizationPercentage={creditUtilizationPercentage}
          totalUsedCredit={totalUsedCredit}
          totalCreditLimit={totalCreditLimit}
          nextUpcomingInvoice={nextUpcomingInvoice}
        />

        {/* Middle Row (Data Visualization Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CashFlowChart />
          </div>
          <div className="lg:col-span-1">
            <ProjectionBarChart projections={projections} />
          </div>
        </div>

        {/* Bottom Row (Operations Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardsWallet cards={cards} invoices={invoices} onOpenPdfUpload={onOpenPdfUpload} />
          <RecentTransactionsTable
            transactions={transactions}
            accounts={accounts}
            cards={cards}
            entities={entities}
            onDeleteTransaction={onDeleteTransaction}
            onTogglePaid={onTogglePaid}
            limit={6}
          />
        </div>
      </div>
    </div>
  );
};
