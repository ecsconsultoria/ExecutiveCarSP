import type { TabelaPreco, Ajuste } from '../db/models';

export interface PricingParams {
  tipoServico: 'transfer' | 'hora';
  pacoteHoras?: number;
  veiculoTipo: string;
  blindado: boolean;
  motoristaTipo: 'bilingue' | 'monolingue';
}

export interface PricingResult {
  encontrado: boolean;
  tabelaPrecoId?: number;
  valorClienteBase: number;
  valorFornecedorBase: number;
  ajustesAplicados: number;
  impostoPercentual: number;
  impostoValor: number;
  valorClienteTotal: number;
}

export function findTabelaPreco(
  tabelas: TabelaPreco[],
  params: PricingParams
): TabelaPreco | null {
  return tabelas.find(t =>
    t.ativo &&
    t.tipoServico === params.tipoServico &&
    t.veiculoTipo === params.veiculoTipo &&
    t.blindado === params.blindado &&
    t.motoristaTipo === params.motoristaTipo &&
    (params.tipoServico === 'transfer' || t.pacoteHoras === params.pacoteHoras)
  ) || null;
}

export function calcularPreco(
  tabela: TabelaPreco | null,
  impostoPercentual: number,
  valorManual?: number
): PricingResult {
  if (!tabela && !valorManual) {
    return {
      encontrado: false,
      valorClienteBase: 0,
      valorFornecedorBase: 0,
      ajustesAplicados: 0,
      impostoPercentual,
      impostoValor: 0,
      valorClienteTotal: 0,
    };
  }

  if (valorManual) {
    const impostoValor = (valorManual * impostoPercentual) / 100;
    return {
      encontrado: false,
      valorClienteBase: valorManual,
      valorFornecedorBase: 0,
      ajustesAplicados: 0,
      impostoPercentual,
      impostoValor,
      valorClienteTotal: valorManual + impostoValor,
    };
  }

  if (!tabela) {
    throw new Error('Tabela ou valor manual necessário');
  }

  let valorBase = tabela.valorClienteBase;
  let ajustesTotal = 0;

  if (tabela.ajustes) {
    for (const ajuste of tabela.ajustes) {
      if (ajuste.tipo === 'percentual') {
        ajustesTotal += (valorBase * ajuste.valor) / 100;
      } else {
        ajustesTotal += ajuste.valor;
      }
    }
  }

  const valorComAjustes = valorBase + ajustesTotal;
  const impostoValor = (valorComAjustes * impostoPercentual) / 100;
  const valorTotal = valorComAjustes + impostoValor;

  return {
    encontrado: true,
    tabelaPrecoId: tabela.id,
    valorClienteBase: valorBase,
    valorFornecedorBase: tabela.valorFornecedorBase,
    ajustesAplicados: ajustesTotal,
    impostoPercentual,
    impostoValor,
    valorClienteTotal: valorTotal,
  };
}
