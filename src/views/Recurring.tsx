import React, { useState } from 'react';
import {
  Repeat,
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  Users,
  Edit,
  Trash2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { RecurringModal } from '../components/recurring/RecurringModal';
import { formatCurrency } from '../utils/formatters';
import type {
  RecurringTransaction,
  BankAccount,
  Entity,
} from '../types/financial';

interface RecurringViewProps {
  recurringTransactions: RecurringTransaction[];
  accounts: BankAccount[];
  entities: Entity[];
  onAddRecurring: (data: Omit<RecurringTransaction, 'id'>) => void;
  onUpdateRecurring: (id: string, data: Omit<RecurringTransaction, 'id'>) => void;
  onDeleteRecurring: (id: string) => void;
  onGenerateMonthlyTransactions: (recurringIds?: string[]) => void;
}

export const RecurringView: React.FC<RecurringViewProps> = ({
  recurringTransactions,
  accounts,
  entities,
  onAddRecurring,
  onUpdateRecurring,
  onDeleteRecurring,
  onGenerateMonthlyTransactions,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RecurringTransaction | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [generatedNotification, setGeneratedNotification] = useState(false);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: RecurringTransaction) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSave = (data: Omit<RecurringTransaction, 'id'>, editId?: string) => {
    if (editId) {
      onUpdateRecurring(editId, data);
    } else {
      onAddRecurring(data);
    }
  };

  const handleGenerateClick = () => {
    onGenerateMonthlyTransactions();
    setGeneratedNotification(true);
    setTimeout(() => setGeneratedNotification(false), 4000);
  };

  const filteredItems = recurringTransactions.filter((item) => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  const totalFixedIncome = recurringTransactions
    .filter((i) => i.type === 'income' && i.is_active)
    .reduce((sum, i) => sum + i.amount, 0);

  const totalFixedExpenses = recurringTransactions
    .filter((i) => i.type === 'expense' && i.is_active)
    .reduce((sum, i) => sum + i.amount, 0);

  const netFixedBalance = totalFixedIncome - totalFixedExpenses;

  const paymentMethodLabels: Record<string, string> = {
    pix: 'PIX',
    boleto: 'Boleto Bancário',
    mercado_pago: 'Mercado Pago',
    credit_card: 'Cartão de Crédito',
    debit_card: 'Cartão de Débito',
    cash: 'Dinheiro',
    transfer: 'Transferência',
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Repeat className="w-6 h-6 text-emerald-600" /> Transações Fixas & Recorrentes
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Cadastre despesas (Aluguel, Escola) e receitas (Salário, Freela) que se repetem todo mês
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            icon={<Sparkles className="w-4 h-4 text-emerald-600" />}
            onClick={handleGenerateClick}
            disabled={recurringTransactions.length === 0}
          >
            Lançar no Mês Atual
          </Button>
          <Button variant="primary" icon={<Plus className="w-4 h-4 text-slate-950" />} onClick={handleOpenAdd}>
            Nova Transação Fixa
          </Button>
        </div>
      </div>

      {generatedNotification && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-xs font-semibold text-emerald-900 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Transações fixas lançadas com sucesso na aba de Transações do Mês com o status PENDENTE!</span>
        </div>
      )}

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Receitas Fixas Mensais
            </p>
            <p className="text-xl font-bold text-emerald-600 mt-1">
              {formatCurrency(totalFixedIncome)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <ArrowUpCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Despesas Fixas Mensais
            </p>
            <p className="text-xl font-bold text-rose-600 mt-1">
              {formatCurrency(totalFixedExpenses)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <ArrowDownCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Balanço Fixo Estimado
            </p>
            <p
              className={`text-xl font-bold mt-1 ${
                netFixedBalance >= 0 ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {formatCurrency(netFixedBalance)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600">
            <Repeat className="w-6 h-6 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 w-fit">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            filterType === 'all'
              ? 'bg-emerald-400 text-slate-950 font-bold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Todas ({recurringTransactions.length})
        </button>
        <button
          onClick={() => setFilterType('expense')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            filterType === 'expense'
              ? 'bg-rose-500 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ArrowDownCircle className="w-3.5 h-3.5" /> Despesas Fixas
        </button>
        <button
          onClick={() => setFilterType('income')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            filterType === 'income'
              ? 'bg-emerald-500 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ArrowUpCircle className="w-3.5 h-3.5" /> Receitas Fixas
        </button>
      </div>

      {/* Table / List */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl">
          <Repeat className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-700">Nenhuma transação fixa cadastrada</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Cadastre aluguel, escola, salário ou mensalidades para gerá-las automaticamente todo mês.
          </p>
          <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4 text-slate-950" />} onClick={handleOpenAdd}>
            Cadastrar Transação Fixa
          </Button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Descrição & Categoria</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Dia Vencimento</th>
                  <th className="py-3 px-4">Forma Pagamento</th>
                  <th className="py-3 px-4">Pessoa / Empresa</th>
                  <th className="py-3 px-4 text-right">Valor Mensal</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredItems.map((item) => {
                  const entity = entities.find((e) => e.id === item.entity_id);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div>
                          <span>{item.description}</span>
                          <span className="block text-[11px] font-normal text-slate-500">
                            {item.category}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge variant={item.type === 'income' ? 'emerald' : 'rose'}>
                          {item.type === 'income' ? 'Receita Fixa' : 'Despesa Fixa'}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                          Dia {item.due_day}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge variant="teal">
                          {paymentMethodLabels[item.payment_method || 'pix'] || 'PIX'}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4">
                        {entity ? (
                          <span className="flex items-center gap-1 font-medium text-slate-800">
                            <Users className="w-3.5 h-3.5 text-slate-400" /> {entity.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">-</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-sm">
                        <span className={item.type === 'income' ? 'text-emerald-700' : 'text-slate-900'}>
                          {formatCurrency(item.amount)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteRecurring(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      <RecurringModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaveRecurring={handleSave}
        editingItem={editingItem}
        accounts={accounts}
        entities={entities}
      />
    </div>
  );
};
