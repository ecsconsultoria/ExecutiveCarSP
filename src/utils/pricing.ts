import type { TabelaPreco, Ajuste } from '../db/models';

export interface PriceCalculation {
  basePrice: number;
  adjustments: number;
  subtotal: number;
  tax: number;
  total: number;
}

export function calculatePrice(
  basePrice: number,
  ajustes: Ajuste[],
  taxRate: number
): PriceCalculation {
  let adjustments = 0;
  
  for (const ajuste of ajustes) {
    if (ajuste.tipo === 'percentual') {
      adjustments += basePrice * (ajuste.valor / 100);
    } else {
      adjustments += ajuste.valor;
    }
  }
  
  const subtotal = basePrice + adjustments;
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;
  
  return {
    basePrice,
    adjustments,
    subtotal,
    tax,
    total,
  };
}

export function findMatchingPrice(
  tabelaPrecos: TabelaPreco[],
  criteria: {
    tipoServico: 'transfer' | 'hora';
    pacoteHoras?: number | null;
    veiculoTipo: string;
    blindado: boolean;
    motoristaTipo: 'bilingue' | 'mono';
  }
): TabelaPreco | null {
  return tabelaPrecos.find(
    (price) =>
      price.tipoServico === criteria.tipoServico &&
      price.pacoteHoras === criteria.pacoteHoras &&
      price.veiculoTipo === criteria.veiculoTipo &&
      price.blindado === criteria.blindado &&
      price.motoristaTipo === criteria.motoristaTipo
  ) || null;
}
