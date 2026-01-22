// Report generation and aggregation utilities
import type { OrdemServico, Despesa, PagamentoCliente, RepasseFornecedor } from '../db/models';

export interface RevenueReportData {
  periodo: string;
  receita: number;
  despesas: number;
  repasses: number;
  impostos: number;
  margem: number;
  count: number;
}

export interface ReportFilters {
  dataInicio?: Date;
  dataFim?: Date;
  clienteId?: number;
  veiculoTipo?: string;
  tipoServico?: 'transfer' | 'hora';
}

// Calculate revenue for a period
export function calculateRevenue(
  ordensServico: OrdemServico[],
  pagamentos: PagamentoCliente[],
  despesas: Despesa[],
  repasses: RepasseFornecedor[],
  filters?: ReportFilters
): RevenueReportData {
  // Filter OS
  let filteredOS = ordensServico;
  
  if (filters) {
    filteredOS = filteredOS.filter(os => {
      if (filters.dataInicio && os.createdAt < filters.dataInicio) return false;
      if (filters.dataFim && os.createdAt > filters.dataFim) return false;
      if (filters.clienteId && os.clienteId !== filters.clienteId) return false;
      if (filters.veiculoTipo && os.veiculoTipo !== filters.veiculoTipo) return false;
      if (filters.tipoServico && os.tipoServico !== filters.tipoServico) return false;
      return true;
    });
  }

  const osIds = new Set(filteredOS.map(os => os.id!));
  
  // Calculate totals
  const receita = pagamentos
    .filter(p => osIds.has(p.ordemServicoId) && p.status === 'Pago')
    .reduce((sum, p) => sum + p.valor, 0);

  const despesasTotal = despesas
    .filter(d => d.ordemServicoId && osIds.has(d.ordemServicoId))
    .reduce((sum, d) => sum + d.valor, 0);

  const repassesTotal = repasses
    .filter(r => osIds.has(r.ordemServicoId) && r.status === 'Pago')
    .reduce((sum, r) => sum + r.valor, 0);

  const impostos = filteredOS.reduce((sum, os) => sum + os.impostosAplicados, 0);
  
  const margem = receita - impostos - despesasTotal - repassesTotal;

  return {
    periodo: formatPeriodo(filters?.dataInicio, filters?.dataFim),
    receita,
    despesas: despesasTotal,
    repasses: repassesTotal,
    impostos,
    margem,
    count: filteredOS.length,
  };
}

// Group revenue by period
export function groupByPeriod(
  ordensServico: OrdemServico[],
  pagamentos: PagamentoCliente[],
  despesas: Despesa[],
  repasses: RepasseFornecedor[],
  periodType: 'mes' | 'trimestre' | 'ano'
): RevenueReportData[] {
  const groups: Map<string, OrdemServico[]> = new Map();

  ordensServico.forEach(os => {
    const key = getPeriodKey(os.createdAt, periodType);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(os);
  });

  const results: RevenueReportData[] = [];
  
  for (const [periodo, osGroup] of groups) {
    const osIds = new Set(osGroup.map(os => os.id!));
    
    const receita = pagamentos
      .filter(p => osIds.has(p.ordemServicoId) && p.status === 'Pago')
      .reduce((sum, p) => sum + p.valor, 0);

    const despesasTotal = despesas
      .filter(d => d.ordemServicoId && osIds.has(d.ordemServicoId))
      .reduce((sum, d) => sum + d.valor, 0);

    const repassesTotal = repasses
      .filter(r => osIds.has(r.ordemServicoId) && r.status === 'Pago')
      .reduce((sum, r) => sum + r.valor, 0);

    const impostos = osGroup.reduce((sum, os) => sum + os.impostosAplicados, 0);
    
    const margem = receita - impostos - despesasTotal - repassesTotal;

    results.push({
      periodo,
      receita,
      despesas: despesasTotal,
      repasses: repassesTotal,
      impostos,
      margem,
      count: osGroup.length,
    });
  }

  return results.sort((a, b) => a.periodo.localeCompare(b.periodo));
}

// Group revenue by client
export function groupByClient(
  ordensServico: OrdemServico[],
  pagamentos: PagamentoCliente[],
  despesas: Despesa[],
  repasses: RepasseFornecedor[],
  clientesMap: Map<number, string>
): Array<RevenueReportData & { clienteId: number; clienteNome: string }> {
  const groups: Map<number, OrdemServico[]> = new Map();

  ordensServico.forEach(os => {
    if (!groups.has(os.clienteId)) {
      groups.set(os.clienteId, []);
    }
    groups.get(os.clienteId)!.push(os);
  });

  const results: Array<RevenueReportData & { clienteId: number; clienteNome: string }> = [];
  
  for (const [clienteId, osGroup] of groups) {
    const osIds = new Set(osGroup.map(os => os.id!));
    
    const receita = pagamentos
      .filter(p => osIds.has(p.ordemServicoId) && p.status === 'Pago')
      .reduce((sum, p) => sum + p.valor, 0);

    const despesasTotal = despesas
      .filter(d => d.ordemServicoId && osIds.has(d.ordemServicoId))
      .reduce((sum, d) => sum + d.valor, 0);

    const repassesTotal = repasses
      .filter(r => osIds.has(r.ordemServicoId) && r.status === 'Pago')
      .reduce((sum, r) => sum + r.valor, 0);

    const impostos = osGroup.reduce((sum, os) => sum + os.impostosAplicados, 0);
    
    const margem = receita - impostos - despesasTotal - repassesTotal;

    results.push({
      clienteId,
      clienteNome: clientesMap.get(clienteId) || `Cliente #${clienteId}`,
      periodo: 'Total',
      receita,
      despesas: despesasTotal,
      repasses: repassesTotal,
      impostos,
      margem,
      count: osGroup.length,
    });
  }

  return results.sort((a, b) => b.receita - a.receita);
}

// Export report to CSV
export function exportReportToCSV(
  data: RevenueReportData[],
  filename: string
): void {
  const headers = ['Período', 'Receita', 'Despesas', 'Repasses', 'Impostos', 'Margem', 'Qtd OS'];
  
  const rows = data.map(row => [
    row.periodo,
    row.receita.toFixed(2),
    row.despesas.toFixed(2),
    row.repasses.toFixed(2),
    row.impostos.toFixed(2),
    row.margem.toFixed(2),
    row.count.toString(),
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// Helper functions
function formatPeriodo(dataInicio?: Date, dataFim?: Date): string {
  if (!dataInicio && !dataFim) return 'Todos os períodos';
  if (dataInicio && !dataFim) return `A partir de ${formatDate(dataInicio)}`;
  if (!dataInicio && dataFim) return `Até ${formatDate(dataFim)}`;
  return `${formatDate(dataInicio!)} - ${formatDate(dataFim!)}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR');
}

function getPeriodKey(date: Date, periodType: 'mes' | 'trimestre' | 'ano'): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  
  switch (periodType) {
    case 'mes':
      return `${year}-${month.toString().padStart(2, '0')}`;
    case 'trimestre':
      const trimestre = Math.ceil(month / 3);
      return `${year}-T${trimestre}`;
    case 'ano':
      return year.toString();
  }
}
