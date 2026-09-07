import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import type { BankAccount, CreditCard } from '../../types/financial';
import { Layers, ArrowDownCircle, ArrowUpCircle, CreditCard as CardIcon, RefreshCw } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: BankAccount[];
  cards: CreditCard[];
  onAddTransaction: (data: {
    type: 'income' | 'expense' | 'transfer';
    description: string;
    amount: number;
    date: string;
    category: string;
    account_id?: string;
    credit_card_id?: string;
    installmentTotal?: number;
  }) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  accounts,
  cards,
  onAddTransaction,
}) => {
  const [txTab, setTxTab] = useState<'card_expense' | 'debit_expense' | 'income' | 'transfer'>('card_expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Compras');
  const [selectedAccountId, setSelectedAccountId] = useState(() => (accounts[0] ? accounts[0].id : ''));
  const [selectedCardId, setSelectedCardId] = useState(() => (cards[0] ? cards[0].id : ''));
  const [installmentTotal, setInstallmentTotal] = useState('1');

  // Transfer fields
  const [fromAccountId, setFromAccountId] = useState(() => (accounts[0] ? accounts[0].id : ''));
  const [toAccountId, setToAccountId] = useState(() => (accounts[1] ? accounts[1].id : ''));

  const categoriesList = [
    { value: 'Alimentação', label: 'Alimentação / Supermercado' },
    { value: 'Moradia', label: 'Moradia / Aluguel' },
    { value: 'Transporte', label: 'Transporte / Combustível' },
    { value: 'Compras', label: 'Compras / Vestuário' },
    { value: 'Assinaturas', label: 'Assinaturas & Streaming' },
    { value: 'Saúde', label: 'Saúde & Farmácia' },
    { value: 'Educação', label: 'Educação / Cursos' },
    { value: 'Lazer', label: 'Lazer & Viagens' },
    { value: 'Salário', label: 'Salário & Renda' },
    { value: 'Investimentos', label: 'Investimentos & Rendimentos' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    if (txTab === 'card_expense') {
      onAddTransaction({
        type: 'expense',
        description: description || 'Compra no Cartão',
        amount: parsedAmount,
        date,
        category,
        credit_card_id: selectedCardId,
        installmentTotal: parseInt(installmentTotal, 10) || 1,
      });
    } else if (txTab === 'debit_expense') {
      onAddTransaction({
        type: 'expense',
        description: description || 'Despesa em Conta',
        amount: parsedAmount,
        date,
        category,
        account_id: selectedAccountId,
      });
    } else if (txTab === 'income') {
      onAddTransaction({
        type: 'income',
        description: description || 'Receita / Entradas',
        amount: parsedAmount,
        date,
        category,
        account_id: selectedAccountId,
      });
    } else if (txTab === 'transfer') {
      onAddTransaction({
        type: 'transfer',
        description: 'Transferência Entre Contas',
        amount: parsedAmount,
        date,
        category: 'Transferência',
        account_id: fromAccountId,
      });
    }

    // Reset & Close
    setDescription('');
    setAmount('');
    setInstallmentTotal('1');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nova Transação Financeira"
      subtitle="Registre uma despesa, receita, compra parcelada em cartão ou transferência."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setTxTab('card_expense')}
            className={`py-2 rounded-lg font-semibold flex flex-col items-center gap-1 transition-all ${
              txTab === 'card_expense'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CardIcon className="w-3.5 h-3.5" />
            <span>Cartão</span>
          </button>
          <button
            type="button"
            onClick={() => setTxTab('debit_expense')}
            className={`py-2 rounded-lg font-semibold flex flex-col items-center gap-1 transition-all ${
              txTab === 'debit_expense'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
            <span>Despesa Conta</span>
          </button>
          <button
            type="button"
            onClick={() => setTxTab('income')}
            className={`py-2 rounded-lg font-semibold flex flex-col items-center gap-1 transition-all ${
              txTab === 'income'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowUpCircle className="w-3.5 h-3.5" />
            <span>Receita</span>
          </button>
          <button
            type="button"
            onClick={() => setTxTab('transfer')}
            className={`py-2 rounded-lg font-semibold flex flex-col items-center gap-1 transition-all ${
              txTab === 'transfer'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Transferência</span>
          </button>
        </div>

        {/* Common Inputs */}
        <div className="space-y-4">
          <Input
            label="Descrição"
            placeholder="ex.: Supermercado, Salário Tech Corp, iPhone..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Valor (R$)"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <Input
              label="Data da Operação"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {txTab !== 'transfer' && (
            <Select
              label="Categoria"
              options={categoriesList}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          )}

          {/* Card Purchase Smart Installment Options */}
          {txTab === 'card_expense' && (
            <div className="space-y-4 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
              <Select
                label="Selecione o Cartão de Crédito"
                options={cards.map((c) => ({
                  value: c.id,
                  label: `${c.name} (Fechamento: Dia ${c.closing_day})`,
                }))}
                value={selectedCardId}
                onChange={(e) => setSelectedCardId(e.target.value)}
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-indigo-300 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" /> Número de Parcelas (Smart Installment)
                </label>
                <select
                  value={installmentTotal}
                  onChange={(e) => setInstallmentTotal(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-lg text-sm text-slate-100 p-2 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="1">À vista (1x)</option>
                  <option value="2">2x sem juros</option>
                  <option value="3">3x sem juros</option>
                  <option value="4">4x sem juros</option>
                  <option value="5">5x sem juros</option>
                  <option value="6">6x sem juros</option>
                  <option value="10">10x sem juros</option>
                  <option value="12">12x sem juros</option>
                </select>
                <p className="text-[11px] text-slate-400">
                  Compras a partir da data de fechamento entram na fatura do mês subsequente. O limite total é reservado imediatamente.
                </p>
              </div>
            </div>
          )}

          {/* Debit Expense / Income Account Select */}
          {(txTab === 'debit_expense' || txTab === 'income') && (
            <Select
              label="Conta Bancária"
              options={accounts.map((a) => ({
                value: a.id,
                label: `${a.name} (Saldo: R$ ${a.current_balance.toFixed(2)})`,
              }))}
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
            />
          )}

          {/* Transfer Accounts Select */}
          {txTab === 'transfer' && (
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Conta Origem"
                options={accounts.map((a) => ({ value: a.id, label: a.name }))}
                value={fromAccountId}
                onChange={(e) => setFromAccountId(e.target.value)}
              />
              <Select
                label="Conta Destino"
                options={accounts.map((a) => ({ value: a.id, label: a.name }))}
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Salvar Transação
          </Button>
        </div>
      </form>
    </Modal>
  );
};
