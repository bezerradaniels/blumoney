import React from 'react';
import {
  LayoutDashboard,
  Building2,
  CreditCard as CreditCardIcon,
  Receipt,
  TrendingUp,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  LogOut,
} from 'lucide-react';

export type NavView = 'dashboard' | 'accounts' | 'cards' | 'transactions' | 'projections';

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  onResetDemo: () => void;
  userEmail?: string;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  onResetDemo,
  userEmail = 'daniel.ddsb@gmail.com',
  onLogout,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'accounts', label: 'Contas Bancárias', icon: Building2 },
    { id: 'cards', label: 'Cartões & Faturas', icon: CreditCardIcon },
    { id: 'transactions', label: 'Transações', icon: Receipt },
    { id: 'projections', label: 'Planejamento (6M)', icon: TrendingUp },
  ] as const;

  const initials = userEmail
    ? userEmail.substring(0, 2).toUpperCase()
    : 'DB';

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800/80 flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800/80 gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
            DashBite <span className="text-indigo-400 text-xs px-1.5 py-0.5 rounded bg-indigo-500/10 font-normal">PRO</span>
          </h1>
          <p className="text-[11px] text-slate-400 font-medium">Gestão Financeira</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Navegação Principal
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id as NavView)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />}
            </button>
          );
        })}
      </div>

      {/* Bottom Profile Block & Quick Reset */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-3">
        <button
          onClick={onResetDemo}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 transition-colors"
          title="Zerar todas as contas, cartões e transações registradas"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Zerar Todos os Dados</span>
        </button>

        <div className="flex items-center gap-3 pt-1 border-t border-slate-800/60">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-200 shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-200 truncate">{userEmail}</p>
            <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400 inline" /> Conta Ativa
            </p>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              title="Sair do sistema"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

