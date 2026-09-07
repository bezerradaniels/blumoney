import React from 'react';
import { formatCurrency } from '../../utils/formatters';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  id?: string;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  id,
  name,
  disabled = false,
  required = false,
  className = '',
}) => {
  // Format numeric value into display string e.g. "R$ 1.250,50"
  const formattedValue = formatCurrency(value || 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip everything except numbers
    const rawDigits = e.target.value.replace(/\D/g, '');
    if (!rawDigits) {
      onChange(0);
      return;
    }

    // Convert integer string of cents into decimal number e.g. "125050" -> 1250.50
    const numericCents = parseInt(rawDigits, 10);
    const parsedAmount = numericCents / 100;
    onChange(parsedAmount);
  };

  return (
    <input
      type="text"
      id={id}
      name={name}
      value={formattedValue}
      onChange={handleInputChange}
      disabled={disabled}
      required={required}
      inputMode="numeric"
      className={`w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all ${className}`}
    />
  );
};
