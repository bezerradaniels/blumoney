import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { CurrencyInput } from '../ui/CurrencyInput';
import type { BankAccount, CreditCard, PaymentMethod, Entity } from '../../types/financial';
import { Layers, ArrowDownCircle, ArrowUpCircle, CreditCard as CardIcon, RefreshCw, CheckCircle2 } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: BankAccount[];
  cards: CreditCard[];
  entities?: Entity[];
  onAddTransaction: (data: {
    type: 'income' | 'expense' | 'transfer';
    description: string;
    amount: number;
    date: string;
    category: string;
    account_id?: string;
    credit_card_id?: string;
    installmentTotal?: number;
    payment_method?: PaymentMethod;
    entity_id?: string;
    is_paid?: boolean;
  }) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  accounts,
  cards,
  entities = [],
  onAddTransaction,
}) => {
  const [txTab, setTxTab] = useState<'card_expense' | 'debit_expense' | 'income' | 'transfer'>('card_expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Compras');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [selectedAccountId, setSelectedAccountId] = useState(() => (accounts[0] ? accounts[0].id : ''));
  const [selectedCardId, setSelectedCardId] = useState(() => (cards[0] ? cards[0].id : ''));
  const [selectedEntityId, setSelectedEntityId] = useState('');
  const [isPaid, setIsPaid] = useState<boolean>(true);
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

  const paymentMethodsList = [
    { value: 'pix', label: 'PIX' },
    { value: 'boleto', label: 'Boleto Bancário' },
    { value: 'mercado_pago', label: 'Mercado Pago' },
    { value: 'credit_card', label: 'Cartão de Crédito' },
    { value: 'debit_card', label: 'Cartão de Débito' },
    { value: 'transfer', label: 'Transferência / TED' },
    { value: 'cash', label: 'Dinheiro' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    if (txTab === 'card_expense') {
      onAddTransaction({
        type: 'expense',
        description: description || 'Compra no Cartão',
        amount,
        date,
        category,
        credit_card_id: selectedCardId,
        installmentTotal: parseInt(installmentTotal, 10) || 1,
        payment_method: 'credit_card',
        entity_id: selectedEntityId || undefined,
        is_paid: isPaid,
      });
    } else if (txTab === 'debit_expense') {
      onAddTransaction({
        type: 'expense',
        description: description || 'Despesa em Conta',
        amount,
        date,
        category,
        account_id: selectedAccountId,
        payment_method: paymentMethod,
        entity_id: selectedEntityId || undefined,
        is_paid: isPaid,
      });
    } else if (txTab === 'income') {
      onAddTransaction({
        type: 'income',
        description: description || 'Receita / Entradas',
        amount,
        date,
        category,
        account_id: selectedAccountId,
        payment_method: paymentMethod,
        entity_id: selectedEntityId || undefined,
        is_paid: isPaid,
      });
    } else if (txTab === 'transfer') {
      onAddTransaction({
        type: 'transfer',
        description: 'Transferência Entre Contas',
        amount,
        date,
        category: 'Transferência',
        account_id: fromAccountId,
        payment_method: 'transfer',
        is_paid: true,
      });
    }

    // Reset & Close
    setDescription('');
    setAmount(0);
    setInstallmentTotal('1');
    setIsPaid(true);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nova Transação Financeira"
      subtitle="Registre receitas, despesas, parcelamentos de cartão, forma de pagamento e favorecido."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-4 gap-1.5 p-1.5 bg-slate-100 rounded-xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setTxTab('card_expense')}
            className={`py-2 rounded-lg font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
              txTab === 'card_expense'
                ? 'bg-emerald-400 text-slate-950 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CardIcon className="w-4 h-4" />
            <span>Cartão</span>
          </button>
          <button
            type="button"
            onClick={() => setTxTab('debit_expense')}
            className={`py-2 rounded-lg font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
              txTab === 'debit_expense'
                ? 'bg-rose-500 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowDownCircle className="w-4 h-4" />
            <span>Despesa</span>
          </button>
          <button
            type="button"
            onClick={() => setTxTab('income')}
            className={`py-2 rounded-lg font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
              txTab === 'income'
                ? 'bg-emerald-500 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowUpCircle className="w-4 h-4" />
            <span>Receita</span>
          </button>
          <button
            type="button"
            onClick={() => setTxTab('transfer')}
            className={`py-2 rounded-lg font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
              txTab === 'transfer'
                ? 'bg-teal-500 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Transferência</span>
          </button>
        </div>

        {/* Common Inputs */}
        <div className="space-y-4">
          <Input
            label="Descrição"
            placeholder="ex.: Supermercado, Aluguel, Salário, Cliente X..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Valor (Formato Bancário)
              </label>
              <CurrencyInput value={amount} onChange={setAmount} required />
            </div>
            <Input
              label="Data da Operação"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {txTab !== 'transfer' && (
              <Select
                label="Forma de Pagamento"
                options={paymentMethodsList}
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              />
            )}

            {txTab !== 'transfer' && (
              <Select
                label="Categoria"
                options={categoriesList}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            )}
          </div>

          {/* Entity Favorecido / Pagador */}
          {txTab !== 'transfer' && entities.length > 0 && (
            <Select
              label="Pessoa ou Empresa Favorecida / Pagadora"
              options={[
                { value: '', label: 'Nenhuma / Não vinculada' },
                ...entities.map((ent) => ({
                  value: ent.id,
                  label: `${ent.name} (${ent.type === 'company' ? 'PJ' : 'PF'})`,
                })),
              ]}
              value={selectedEntityId}
              onChange={(e) => setSelectedEntityId(e.target.value)}
            />
          )}

          {/* Card Purchase Options */}
          {txTab === 'card_expense' && (
            <div className="space-y-3 p-4 rounded-xl bg-emerald-50/50 border border-emerald-200">
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
                <label className="block text-xs font-medium text-emerald-900 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" /> Número de Parcelas (Smart Installment)
                </label>
                <select
                  value={installmentTotal}
                  onChange={(e) => setInstallmentTotal(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg text-sm text-slate-800 p-2 focus:border-emerald-500 focus:outline-none"
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

          {/* Status de Pagamento (Pago / Pendente) */}
          {txTab !== 'transfer' && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <input
                type="checkbox"
                id="isPaidCheck"
                checked={isPaid}
                onChange={(e) => setIsPaid(e.target.checked)}
                className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="isPaidCheck" className="text-xs font-semibold text-slate-800 cursor-pointer flex items-center gap-1.5">
                <CheckCircle2 className={`w-4 h-4 ${isPaid ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>Marcar como PAGO / LIQUIDADO nesta data</span>
              </label>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
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
