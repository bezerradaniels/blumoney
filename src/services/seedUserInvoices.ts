import type { CreditCard, Transaction, CardInvoice } from '../types/financial';
import { generateInstallmentTransactions } from '../utils/installmentCalculator';

export function buildUserSeedData() {
  const nubankCard: CreditCard = {
    id: 'card_nubank',
    name: 'Nubank',
    total_limit: 10100.0,
    available_limit: 5922.64,
    closing_day: 17,
    due_day: 24,
    card_brand: 'mastercard',
    theme_color: '#820ad1',
    last_digits: '9183',
  };

  const itauCard: CreditCard = {
    id: 'card_itau',
    name: 'Itaú Platinum',
    total_limit: 26757.0,
    available_limit: 5486.8,
    closing_day: 13,
    due_day: 20,
    card_brand: 'visa',
    theme_color: '#ec6608',
    last_digits: '1665',
  };

  const mpCard: CreditCard = {
    id: 'card_mercadopago',
    name: 'Mercado Pago Visa',
    total_limit: 6500.0,
    available_limit: 91.44,
    closing_day: 15,
    due_day: 20,
    card_brand: 'visa',
    theme_color: '#009ee3',
    last_digits: '7106',
  };

  let cards = [nubankCard, itauCard, mpCard];
  let invoices: CardInvoice[] = [];
  let transactions: Transaction[] = [];

  // Helper to add installment purchase
  const addInstallment = (
    cardId: string,
    description: string,
    installmentAmount: number,
    installmentTotal: number,
    _installmentCurrent: number,
    category: string,
    date: string
  ) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    const totalAmount = installmentAmount * installmentTotal;
    const result = generateInstallmentTransactions({
      description,
      totalAmount,
      date,
      category,
      creditCard: card,
      installmentTotal,
      existingInvoices: invoices,
    });

    cards = cards.map((c) => (c.id === cardId ? result.updatedCard : c));
    invoices = result.generatedInvoices;
    transactions.push(...result.transactions);
  };

  // Helper to add single purchase
  const addSingle = (cardId: string, description: string, amount: number, category: string, date: string) => {
    addInstallment(cardId, description, amount, 1, 1, category, date);
  };

  // 1. NUBANK PARCELAMENTOS
  addInstallment('card_nubank', 'Zapay*Detranba', 231.27, 12, 5, 'Transporte', '2026-07-17');
  addInstallment('card_nubank', 'Academia Home Fitnss', 75.0, 12, 8, 'Saúde', '2026-07-17');
  addInstallment('card_nubank', 'Htm*Marlon-Promptfy', 8.82, 6, 2, 'Assinaturas', '2026-07-17');
  addInstallment('card_nubank', 'Lojas Americanas', 48.79, 10, 5, 'Compras', '2026-07-17');
  addInstallment('card_nubank', 'Pague Menos', 64.37, 3, 3, 'Saúde', '2026-07-17');
  addSingle('card_nubank', 'Microsoft*Microsoft', 60.0, 'Assinaturas', '2026-07-17');
  addSingle('card_nubank', 'Sp Premiumcdkeys', 24.66, 'Lazer', '2026-08-03');
  addSingle('card_nubank', 'Claro Tv Mais', 148.9, 'Assinaturas', '2026-08-03');
  addSingle('card_nubank', 'Plano NuCel', 30.0, 'Assinaturas', '2026-08-05');
  addSingle('card_nubank', 'Google Youtubepremium', 53.9, 'Assinaturas', '2026-08-08');
  addSingle('card_nubank', 'Ig*Companyhero', 67.5, 'Assinaturas', '2026-08-08');
  addSingle('card_nubank', 'Nu Seguro Vida', 38.8, 'Saúde', '2026-08-10');
  addSingle('card_nubank', 'Facebk *Leasnzmct2', 10.24, 'Assinaturas', '2026-08-14');
  addSingle('card_nubank', 'Ppro *Microsoft', 60.0, 'Assinaturas', '2026-08-16');

  // 2. ITAÚ PLATINUM PARCELAMENTOS
  addInstallment('card_itau', 'SAMSUNG NO ITA', 133.4, 21, 14, 'Compras', '2026-07-15');
  addInstallment('card_itau', 'SAMSUNG NO ITA', 323.32, 21, 14, 'Compras', '2026-07-17');
  addInstallment('card_itau', 'MP*SAMSUNGELET', 307.93, 12, 12, 'Compras', '2025-09-04');
  addInstallment('card_itau', 'MP*MLCLUBBORRA', 16.73, 12, 10, 'Compras', '2025-11-27');
  addInstallment('card_itau', 'SHOPEE *traimp', 541.62, 12, 10, 'Compras', '2025-12-12');
  addInstallment('card_itau', 'AUTO ESCOLA -C', 146.0, 10, 9, 'Educação', '2025-12-22');
  addInstallment('card_itau', 'PG *STUDIO SOL', 9.9, 12, 8, 'Assinaturas', '2026-01-27');
  addInstallment('card_itau', 'ZP *OLX DANILO', 390.31, 10, 8, 'Compras', '2026-02-02');
  addInstallment('card_itau', 'MP*MERCADOLIVR', 23.57, 10, 8, 'Compras', '2026-02-12');
  addInstallment('card_itau', 'GREENN**AGENCI', 4.86, 12, 6, 'Assinaturas', '2026-03-18');
  addInstallment('card_itau', 'MERCADOLIVRE*M', 71.34, 10, 6, 'Compras', '2026-03-31');
  addInstallment('card_itau', 'MP*MERCADOLIVR', 52.85, 7, 5, 'Compras', '2026-05-02');
  addInstallment('card_itau', 'MERCADOLIVRE*M', 32.39, 5, 5, 'Compras', '2026-05-04');
  addInstallment('card_itau', 'JoseCarlosSant', 169.33, 10, 3, 'Serviços', '2026-06-15');
  addInstallment('card_itau', 'MERCADOLIVRE*P', 24.33, 3, 3, 'Compras', '2026-06-30');
  addInstallment('card_itau', 'SEMPRE DE SAMS', 246.51, 21, 2, 'Compras', '2026-07-15');
  addInstallment('card_itau', 'MERCADOLIVRE*M', 50.12, 3, 2, 'Compras', '2026-07-15');
  addInstallment('card_itau', 'MERCADOLIVRE*S', 26.91, 3, 2, 'Compras', '2026-07-15');
  addInstallment('card_itau', 'MP*LIQUIDAEMEL', 137.25, 10, 2, 'Compras', '2026-07-20');
  addInstallment('card_itau', 'MP*MERCADOLIV', 46.65, 6, 2, 'Compras', '2026-07-29');
  addInstallment('card_itau', 'MP*PRATICARESP', 15.16, 10, 2, 'Compras', '2026-07-30');
  addInstallment('card_itau', 'PIX PAGBRASIL', 85.49, 6, 2, 'Serviços', '2026-08-02');
  addInstallment('card_itau', 'OTICA VER MAIS', 85.7, 10, 2, 'Saúde', '2026-08-07');
  addSingle('card_itau', 'MERCADINHO PLBOM JESUS', 14.0, 'Alimentação', '2026-07-16');
  addSingle('card_itau', 'Amazon Ad free for Prim', 10.0, 'Assinaturas', '2026-08-01');
  addSingle('card_itau', 'SHAKE BRASILBOM JESUS D', 54.99, 'Alimentação', '2026-08-02');
  addSingle('card_itau', 'Amazon Prime CanaisSAO', 34.9, 'Assinaturas', '2026-08-02');
  addSingle('card_itau', 'EBN*SPOTIFYCURITIBABR', 40.9, 'Assinaturas', '2026-08-11');
  addSingle('card_itau', 'DM*helphbomaxcomSAO PAU', 22.45, 'Assinaturas', '2026-08-11');

  // 3. MERCADO PAGO PARCELAMENTOS
  addInstallment('card_mercadopago', 'MERCADOPAGO*SAMSUNGELETRO', 301.38, 21, 14, 'Compras', '2025-07-05');
  addInstallment('card_mercadopago', 'MERCADOPAGO*EBAZARCOMBRLT', 176.14, 21, 13, 'Compras', '2025-07-17');
  addInstallment('card_mercadopago', 'MERCADOPAGO*AGPTECNOLOGIA', 142.85, 21, 13, 'Compras', '2025-08-08');
  addInstallment('card_mercadopago', 'MERCADOLIVRE*SAMSUNGELETR', 106.85, 21, 12, 'Compras', '2025-09-04');
  addInstallment('card_mercadopago', 'MERCADOLIVRE*MARAVILHALIV', 14.55, 4, 1, 'Compras', '2026-08-08');

  return { cards, invoices, transactions };
}
