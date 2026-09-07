import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { CurrencyInput } from '../ui/CurrencyInput';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import type {
  RecurringTransaction,
  PaymentMethod,
  BankAccount,
  Entity,
} from '../../types/financial';

interface RecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRecurring: (data: Omit<RecurringTransaction, 'id'>, editId?: string) => void;
  editingItem?: RecurringTransaction | null;
  accounts: BankAccount[];
  entities: Entity[];
}

export const RecurringModal: React.FC<RecurringModalProps> = ({
  isOpen,
  onClose,
  onSaveRecurring,
  editingItem,
  accounts,
  entities,
}) => {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState('Moradia');
  const [dueDay, setDueDay] = useState<number>(5);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [accountId, setAccountId] = useState('');
  const [entityId, setEntityId] = useState('');

  useEffect(() => {
    if (editingItem) {
      setType(editingItem.type);
      setDescription(editingItem.description);
      setAmount(editingItem.amount);
      setCategory(editingItem.category);
      setDueDay(editingItem.due_day);
      setPaymentMethod(editingItem.payment_method || 'pix');
      setAccountId(editingItem.account_id || '');
      setEntityId(editingItem.entity_id || '');
    } else {
      setType('expense');
      setDescription('');
      setAmount(0);
      setCategory('Moradia');
      setDueDay(5);
      setPaymentMethod('pix');
      setAccountId(accounts[0]?.id || '');
      setEntityId('');
    }
  }, [editingItem, isOpen, accounts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || amount <= 0) return;

    onSaveRecurring(
      {
        type,
        description,
        amount,
        category,
        due_day: dueDay,
        payment_method: paymentMethod,
        account_id: accountId || undefined,
        entity_id: entityId || undefined,
        is_active: true,
      },
      editingItem?.id
    );

    onClose();
  };

  const categories =
    type === 'income'
      ? ['Salário', 'Investimentos', 'Pro-labore', 'Freelance', 'Vendas', 'Outros']
      : ['Moradia', 'Alimentação', 'Educação', 'Saúde', 'Transporte', 'Lazer', 'Assinaturas', 'Outros'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingItem ? 'Editar Transação Fixa' : 'Nova Transação Fixa / Recorrente'}
      subtitle="Cadastre receitas ou despesas recorrentes com vencimento mensal automático"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type selector */}
        <div className="flex gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              type === 'expense'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowDownCircle className="w-4 h-4" />
            <span>Despesa Fixa (Escola, Aluguel, etc.)</span>
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              type === 'income'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowUpCircle className="w-4 h-4" />
            <span>Receita Fixa (Salário, Freela, etc.)</span>
          </button>
        </div>

        {/* Description */}
        <Input
          label="Descrição da Transação Fixa"
          placeholder={type === 'expense' ? 'Ex: Aluguel do Apartamento' : 'Ex: Salário Mensal'}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        {/* Amount in Banking Format */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Valor Mensal Fixo (Formato Bancário)
          </label>
          <CurrencyInput value={amount} onChange={setAmount} required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Categoria"
            options={categories.map((c) => ({ value: c, label: c }))}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <Select
            label="Dia de Vencimento / Recebimento"
            options={Array.from({ length: 31 }, (_, i) => ({
              value: String(i + 1),
              label: `Dia ${i + 1} de cada mês`,
            }))}
            value={String(dueDay)}
            onChange={(e) => setDueDay(parseInt(e.target.value, 10))}
          />

          <Select
            label="Forma de Pagamento Preferencial"
            options={[
              { value: 'pix', label: 'PIX' },
              { value: 'boleto', label: 'Boleto Bancário' },
              { value: 'mercado_pago', label: 'Mercado Pago' },
              { value: 'credit_card', label: 'Cartão de Crédito' },
              { value: 'debit_card', label: 'Cartão de Débito' },
              { value: 'transfer', label: 'Transferência / TED' },
              { value: 'cash', label: 'Dinheiro' },
            ]}
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
          />

          <Select
            label="Conta Bancária Vinculada"
            options={[
              { value: '', label: 'Nenhuma / Selecionar no Lançamento' },
              ...accounts.map((acc) => ({ value: acc.id, label: acc.name })),
            ]}
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
          />
        </div>

        {/* Entity Select */}
        <Select
          label="Pessoa ou Empresa Favorecida / Pagadora"
          options={[
            { value: '', label: 'Nenhuma / Não especificada' },
            ...entities.map((ent) => ({
              value: ent.id,
              label: `${ent.name} (${ent.type === 'company' ? 'PJ' : 'PF'})`,
            })),
          ]}
          value={entityId}
          onChange={(e) => setEntityId(e.target.value)}
        />

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            {editingItem ? 'Salvar Transação Fixa' : 'Cadastrar Transação Fixa'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
