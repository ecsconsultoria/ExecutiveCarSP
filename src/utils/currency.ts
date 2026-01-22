// Currency formatting utilities for BRL

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function parseCurrency(value: string): number {
  // Remove all non-numeric characters except comma and dot
  const cleaned = value.replace(/[^\d,.-]/g, '');
  // Replace comma with dot for parsing
  const normalized = cleaned.replace(',', '.');
  return parseFloat(normalized) || 0;
}

export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
