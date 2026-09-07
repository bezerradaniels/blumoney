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
  Users,
  Repeat,
} from 'lucide-react';

export type NavView =
  | 'dashboard'
  | 'accounts'
  | 'cards'
  | 'transactions'
  | 'recurring'
  | 'entities'
  | 'projections';

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
    { id: 'recurring', label: 'Transações Fixas', icon: Repeat },
    { id: 'entities', label: 'Pessoas & Empresas', icon: Users },
    { id: 'projections', label: 'Planejamento (6M)', icon: TrendingUp },
  ] as const;

  const initials = userEmail
    ? userEmail.substring(0, 2).toUpperCase()
    : 'DB';

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-30 select-none shadow-sm">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-400 via-teal-400 to-cyan-400 flex items-center justify-center shadow-md shadow-emerald-400/20">
          <Sparkles className="w-5 h-5 text-slate-950" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
            DashBite <span className="text-emerald-800 text-xs px-1.5 py-0.5 rounded bg-emerald-400/20 font-semibold border border-emerald-400/30">PRO</span>
          </h1>
          <p className="text-[11px] text-slate-500 font-medium">Gestão Financeira</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Navegação Principal
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id as NavView)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-emerald-400/15 text-emerald-900 border border-emerald-400/40 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-700" />}
            </button>
          );
        })}
      </div>

      {/* Bottom Profile Block & Quick Reset */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/60 space-y-3">
        <button
          onClick={onResetDemo}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
          title="Zerar todas as contas, cartões e transações registradas"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Zerar Todos os Dados</span>
        </button>

        <div className="flex items-center gap-3 pt-1 border-t border-slate-200">
          <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-xs font-bold text-emerald-800 shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">{userEmail}</p>
            <p className="text-[10px] text-slate-500 truncate flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600 inline" /> Conta Ativa
            </p>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
