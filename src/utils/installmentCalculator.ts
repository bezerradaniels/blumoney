import { addMonths, parseISO, format, getDate, getMonth, getYear } from 'date-fns';
import type { CreditCard, Transaction, CardInvoice } from '../types/financial';

export interface InstallmentGenerationInput {
  description: string;
  totalAmount: number;
  date: string; // ISO date string (YYYY-MM-DD)
  category: string;
  creditCard: CreditCard;
  installmentTotal: number; // N
  existingInvoices?: CardInvoice[];
}

export interface InstallmentGenerationResult {
  transactions: Transaction[];
  updatedCard: CreditCard;
  generatedInvoices: CardInvoice[];
}

/**
 * Smart Installment Generator
 */
export const generateInstallmentTransactions = (
  input: InstallmentGenerationInput
): InstallmentGenerationResult => {
  const {
    description,
    totalAmount,
    date: dateStr,
    category,
    creditCard,
    installmentTotal,
    existingInvoices = [],
  } = input;

  const installmentGroupGroupId = `inst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const txDate = parseISO(dateStr);
  const txDay = getDate(txDate);

  const startMonthOffset = txDay >= creditCard.closing_day ? 1 : 0;

  const amountPerInstallment = Number((totalAmount / installmentTotal).toFixed(2));
  const roundingDifference = Number((totalAmount - amountPerInstallment * installmentTotal).toFixed(2));

  const generatedTransactions: Transaction[] = [];
  const generatedInvoices: CardInvoice[] = [...existingInvoices];

  for (let i = 1; i <= installmentTotal; i++) {
    const targetMonthOffset = startMonthOffset + (i - 1);
    const targetDate = addMonths(txDate, targetMonthOffset);
    
    const targetMonth = getMonth(targetDate) + 1; // 1-12
    const targetYear = getYear(targetDate);

    const dueMonthStr = String(targetMonth).padStart(2, '0');
    const dueDayStr = String(creditCard.due_day).padStart(2, '0');
    const invoiceDueDate = `${targetYear}-${dueMonthStr}-${dueDayStr}`;

    let invoice = generatedInvoices.find(
      (inv) => inv.credit_card_id === creditCard.id && inv.month === targetMonth && inv.year === targetYear
    );

    if (!invoice) {
      invoice = {
        id: `inv_${creditCard.id}_${targetYear}_${targetMonth}`,
        credit_card_id: creditCard.id,
        month: targetMonth,
        year: targetYear,
        due_date: invoiceDueDate,
        status: 'open',
        total_amount: 0,
      };
      generatedInvoices.push(invoice);
    }

    const currentAmount = i === 1 ? amountPerInstallment + roundingDifference : amountPerInstallment;
    
    invoice.total_amount += currentAmount;

    const installmentTx: Transaction = {
      id: `tx_${installmentGroupGroupId}_${i}`,
      type: 'expense',
      description: `${description} (${i}/${installmentTotal})`,
      amount: currentAmount,
      date: format(targetDate, 'yyyy-MM-dd'),
      category,
      credit_card_id: creditCard.id,
      invoice_id: invoice.id,
      installment_group_id: installmentGroupGroupId,
      installment_current: i,
      installment_total: installmentTotal,
      created_at: new Date().toISOString(),
    };

    generatedTransactions.push(installmentTx);
  }

  const updatedAvailableLimit = Math.max(0, creditCard.available_limit - totalAmount);
  const updatedCard: CreditCard = {
    ...creditCard,
    available_limit: updatedAvailableLimit,
  };

  return {
    transactions: generatedTransactions,
    updatedCard,
    generatedInvoices,
  };
};
