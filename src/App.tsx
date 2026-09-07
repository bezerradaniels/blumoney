import { useState, useEffect } from 'react';
import { useFinancialData } from './hooks/useFinancialData';
import { Sidebar } from './components/layout/Sidebar';
import type { NavView } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './views/Dashboard';
import { AccountsView } from './views/Accounts';
import { CardsView } from './views/Cards';
import { TransactionsView } from './views/Transactions';
import { RecurringView } from './views/Recurring';
import { EntitiesView } from './views/Entities';
import { ProjectionsView } from './views/Projections';
import { TransactionModal } from './components/transactions/TransactionModal';
import { PdfUploadModal } from './components/cards/PdfUploadModal';
import { LoginView } from './components/auth/LoginView';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';

const USER_SESSION_KEY = 'dashbite_user_email_v1';

export function App() {
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    return localStorage.getItem(USER_SESSION_KEY);
  });
  const [checkingAuth, setCheckingAuth] = useState(true);

  const {
    accounts,
    cards,
    invoices,
    transactions,
    entities,
    recurringTransactions,
    totalNetBalance,
    monthlyIncome,
    monthlyExpenses,
    creditUtilizationPercentage,
    totalUsedCredit,
    totalCreditLimit,
    nextUpcomingInvoice,
    addTransaction,
    togglePaidTransaction,
    importParsedInvoiceItems,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
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
  } = useFinancialData(userEmail);

  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('2026-09');

  // Modals state
  const [isNewTxOpen, setIsNewTxOpen] = useState(false);
  const [isPdfUploadOpen, setIsPdfUploadOpen] = useState(false);

  // Monitor Supabase Auth Session
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setCheckingAuth(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        localStorage.setItem(USER_SESSION_KEY, session.user.email);
      }
      setCheckingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        localStorage.setItem(USER_SESSION_KEY, session.user.email);
      } else if (_event === 'SIGNED_OUT') {
        setUserEmail(null);
        localStorage.removeItem(USER_SESSION_KEY);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLoginSuccess = (email: string) => {
    setUserEmail(email);
    localStorage.setItem(USER_SESSION_KEY, email);
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUserEmail(null);
    localStorage.removeItem(USER_SESSION_KEY);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  // If not authenticated, render Login screen
  if (!userEmail) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        onResetDemo={resetToDemoData}
        userEmail={userEmail}
        onLogout={handleLogout}
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
              entities={entities}
              totalNetBalance={totalNetBalance}
              monthlyIncome={monthlyIncome}
              monthlyExpenses={monthlyExpenses}
              creditUtilizationPercentage={creditUtilizationPercentage}
              totalUsedCredit={totalUsedCredit}
              totalCreditLimit={totalCreditLimit}
              nextUpcomingInvoice={nextUpcomingInvoice}
              onOpenPdfUpload={() => setIsPdfUploadOpen(true)}
              onDeleteTransaction={deleteTransaction}
              onTogglePaid={togglePaidTransaction}
            />
          )}

          {currentView === 'accounts' && (
            <AccountsView
              accounts={accounts}
              transactions={transactions}
              onAddBankAccount={addBankAccount}
              onUpdateBankAccount={updateBankAccount}
              onDeleteBankAccount={deleteBankAccount}
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
              entities={entities}
              onOpenNewTransaction={() => setIsNewTxOpen(true)}
              onDeleteTransaction={deleteTransaction}
              onTogglePaid={togglePaidTransaction}
            />
          )}

          {currentView === 'recurring' && (
            <RecurringView
              recurringTransactions={recurringTransactions}
              accounts={accounts}
              entities={entities}
              onAddRecurring={addRecurring}
              onUpdateRecurring={updateRecurring}
              onDeleteRecurring={deleteRecurring}
              onGenerateMonthlyTransactions={generateMonthlyTransactions}
            />
          )}

          {currentView === 'entities' && (
            <EntitiesView
              entities={entities}
              onAddEntity={addEntity}
              onUpdateEntity={updateEntity}
              onDeleteEntity={deleteEntity}
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
        entities={entities}
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
