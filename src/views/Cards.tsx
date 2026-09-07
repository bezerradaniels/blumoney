import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import type { CreditCard, CardInvoice, Transaction, BankAccount } from '../types/financial';
import { formatBRL, formatDate, formatMonthYear } from '../utils/formatters';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { CreditCard as CreditCardIcon, FileUp, Plus, CheckCircle } from 'lucide-react';

interface CardsViewProps {
  cards: CreditCard[];
  invoices: CardInvoice[];
  transactions: Transaction[];
  accounts: BankAccount[];
  onOpenPdfUpload: () => void;
  onAddCreditCard: (card: Omit<CreditCard, 'id' | 'available_limit'>) => void;
  onPayInvoice: (invoiceId: string, accountId: string) => void;
}

export const CardsView: React.FC<CardsViewProps> = ({
  cards,
  invoices,
  transactions,
  accounts,
  onOpenPdfUpload,
  onAddCreditCard,
  onPayInvoice,
}) => {
  const [selectedCardId, setSelectedCardId] = useState(() => (cards[0] ? cards[0].id : ''));
  const [selectedMonth, setSelectedMonth] = useState(9); // Sep
  const [selectedYear, setSelectedYear] = useState(2026);

  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payAccountId, setPayAccountId] = useState(() => (accounts[0] ? accounts[0].id : ''));

  // Form states
  const [cardName, setCardName] = useState('');
  const [totalLimit, setTotalLimit] = useState('');
  const [closingDay, setClosingDay] = useState('22');
  const [dueDay, setDueDay] = useState('28');
  const [brand, setBrand] = useState<'visa' | 'mastercard' | 'elo' | 'amex' | 'other'>('mastercard');
  const [themeColor, setThemeColor] = useState('#8A05BE');
  const [lastDigits, setLastDigits] = useState('4892');

  const activeCard = cards.find((c) => c.id === selectedCardId) || cards[0];

  const activeInvoice = invoices.find(
    (inv) =>
      inv.credit_card_id === activeCard?.id &&
      inv.month === selectedMonth &&
      inv.year === selectedYear
  );

  const invoiceTransactions = activeInvoice
    ? transactions.filter((t) => t.invoice_id === activeInvoice.id)
    : transactions.filter((t) => t.credit_card_id === activeCard?.id);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const limitNum = parseFloat(totalLimit.replace(',', '.')) || 0;
    onAddCreditCard({
      name: cardName,
      total_limit: limitNum,
      closing_day: parseInt(closingDay, 10) || 15,
      due_day: parseInt(dueDay, 10) || 22,
      card_brand: brand,
      theme_color: themeColor,
      last_digits: lastDigits,
    });
    setCardName('');
    setTotalLimit('');
    setIsAddCardOpen(false);
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInvoice) return;
    onPayInvoice(activeInvoice.id, payAccountId);
    setIsPayModalOpen(false);
  };

  return (
    <PageContainer
      title="Cartões de Crédito & Faturas"
      subtitle="Acompanhe limites, datas de fechamento, vencimentos e o detalhamento das faturas."
      actions={
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={<FileUp className="w-4 h-4 text-indigo-400" />}
            onClick={onOpenPdfUpload}
          >
            Importar Fatura PDF
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddCardOpen(true)}
          >
            Novo Cartão
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Credit Cards Selector Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => {
            const isSelected = card.id === activeCard?.id;
            const used = card.total_limit - card.available_limit;
            const usagePercent = Math.round((used / card.total_limit) * 100);

            return (
              <div
                key={card.id}
                onClick={() => setSelectedCardId(card.id)}
                className={`dash-card p-6 cursor-pointer transition-all duration-200 relative overflow-hidden ${
                  isSelected
                    ? 'border-indigo-500 bg-slate-900 shadow-xl ring-2 ring-indigo-500/30'
                    : 'hover:border-slate-700 bg-slate-900/60'
                }`}
                style={{ borderLeftWidth: '5px', borderLeftColor: card.theme_color }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCardIcon className="w-5 h-5" style={{ color: card.theme_color }} />
                    <h3 className="text-base font-bold text-white tracking-tight">{card.name}</h3>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-800 px-2 py-0.5 rounded">
                    •••• {card.last_digits || '0000'}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Limite Utilizado</span>
                    <span className="font-semibold text-slate-200">
                      {formatBRL(used)} / {formatBRL(card.total_limit)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${usagePercent}%`,
                        backgroundColor: card.theme_color,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-[11px] text-slate-400">
                  <span>Fechamento: Dia {card.closing_day}</span>
                  <span>Vencimento: Dia {card.due_day}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Invoice Breakdown Section for Active Card */}
        {activeCard && (
          <div className="dash-card p-6 space-y-6">
            {/* Header / Month Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Fatura do {activeCard.name}
                  {activeInvoice && (
                    <Badge
                      variant={
                        activeInvoice.status === 'paid'
                          ? 'emerald'
                          : activeInvoice.status === 'overdue'
                          ? 'rose'
                          : 'indigo'
                      }
                    >
                      {activeInvoice.status === 'paid'
                        ? 'PAGA'
                        : activeInvoice.status === 'overdue'
                        ? 'ATRASADA'
                        : 'ABERTA'}
                    </Badge>
                  )}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Fechamento dia {activeCard.closing_day} • Vencimento dia {activeCard.due_day}
                </p>
              </div>

              {/* Month Selector Buttons */}
              <div className="flex items-center gap-2">
                {[
                  { m: 9, y: 2026, label: 'Setembro 2026' },
                  { m: 10, y: 2026, label: 'Outubro 2026' },
                  { m: 11, y: 2026, label: 'Novembro 2026' },
                ].map((item) => (
                  <button
                    key={`${item.y}-${item.m}`}
                    onClick={() => {
                      setSelectedMonth(item.m);
                      setSelectedYear(item.y);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      selectedMonth === item.m && selectedYear === item.y
                        ? 'bg-indigo-600 text-white shadow'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Invoice Total Banner & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl bg-slate-950/60 border border-slate-800 gap-4">
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">
                  Valor Total da Fatura ({formatMonthYear(selectedMonth, selectedYear)})
                </span>
                <h2 className="text-3xl font-extrabold text-white font-mono mt-1">
                  {formatBRL(activeInvoice ? activeInvoice.total_amount : 0)}
                </h2>
                {activeInvoice && (
                  <p className="text-xs text-slate-400 mt-1">
                    Vencimento: <strong className="text-slate-200">{formatDate(activeInvoice.due_date)}</strong>
                  </p>
                )}
              </div>

              {activeInvoice && activeInvoice.status === 'open' && (
                <Button
                  variant="primary"
                  icon={<CheckCircle className="w-4 h-4" />}
                  onClick={() => setIsPayModalOpen(true)}
                >
                  Pagar Fatura
                </Button>
              )}
            </div>

            {/* Transactions Table for Invoice */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-200">
                Lançamentos da Fatura ({invoiceTransactions.length})
              </h4>

              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Data</th>
                      <th className="py-2.5 px-4">Descrição</th>
                      <th className="py-2.5 px-4">Categoria</th>
                      <th className="py-2.5 px-4 text-center">Parcela</th>
                      <th className="py-2.5 px-4 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-950/30">
                    {invoiceTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500">
                          Nenhum lançamento encontrado nesta fatura.
                        </td>
                      </tr>
                    ) : (
                      invoiceTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                            {formatDate(tx.date)}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-200">
                            {tx.description}
                          </td>
                          <td className="py-3 px-4 text-slate-400">{tx.category}</td>
                          <td className="py-3 px-4 text-center">
                            {tx.installment_total && tx.installment_total > 1 ? (
                              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded font-mono font-bold">
                                {tx.installment_current}/{tx.installment_total}
                              </span>
                            ) : (
                              <span className="text-slate-500 text-[10px]">À vista</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-100">
                            {formatBRL(tx.amount)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Card Modal */}
      <Modal
        isOpen={isAddCardOpen}
        onClose={() => setIsAddCardOpen(false)}
        title="Cadastrar Novo Cartão de Crédito"
        subtitle="Configure limites, dia de fechamento e dia de vencimento."
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <Input
            label="Nome do Cartão"
            placeholder="ex.: Nubank Ultravioleta, Itaú Personnalité..."
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            required
          />
          <Input
            label="Limite Total (R$)"
            type="number"
            step="0.01"
            placeholder="10000.00"
            value={totalLimit}
            onChange={(e) => setTotalLimit(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Dia do Fechamento (1-31)"
              type="number"
              min="1"
              max="31"
              value={closingDay}
              onChange={(e) => setClosingDay(e.target.value)}
              required
            />
            <Input
              label="Dia do Vencimento (1-31)"
              type="number"
              min="1"
              max="31"
              value={dueDay}
              onChange={(e) => setDueDay(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Bandeira"
              options={[
                { value: 'mastercard', label: 'Mastercard' },
                { value: 'visa', label: 'Visa' },
                { value: 'elo', label: 'Elo' },
                { value: 'amex', label: 'American Express' },
                { value: 'other', label: 'Outra' },
              ]}
              value={brand}
              onChange={(e) => setBrand(e.target.value as any)}
            />
            <Input
              label="Últimos 4 Dígitos"
              placeholder="1234"
              maxLength={4}
              value={lastDigits}
              onChange={(e) => setLastDigits(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Cor do Cartão
            </label>
            <input
              type="color"
              value={themeColor}
              onChange={(e) => setThemeColor(e.target.value)}
              className="w-full h-10 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer p-1"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsAddCardOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Cadastrar Cartão
            </Button>
          </div>
        </form>
      </Modal>

      {/* Pay Invoice Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="Baixa e Pagamento de Fatura"
        subtitle={`Selecione a conta bancária para débito de ${formatBRL(
          activeInvoice ? activeInvoice.total_amount : 0
        )}.`}
      >
        <form onSubmit={handlePaySubmit} className="space-y-4">
          <Select
            label="Conta Bancária para Débito"
            options={accounts.map((a) => ({
              value: a.id,
              label: `${a.name} (Saldo: ${formatBRL(a.current_balance)})`,
            }))}
            value={payAccountId}
            onChange={(e) => setPayAccountId(e.target.value)}
          />
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
            Ao confirmar o pagamento, o valor será deduzido do saldo da conta selecionada e o limite disponível do cartão será restabelecido.
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsPayModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Confirmar Pagamento
            </Button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
};
