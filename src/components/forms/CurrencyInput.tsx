import React, { useState } from 'react';
import { formatCurrency, parseCurrency } from '../../utils/currency';

interface CurrencyInputProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function CurrencyInput({
  label,
  value,
  onChange,
  error,
  placeholder = 'R$ 0,00',
  disabled = false,
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState(formatCurrency(value));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);
    
    const numericValue = parseCurrency(inputValue);
    onChange(numericValue);
  };

  const handleBlur = () => {
    setDisplayValue(formatCurrency(value));
  };

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gold-500 focus:border-gold-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
