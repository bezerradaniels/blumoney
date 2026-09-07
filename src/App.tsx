import { useState } from 'react';
import { useFinancialData } from './hooks/useFinancialData';
import { Sidebar } from './components/layout/Sidebar';
import type { NavView } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './views/Dashboard';
import { AccountsView } from './views/Accounts';
import { CardsView } from './views/Cards';
import { TransactionsView } from './views/Transactions';
import { ProjectionsView } from './views/Projections';
import { TransactionModal } from './components/transactions/TransactionModal';
import { PdfUploadModal } from './components/cards/PdfUploadModal';

export function App() {
  const {
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
    addTransaction,
    importParsedInvoiceItems,
    addBankAccount,
    addCreditCard,
    transferBetweenAccounts,
    deleteTransaction,
    payInvoice,
    resetToDemoData,
  } = useFinancialData();

  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('2026-09');

  // Modals state
  const [isNewTxOpen, setIsNewTxOpen] = useState(false);
  const [isPdfUploadOpen, setIsPdfUploadOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        onResetDemo={resetToDemoData}
      />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        {/* Header Bar */}
        <Header
          onOpenNewTransaction={() => setIsNewTxOpen(true)}
          onOpenPdfUpload={() => setIsPdfUploadOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
        />

        {/* View Switcher */}
        <main className="flex-1 pb-12">
          {currentView === 'dashboard' && (
            <DashboardView
              accounts={accounts}
              cards={cards}
              invoices={invoices}
              transactions={transactions}
              totalNetBalance={totalNetBalance}
              monthlyIncome={monthlyIncome}
              monthlyExpenses={monthlyExpenses}
              creditUtilizationPercentage={creditUtilizationPercentage}
              totalUsedCredit={totalUsedCredit}
              totalCreditLimit={totalCreditLimit}
              nextUpcomingInvoice={nextUpcomingInvoice}
              onOpenPdfUpload={() => setIsPdfUploadOpen(true)}
              onDeleteTransaction={deleteTransaction}
            />
          )}

          {currentView === 'accounts' && (
            <AccountsView
              accounts={accounts}
              transactions={transactions}
              onAddBankAccount={addBankAccount}
              onTransfer={transferBetweenAccounts}
            />
          )}

          {currentView === 'cards' && (
            <CardsView
              cards={cards}
              invoices={invoices}
              transactions={transactions}
              accounts={accounts}
              onOpenPdfUpload={() => setIsPdfUploadOpen(true)}
              onAddCreditCard={addCreditCard}
              onPayInvoice={payInvoice}
            />
          )}

          {currentView === 'transactions' && (
            <TransactionsView
              transactions={transactions}
              accounts={accounts}
              cards={cards}
              onOpenNewTransaction={() => setIsNewTxOpen(true)}
              onDeleteTransaction={deleteTransaction}
            />
          )}

          {currentView === 'projections' && (
            <ProjectionsView cards={cards} transactions={transactions} />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <TransactionModal
        isOpen={isNewTxOpen}
        onClose={() => setIsNewTxOpen(false)}
        accounts={accounts}
        cards={cards}
        onAddTransaction={addTransaction}
      />

      <PdfUploadModal
        isOpen={isPdfUploadOpen}
        onClose={() => setIsPdfUploadOpen(false)}
        cards={cards}
        onCommitParsedItems={importParsedInvoiceItems}
      />
    </div>
  );
}

export default App;
