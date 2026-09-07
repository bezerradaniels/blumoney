import React, { useState } from 'react';
import type { BankAccount, Transaction } from '../types/financial';
import { formatBRL } from '../utils/formatters';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { CurrencyInput } from '../components/ui/CurrencyInput';
import { Plus, ArrowRightLeft, ShieldCheck, Building2, Pencil, Trash2 } from 'lucide-react';

interface AccountsViewProps {
  accounts: BankAccount[];
  transactions: Transaction[];
  onAddBankAccount: (acc: Omit<BankAccount, 'id'>) => void;
  onUpdateBankAccount?: (id: string, acc: Omit<BankAccount, 'id'>) => void;
  onDeleteBankAccount?: (id: string) => void;
  onTransfer: (fromId: string, toId: string, amount: number) => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  accounts,
  transactions,
  onAddBankAccount,
  onUpdateBankAccount,
  onDeleteBankAccount,
  onTransfer,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);

  // New Account fields
  const [name, setName] = useState('');
  const [type, setType] = useState<'checking' | 'savings' | 'investment'>('checking');
  const [balance, setBalance] = useState<number>(0);
  const [color, setColor] = useState('#34d399');
  const [accountNumber, setAccountNumber] = useState('');

  // Edit Account fields
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<'checking' | 'savings' | 'investment'>('checking');
  const [editBalance, setEditBalance] = useState<number>(0);
  const [editColor, setEditColor] = useState('#34d399');
  const [editAccountNumber, setEditAccountNumber] = useState('');

  // Transfer fields
  const [fromId, setFromId] = useState(() => (accounts[0] ? accounts[0].id : ''));
  const [toId, setToId] = useState(() => (accounts[1] ? accounts[1].id : ''));
  const [transferAmount, setTransferAmount] = useState<number>(0);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddBankAccount({
      name,
      type,
      current_balance: balance,
      color,
      account_number: accountNumber || '0001 / 12345-6',
    });
    setName('');
    setBalance(0);
    setIsAddModalOpen(false);
  };

  const handleStartEdit = (acc: BankAccount) => {
    setEditingAccount(acc);
    setEditName(acc.name);
    setEditType(acc.type);
    setEditBalance(acc.current_balance);
    setEditColor(acc.color);
    setEditAccountNumber(acc.account_number || '');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount || !editName.trim()) return;
    if (onUpdateBankAccount) {
      onUpdateBankAccount(editingAccount.id, {
        name: editName,
        type: editType,
        current_balance: editBalance,
        color: editColor,
        account_number: editAccountNumber || '0001 / 12345-6',
      });
    }
    setEditingAccount(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta conta bancária?')) {
      if (onDeleteBankAccount) {
        onDeleteBankAccount(id);
      }
    }
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transferAmount <= 0 || fromId === toId) return;
    onTransfer(fromId, toId, transferAmount);
    setTransferAmount(0);
    setIsTransferModalOpen(false);
  };

  const totalBalance = accounts.reduce((sum, a) => sum + a.current_balance, 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-600" /> Contas Bancárias
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Gerencie suas contas correntes, poupanças e carteiras de investimento.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={<ArrowRightLeft className="w-4 h-4 text-emerald-600" />}
            onClick={() => setIsTransferModalOpen(true)}
            disabled={accounts.length < 2}
          >
            Transferência
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4 text-slate-950" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Nova Conta
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Total Summary Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Patrimônio Total em Contas
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1 font-mono tracking-tight">
              {formatBRL(totalBalance)}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{accounts.length} contas ativas</span>
          </div>
        </div>

        {/* Accounts Grid */}
        {accounts.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-700">Nenhuma conta cadastrada</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
              Cadastre suas contas bancárias para gerenciar saldos, receitas e despesas.
            </p>
            <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4 text-slate-950" />} onClick={() => setIsAddModalOpen(true)}>
              Cadastrar Conta
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {accounts.map((acc) => {
              const accTransactions = transactions.filter((t) => t.account_id === acc.id);
              const totalIncomes = accTransactions
                .filter((t) => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);
              const totalExpenses = accTransactions
                .filter((t) => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);

              return (
                <div
                  key={acc.id}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-emerald-400 transition-all flex flex-col justify-between relative overflow-hidden group"
                  style={{ borderTopWidth: '4px', borderTopColor: acc.color }}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {acc.type === 'checking'
                          ? 'Conta Corrente'
                          : acc.type === 'savings'
                          ? 'Poupança'
                          : 'Investimentos'}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStartEdit(acc)}
                          className="p-1 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer"
                          title="Editar Conta"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {onDeleteBankAccount && (
                          <button
                            onClick={() => handleDelete(acc.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                            title="Excluir Conta"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-xs"
                          style={{ backgroundColor: acc.color }}
                        />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mt-2">{acc.name}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {acc.account_number || 'Ag. 0001 / Conta 123456-7'}
                    </p>

                    <div className="mt-6">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        Saldo Atual
                      </span>
                      <p className="text-2xl font-extrabold text-slate-900 font-mono mt-0.5">
                        {formatBRL(acc.current_balance)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Entradas: <strong className="text-emerald-700 font-mono">{formatBRL(totalIncomes)}</strong>
                    </span>
                    <span>
                      Saídas: <strong className="text-rose-600 font-mono">{formatBRL(totalExpenses)}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Account Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Cadastrar Nova Conta Bancária"
        subtitle="Adicione uma conta corrente, poupança ou carteira de investimentos."
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <Input
            label="Nome da Conta / Instituição"
            placeholder="ex.: Nubank, Itaú Corrente, BTG Pactual..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Select
            label="Tipo de Conta"
            options={[
              { value: 'checking', label: 'Conta Corrente' },
              { value: 'savings', label: 'Poupança' },
              { value: 'investment', label: 'Investimentos' },
            ]}
            value={type}
            onChange={(e) => setType(e.target.value as any)}
          />
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Saldo Inicial (Formato Bancário)
            </label>
            <CurrencyInput value={balance} onChange={setBalance} required />
          </div>
          <Input
            label="Número da Conta / Agência (Opcional)"
            placeholder="ex.: 0001 / 987654-3"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Cor de Identificação
            </label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-10 bg-white border border-slate-300 rounded-lg cursor-pointer p-1"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Cadastrar Conta
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Account Modal */}
      <Modal
        isOpen={Boolean(editingAccount)}
        onClose={() => setEditingAccount(null)}
        title="Editar Conta Bancária"
        subtitle="Atualize o nome, tipo, saldo atual ou cor de identificação da conta."
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Nome da Conta / Instituição"
            placeholder="ex.: Nubank, Itaú Corrente, BTG Pactual..."
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
          />
          <Select
            label="Tipo de Conta"
            options={[
              { value: 'checking', label: 'Conta Corrente' },
              { value: 'savings', label: 'Poupança' },
              { value: 'investment', label: 'Investimentos' },
            ]}
            value={editType}
            onChange={(e) => setEditType(e.target.value as any)}
          />
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Saldo Atual (Formato Bancário)
            </label>
            <CurrencyInput value={editBalance} onChange={setEditBalance} required />
          </div>
          <Input
            label="Número da Conta / Agência (Opcional)"
            placeholder="ex.: 0001 / 987654-3"
            value={editAccountNumber}
            onChange={(e) => setEditAccountNumber(e.target.value)}
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Cor de Identificação
            </label>
            <input
              type="color"
              value={editColor}
              onChange={(e) => setEditColor(e.target.value)}
              className="w-full h-10 bg-white border border-slate-300 rounded-lg cursor-pointer p-1"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setEditingAccount(null)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Salvar Alterações
            </Button>
          </div>
        </form>
      </Modal>

      {/* Transfer Modal */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Transferência entre Contas"
        subtitle="Transfira valores diretamente entre suas contas cadastradas."
      >
        <form onSubmit={handleTransferSubmit} className="space-y-4">
          <Select
            label="Conta Origem (Saída)"
            options={accounts.map((a) => ({
              value: a.id,
              label: `${a.name} (Saldo: ${formatBRL(a.current_balance)})`,
            }))}
            value={fromId}
            onChange={(e) => setFromId(e.target.value)}
          />
          <Select
            label="Conta Destino (Entrada)"
            options={accounts.map((a) => ({
              value: a.id,
              label: `${a.name} (Saldo: ${formatBRL(a.current_balance)})`,
            }))}
            value={toId}
            onChange={(e) => setToId(e.target.value)}
          />
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Valor da Transferência (Formato Bancário)
            </label>
            <CurrencyInput value={transferAmount} onChange={setTransferAmount} required />
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsTransferModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Realizar Transferência
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
