import React from 'react';
import { CreditCard as CreditCardIcon, FileUp } from 'lucide-react';
import type { CreditCard, CardInvoice } from '../../types/financial';
import { formatBRL } from '../../utils/formatters';

interface CardsWalletProps {
  cards: CreditCard[];
  invoices: CardInvoice[];
  onOpenPdfUpload: () => void;
}

export const CardsWallet: React.FC<CardsWalletProps> = ({
  cards,
  invoices,
  onOpenPdfUpload,
}) => {
  const getCardInvoiceAmount = (cardId: string) => {
    const inv = invoices.find(
      (i) => i.credit_card_id === cardId && i.month === 9 && i.year === 2026
    );
    return inv ? inv.total_amount : 0;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between h-full shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Meus Cartões de Crédito</h3>
          <p className="text-xs text-slate-500">Mini-carteira visual e limites disponíveis</p>
        </div>
        <button
          onClick={onOpenPdfUpload}
          className="text-xs text-emerald-800 hover:text-emerald-900 font-semibold flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition-colors border border-emerald-200 cursor-pointer"
        >
          <FileUp className="w-3.5 h-3.5 text-emerald-600" />
          <span>Upload PDF</span>
        </button>
      </div>

      {/* Cards Scroll Container */}
      {cards.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
          Nenhum cartão cadastrado.
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
          {cards.map((card) => {
            const used = card.total_limit - card.available_limit;
            const currentInvoiceVal = getCardInvoiceAmount(card.id);
            const limitPercent = Math.round((used / card.total_limit) * 100) || 0;

            return (
              <div
                key={card.id}
                className="min-w-[260px] flex-1 p-4 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between shadow-xs relative overflow-hidden group hover:border-emerald-400 transition-all"
                style={{
                  borderLeftWidth: '4px',
                  borderLeftColor: card.theme_color,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCardIcon className="w-5 h-5" style={{ color: card.theme_color }} />
                    <span className="text-sm font-bold text-slate-900 tracking-wide truncate max-w-[130px]">
                      {card.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    •••• {card.last_digits || '0000'}
                  </span>
                </div>

                <div className="my-4">
                  <p className="text-[11px] text-slate-500">Fatura Atual (Set 26)</p>
                  <p className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">
                    {formatBRL(currentInvoiceVal)}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Fechamento: Dia {card.closing_day}</span>
                    <span className="font-semibold text-slate-700">{limitPercent}% Usado</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${limitPercent}%`,
                        backgroundColor: card.theme_color,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 pt-0.5 font-mono">
                    <span>Disponível: {formatBRL(card.available_limit)}</span>
                    <span>Limite: {formatBRL(card.total_limit)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
