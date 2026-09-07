import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatBRL = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
};

export const formatCurrency = formatBRL;

export const formatDate = (dateStr: string | Date, pattern: string = 'dd/MM/yyyy'): string => {
  if (!dateStr) return '';
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    if (!isValid(date)) return String(dateStr);
    return format(date, pattern, { locale: ptBR });
  } catch {
    return String(dateStr);
  }
};

export const formatMonthYear = (month: number, year: number): string => {
  const date = new Date(year, month - 1, 1);
  const monthName = format(date, 'MMMM', { locale: ptBR });
  return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} de ${year}`;
};

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Food: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  Alimentação: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  Housing: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  Moradia: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  Salary: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  Salário: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  Transport: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  Transporte: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  Subscriptions: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  Assinaturas: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  Health: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  Saúde: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  Education: { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200' },
  Educação: { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200' },
  Leisure: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  Lazer: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  Shopping: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  Compras: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  Investment: { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200' },
  Investimentos: { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200' },
  Default: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
};

export const getCategoryBadgeStyle = (category: string) => {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.Default;
};
