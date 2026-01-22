// Phase 3: Advanced reports with saved filters, driver/vehicle analytics, and chart data
import type { 
  OrdemServico, 
  Despesa, 
  PagamentoCliente, 
  RepasseFornecedor, 
  Fornecedor,
  SavedFilter 
} from '../db/models';
import { db } from '../db';

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
  fornecedorId?: number;
  veiculoTipo?: string;
  tipoServico?: 'transfer' | 'hora';
  status?: string;
}

export interface DriverReport {
  fornecedorId: number;
  fornecedorNome: string;
  totalServicos: number;
  valorTotal: number;
  servicosCompletados: number;
  servicosCancelados: number;
  taxaCompletude: number;
  mediaValorServico: number;
  veiculosMaisUsados: Array<{ tipo: string; count: number }>;
}

export interface VehicleReport {
  veiculoTipo: string;
  totalServicos: number;
  valorTotal: number;
  servicosCompletados: number;
  servicosCancelados: number;
  taxaUtilizacao: number;
  mediaValorServico: number;
  clientesMaisFrequentes: Array<{ clienteId: number; nome: string; count: number }>;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }>;
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
      if (filters.fornecedorId && os.fornecedorId !== filters.fornecedorId) return false;
      if (filters.veiculoTipo && os.veiculoTipo !== filters.veiculoTipo) return false;
      if (filters.tipoServico && os.tipoServico !== filters.tipoServico) return false;
      if (filters.status && os.status !== filters.status) return false;
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
  periodType: 'dia' | 'semana' | 'mes' | 'trimestre' | 'ano'
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

// Generate report by driver
export function generateDriverReport(
  ordensServico: OrdemServico[],
  fornecedores: Fornecedor[],
  repasses: RepasseFornecedor[]
): DriverReport[] {
  const driverMap = new Map<number, OrdemServico[]>();

  // Group OS by driver
  ordensServico.forEach(os => {
    if (os.fornecedorId) {
      if (!driverMap.has(os.fornecedorId)) {
        driverMap.set(os.fornecedorId, []);
      }
      driverMap.get(os.fornecedorId)!.push(os);
    }
  });

  const reports: DriverReport[] = [];

  for (const [fornecedorId, osGroup] of driverMap) {
    const fornecedor = fornecedores.find(f => f.id === fornecedorId);
    if (!fornecedor) continue;

    const totalServicos = osGroup.length;
    const servicosCompletados = osGroup.filter(os => os.status === 'Concluido').length;
    const servicosCancelados = osGroup.filter(os => os.status === 'Cancelado').length;
    
    const osIds = new Set(osGroup.map(os => os.id!));
    const valorTotal = repasses
      .filter(r => osIds.has(r.ordemServicoId) && r.status === 'Pago')
      .reduce((sum, r) => sum + r.valor, 0);

    const taxaCompletude = totalServicos > 0 ? (servicosCompletados / totalServicos) * 100 : 0;
    const mediaValorServico = totalServicos > 0 ? valorTotal / totalServicos : 0;

    // Count vehicles used
    const vehicleCount = new Map<string, number>();
    osGroup.forEach(os => {
      const count = vehicleCount.get(os.veiculoTipo) || 0;
      vehicleCount.set(os.veiculoTipo, count + 1);
    });

    const veiculosMaisUsados = Array.from(vehicleCount.entries())
      .map(([tipo, count]) => ({ tipo, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    reports.push({
      fornecedorId,
      fornecedorNome: fornecedor.nome,
      totalServicos,
      valorTotal,
      servicosCompletados,
      servicosCancelados,
      taxaCompletude,
      mediaValorServico,
      veiculosMaisUsados,
    });
  }

  return reports.sort((a, b) => b.valorTotal - a.valorTotal);
}

// Generate report by vehicle
export function generateVehicleReport(
  ordensServico: OrdemServico[],
  clientesMap: Map<number, string>
): VehicleReport[] {
  const vehicleMap = new Map<string, OrdemServico[]>();

  // Group OS by vehicle type
  ordensServico.forEach(os => {
    if (!vehicleMap.has(os.veiculoTipo)) {
      vehicleMap.set(os.veiculoTipo, []);
    }
    vehicleMap.get(os.veiculoTipo)!.push(os);
  });

  const reports: VehicleReport[] = [];

  for (const [veiculoTipo, osGroup] of vehicleMap) {
    const totalServicos = osGroup.length;
    const servicosCompletados = osGroup.filter(os => os.status === 'Concluido').length;
    const servicosCancelados = osGroup.filter(os => os.status === 'Cancelado').length;
    
    const valorTotal = osGroup.reduce((sum, os) => sum + os.precoClienteTotal, 0);
    const taxaUtilizacao = totalServicos > 0 ? (servicosCompletados / totalServicos) * 100 : 0;
    const mediaValorServico = totalServicos > 0 ? valorTotal / totalServicos : 0;

    // Count clients
    const clientCount = new Map<number, number>();
    osGroup.forEach(os => {
      const count = clientCount.get(os.clienteId) || 0;
      clientCount.set(os.clienteId, count + 1);
    });

    const clientesMaisFrequentes = Array.from(clientCount.entries())
      .map(([clienteId, count]) => ({ 
        clienteId, 
        nome: clientesMap.get(clienteId) || `Cliente #${clienteId}`, 
        count 
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    reports.push({
      veiculoTipo,
      totalServicos,
      valorTotal,
      servicosCompletados,
      servicosCancelados,
      taxaUtilizacao,
      mediaValorServico,
      clientesMaisFrequentes,
    });
  }

  return reports.sort((a, b) => b.valorTotal - a.valorTotal);
}

// Generate chart data for revenue over time
export function generateRevenueChartData(
  revenueData: RevenueReportData[]
): ChartData {
  return {
    labels: revenueData.map(d => d.periodo),
    datasets: [
      {
        label: 'Receita',
        data: revenueData.map(d => d.receita),
        backgroundColor: 'rgba(212, 175, 55, 0.5)',
        borderColor: 'rgba(212, 175, 55, 1)',
      },
      {
        label: 'Margem',
        data: revenueData.map(d => d.margem),
        backgroundColor: 'rgba(0, 128, 0, 0.5)',
        borderColor: 'rgba(0, 128, 0, 1)',
      },
    ],
  };
}

// Generate chart data for vehicle distribution
export function generateVehicleDistributionChartData(
  vehicleReports: VehicleReport[]
): ChartData {
  return {
    labels: vehicleReports.map(v => v.veiculoTipo),
    datasets: [
      {
        label: 'Total de Serviços',
        data: vehicleReports.map(v => v.totalServicos),
        backgroundColor: [
          'rgba(212, 175, 55, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 99, 132, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)',
        ],
      },
    ],
  };
}

// Generate chart data for driver performance
export function generateDriverPerformanceChartData(
  driverReports: DriverReport[]
): ChartData {
  return {
    labels: driverReports.map(d => d.fornecedorNome),
    datasets: [
      {
        label: 'Serviços Completados',
        data: driverReports.map(d => d.servicosCompletados),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
      },
      {
        label: 'Serviços Cancelados',
        data: driverReports.map(d => d.servicosCancelados),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
      },
    ],
  };
}

// Export report to CSV
export function exportReportToCSV(
  data: RevenueReportData[] | DriverReport[] | VehicleReport[],
  filename: string,
  type: 'revenue' | 'driver' | 'vehicle'
): void {
  let csv = '';

  if (type === 'revenue') {
    const headers = ['Período', 'Receita', 'Despesas', 'Repasses', 'Impostos', 'Margem', 'Qtd OS'];
    const rows = (data as RevenueReportData[]).map(row => [
      row.periodo,
      row.receita.toFixed(2),
      row.despesas.toFixed(2),
      row.repasses.toFixed(2),
      row.impostos.toFixed(2),
      row.margem.toFixed(2),
      row.count.toString(),
    ]);
    csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  } else if (type === 'driver') {
    const headers = ['Motorista', 'Total Serviços', 'Valor Total', 'Completados', 'Cancelados', 'Taxa Completude (%)', 'Média Valor'];
    const rows = (data as DriverReport[]).map(row => [
      row.fornecedorNome,
      row.totalServicos.toString(),
      row.valorTotal.toFixed(2),
      row.servicosCompletados.toString(),
      row.servicosCancelados.toString(),
      row.taxaCompletude.toFixed(2),
      row.mediaValorServico.toFixed(2),
    ]);
    csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  } else if (type === 'vehicle') {
    const headers = ['Veículo', 'Total Serviços', 'Valor Total', 'Completados', 'Cancelados', 'Taxa Utilização (%)', 'Média Valor'];
    const rows = (data as VehicleReport[]).map(row => [
      row.veiculoTipo,
      row.totalServicos.toString(),
      row.valorTotal.toFixed(2),
      row.servicosCompletados.toString(),
      row.servicosCancelados.toString(),
      row.taxaUtilizacao.toFixed(2),
      row.mediaValorServico.toFixed(2),
    ]);
    csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// Saved filters functionality
export async function saveSavedFilter(filter: Omit<SavedFilter, 'id' | 'createdAt'>): Promise<number> {
  return db.saved_filters.add({
    ...filter,
    createdAt: new Date(),
  });
}

export async function getSavedFilters(tipo?: 'os' | 'financeiro' | 'relatorio'): Promise<SavedFilter[]> {
  if (tipo) {
    return db.saved_filters.where('tipo').equals(tipo).toArray();
  }
  return db.saved_filters.toArray();
}

export async function deleteSavedFilter(id: number): Promise<void> {
  await db.saved_filters.delete(id);
}

export async function updateSavedFilter(id: number, updates: Partial<SavedFilter>): Promise<void> {
  await db.saved_filters.update(id, updates);
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

function getPeriodKey(date: Date, periodType: 'dia' | 'semana' | 'mes' | 'trimestre' | 'ano'): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  switch (periodType) {
    case 'dia':
      return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    case 'semana': {
      const weekNumber = getWeekNumber(date);
      return `${year}-S${weekNumber}`;
    }
    case 'mes':
      return `${year}-${month.toString().padStart(2, '0')}`;
    case 'trimestre': {
      const trimestre = Math.ceil(month / 3);
      return `${year}-T${trimestre}`;
    }
    case 'ano':
      return year.toString();
  }
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
