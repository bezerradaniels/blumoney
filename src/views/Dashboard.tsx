import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { KpiCardsGrid } from '../components/dashboard/KpiCard';
import { CashFlowChart } from '../components/dashboard/CashFlowChart';
import { ProjectionBarChart } from '../components/dashboard/ProjectionBarChart';
import { CardsWallet } from '../components/dashboard/CardsWallet';
import { RecentTransactionsTable } from '../components/dashboard/RecentTransactionsTable';
import type { BankAccount, CreditCard, CardInvoice, Transaction } from '../types/financial';
import { calculate6MonthProjections } from '../utils/projectionsCalculator';

interface DashboardViewProps {
  accounts: BankAccount[];
  cards: CreditCard[];
  invoices: CardInvoice[];
  transactions: Transaction[];
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
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  accounts,
  cards,
  invoices,
  transactions,
  totalNetBalance,
  monthlyIncome,
  monthlyExpenses,
  creditUtilizationPercentage,
  totalUsedCredit,
  totalCreditLimit,
  nextUpcomingInvoice,
  onOpenPdfUpload,
  onDeleteTransaction,
}) => {
  const projections = calculate6MonthProjections(cards, transactions);

  return (
    <PageContainer
      title="Visão Geral do Dashboard"
      subtitle="Acompanhe seus saldos bancários, faturas de cartão, compromissos futuros e histórico em tempo real."
    >
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

        {/* Middle Row (Data Visualization Grid - 2/3 and 1/3 split) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CashFlowChart />
          </div>
          <div className="lg:col-span-1">
            <ProjectionBarChart projections={projections} />
          </div>
        </div>

        {/* Bottom Row (Operations Grid - 1/2 and 1/2 split) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardsWallet cards={cards} invoices={invoices} onOpenPdfUpload={onOpenPdfUpload} />
          <RecentTransactionsTable
            transactions={transactions}
            accounts={accounts}
            cards={cards}
            onDeleteTransaction={onDeleteTransaction}
            limit={6}
          />
        </div>
      </div>
    </PageContainer>
  );
};
