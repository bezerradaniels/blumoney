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
    <div className="dash-card p-6 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Meus Cartões de Crédito</h3>
          <p className="text-xs text-slate-400">Mini-carteira visual e limites disponíveis</p>
        </div>
        <button
          onClick={onOpenPdfUpload}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1.5 rounded-lg transition-colors border border-indigo-500/20"
        >
          <FileUp className="w-3.5 h-3.5" />
          <span>Upload PDF</span>
        </button>
      </div>

      {/* Cards Scroll Container */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
        {cards.map((card) => {
          const used = card.total_limit - card.available_limit;
          const currentInvoiceVal = getCardInvoiceAmount(card.id);
          const limitPercent = Math.round((used / card.total_limit) * 100);

          return (
            <div
              key={card.id}
              className="min-w-[260px] flex-1 p-4 rounded-xl border border-slate-700/60 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-indigo-500/40 transition-all"
              style={{
                borderLeftWidth: '4px',
                borderLeftColor: card.theme_color,
              }}
            >
              {/* Subtle brand color glow */}
              <div
                className="absolute -right-8 -top-8 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none"
                style={{ backgroundColor: card.theme_color }}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCardIcon className="w-5 h-5" style={{ color: card.theme_color }} />
                  <span className="text-sm font-semibold text-white tracking-wide truncate max-w-[130px]">
                    {card.name}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-800 px-2 py-0.5 rounded">
                  •••• {card.last_digits || '0000'}
                </span>
              </div>

              <div className="my-4">
                <p className="text-[11px] text-slate-400">Fatura Atual (Set 26)</p>
                <p className="text-xl font-extrabold text-white mt-0.5">
                  {formatBRL(currentInvoiceVal)}
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Fechamento: Dia {card.closing_day}</span>
                  <span className="font-semibold text-slate-300">{limitPercent}% Usado</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${limitPercent}%`,
                      backgroundColor: card.theme_color,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                  <span>Disponível: {formatBRL(card.available_limit)}</span>
                  <span>Limite: {formatBRL(card.total_limit)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
