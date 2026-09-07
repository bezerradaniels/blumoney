import React from 'react';
import { Plus, FileUp, Search, Bell, Calendar } from 'lucide-react';
import { Button } from '../ui/Button';

interface HeaderProps {
  onOpenNewTransaction: () => void;
  onOpenPdfUpload: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewTransaction,
  onOpenPdfUpload,
  searchQuery,
  onSearchChange,
  selectedPeriod,
  onPeriodChange,
}) => {
  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-20 flex items-center justify-between px-6">
      {/* Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Pesquisar transações, categorias ou cartões..."
            className="w-full bg-slate-950/60 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Actions & Filters */}
      <div className="flex items-center gap-3">
        {/* Date Range Selector */}
        <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          <select
            value={selectedPeriod}
            onChange={(e) => onPeriodChange(e.target.value)}
            className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="2026-09" className="bg-slate-900 text-slate-100">Setembro 2026 (Atual)</option>
            <option value="2026-10" className="bg-slate-900 text-slate-100">Outubro 2026</option>
            <option value="2026-11" className="bg-slate-900 text-slate-100">Novembro 2026</option>
            <option value="all" className="bg-slate-900 text-slate-100">Todos os Períodos</option>
          </select>
        </div>

        {/* Import Invoice PDF Button */}
        <Button
          variant="secondary"
          size="sm"
          icon={<FileUp className="w-4 h-4 text-indigo-400" />}
          onClick={onOpenPdfUpload}
        >
          Importar Fatura PDF
        </Button>

        {/* New Transaction Button */}
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={onOpenNewTransaction}
        >
          Nova Transação
        </Button>

        {/* Notifications Icon */}
        <button
          className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors ml-1"
          title="Notificações"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
        </button>
      </div>
    </header>
  );
};
