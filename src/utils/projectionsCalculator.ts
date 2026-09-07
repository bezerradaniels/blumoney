import { addMonths, format, getMonth, getYear, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { CreditCard, Transaction, MonthlyProjection } from '../types/financial';

/**
 * Calculates aggregate future credit card commitments for 6 consecutive forward months (M+1 to M+6)
 */
export const calculate6MonthProjections = (
  cards: CreditCard[],
  transactions: Transaction[],
  baseDate: Date = new Date()
): MonthlyProjection[] => {
  const projections: MonthlyProjection[] = [];

  for (let i = 1; i <= 6; i++) {
    const projectionDate = addMonths(baseDate, i);
    const targetMonth = getMonth(projectionDate) + 1; // 1-12
    const targetYear = getYear(projectionDate);
    const monthKey = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;
    
    const rawMonthLabel = format(projectionDate, 'MMM yy', { locale: ptBR });
    const label = rawMonthLabel.charAt(0).toUpperCase() + rawMonthLabel.slice(1);

    const cardBreakdown: Record<string, number> = {};
    cards.forEach((card) => {
      cardBreakdown[card.id] = 0;
    });

    let totalAmount = 0;

    transactions.forEach((tx) => {
      if (!tx.credit_card_id || tx.type !== 'expense') return;

      const txDate = parseISO(tx.date);
      const txMonth = getMonth(txDate) + 1;
      const txYear = getYear(txDate);

      if (txMonth === targetMonth && txYear === targetYear) {
        if (cardBreakdown[tx.credit_card_id] !== undefined) {
          cardBreakdown[tx.credit_card_id] += tx.amount;
        } else {
          cardBreakdown[tx.credit_card_id] = tx.amount;
        }
        totalAmount += tx.amount;
      }
    });

    projections.push({
      monthKey,
      label,
      monthNumber: targetMonth,
      year: targetYear,
      totalAmount,
      cardBreakdown,
    });
  }

  return projections;
};
