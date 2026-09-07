import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import type { BankAccount, Transaction } from '../types/financial';
import { formatBRL } from '../utils/formatters';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Plus, ArrowRightLeft, ShieldCheck } from 'lucide-react';

interface AccountsViewProps {
  accounts: BankAccount[];
  transactions: Transaction[];
  onAddBankAccount: (acc: Omit<BankAccount, 'id'>) => void;
  onTransfer: (fromId: string, toId: string, amount: number) => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  accounts,
  transactions,
  onAddBankAccount,
  onTransfer,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // New Account fields
  const [name, setName] = useState('');
  const [type, setType] = useState<'checking' | 'savings' | 'investment'>('checking');
  const [balance, setBalance] = useState('');
  const [color, setColor] = useState('#8A05BE');
  const [accountNumber, setAccountNumber] = useState('');

  // Transfer fields
  const [fromId, setFromId] = useState(() => (accounts[0] ? accounts[0].id : ''));
  const [toId, setToId] = useState(() => (accounts[1] ? accounts[1].id : ''));
  const [transferAmount, setTransferAmount] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedBalance = parseFloat(balance.replace(',', '.')) || 0;
    onAddBankAccount({
      name,
      type,
      current_balance: parsedBalance,
      color,
      account_number: accountNumber || '0001 / 12345-6',
    });
    setName('');
    setBalance('');
    setIsAddModalOpen(false);
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(transferAmount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0 || fromId === toId) return;
    onTransfer(fromId, toId, amount);
    setTransferAmount('');
    setIsTransferModalOpen(false);
  };

  const totalBalance = accounts.reduce((sum, a) => sum + a.current_balance, 0);

  return (
    <PageContainer
      title="Contas Bancárias"
      subtitle="Gerencie suas contas correntes, poupanças e carteiras de investimento."
      actions={
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={<ArrowRightLeft className="w-4 h-4" />}
            onClick={() => setIsTransferModalOpen(true)}
          >
            Transferência
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Nova Conta
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Total Summary Header */}
        <div className="dash-card p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Patrimônio Total em Contas
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-1 font-mono tracking-tight">
              {formatBRL(totalBalance)}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">
            <ShieldCheck className="w-4 h-4" />
            <span>{accounts.length} contas ativas e sincronizadas</span>
          </div>
        </div>

        {/* Accounts Grid */}
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
                className="dash-card p-6 flex flex-col justify-between dash-card-hover relative overflow-hidden"
                style={{ borderTopWidth: '4px', borderTopColor: acc.color }}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {acc.type === 'checking'
                        ? 'Conta Corrente'
                        : acc.type === 'savings'
                        ? 'Poupança'
                        : 'Investimentos'}
                    </span>
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: acc.color }}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-white mt-2">{acc.name}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {acc.account_number || 'Ag. 0001 / Conta 123456-7'}
                  </p>

                  <div className="mt-6">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                      Saldo Atual
                    </span>
                    <p className="text-2xl font-extrabold text-white font-mono mt-0.5">
                      {formatBRL(acc.current_balance)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>
                    Entradas: <strong className="text-emerald-400 font-mono">{formatBRL(totalIncomes)}</strong>
                  </span>
                  <span>
                    Saídas: <strong className="text-rose-400 font-mono">{formatBRL(totalExpenses)}</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Account Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Cadastrar Nova Conta Bancária"
        subtitle="Adicione uma conta corrente, conta de investimentos ou carteira."
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
          <Input
            label="Saldo Inicial (R$)"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            required
          />
          <Input
            label="Número da Conta / Agência (Opcional)"
            placeholder="ex.: 0001 / 987654-3"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Cor de Identificação
            </label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-10 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer p-1"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Cadastrar Conta
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
          <Input
            label="Valor da Transferência (R$)"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
            required
          />
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsTransferModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Realizar Transferência
            </Button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
};
