import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  FileBarChart,
} from 'lucide-react';
import { db } from '../db';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/forms/Input';
import { useToast } from '../components/ui/Toast';
import { formatCurrency } from '../utils/currency';
import {
  groupByPeriod,
  groupByClient,
  exportReportToCSV,
  type RevenueReportData,
  type ReportFilters,
} from '../utils/reports';
import type { OrdemServico, PagamentoCliente, Despesa, RepasseFornecedor } from '../db/models';

type GroupByType = 'periodo' | 'cliente' | 'veiculo' | 'tipoServico';
type PeriodoType = 'mes' | 'trimestre' | 'ano';

export function Relatorios() {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [clienteFilter, setClienteFilter] = useState<string>('all');
  const [tipoServicoFilter, setTipoServicoFilter] = useState<string>('all');
  const [veiculoTipoFilter, setVeiculoTipoFilter] = useState<string>('all');
  const [groupBy, setGroupBy] = useState<GroupByType>('periodo');
  const [periodoType, setPeriodoType] = useState<PeriodoType>('mes');

  const { showToast } = useToast();

  // Live queries
  const ordensServico = useLiveQuery(() => db.ordens_servico.toArray(), []);
  const pagamentos = useLiveQuery(() => db.pagamentos_cliente.toArray(), []);
  const despesas = useLiveQuery(() => db.despesas.toArray(), []);
  const repasses = useLiveQuery(() => db.repasses_fornecedor.toArray(), []);
  const clientes = useLiveQuery(() => db.clientes.toArray(), []);
  const settings = useLiveQuery(() => db.settings.get(1), []);

  // Build filters
  const filters = useMemo<ReportFilters>(() => {
    const f: ReportFilters = {};
    
    if (dataInicio) f.dataInicio = new Date(dataInicio);
    if (dataFim) f.dataFim = new Date(dataFim);
    if (clienteFilter !== 'all') f.clienteId = parseInt(clienteFilter);
    if (tipoServicoFilter !== 'all') f.tipoServico = tipoServicoFilter as 'transfer' | 'hora';
    if (veiculoTipoFilter !== 'all') f.veiculoTipo = veiculoTipoFilter;
    
    return f;
  }, [dataInicio, dataFim, clienteFilter, tipoServicoFilter, veiculoTipoFilter]);

  // Filter OS based on filters
  const filteredOS = useMemo(() => {
    if (!ordensServico) return [];
    
    let filtered = ordensServico;
    
    if (filters.dataInicio) {
      filtered = filtered.filter(os => os.createdAt >= filters.dataInicio!);
    }
    if (filters.dataFim) {
      filtered = filtered.filter(os => os.createdAt <= filters.dataFim!);
    }
    if (filters.clienteId) {
      filtered = filtered.filter(os => os.clienteId === filters.clienteId);
    }
    if (filters.tipoServico) {
      filtered = filtered.filter(os => os.tipoServico === filters.tipoServico);
    }
    if (filters.veiculoTipo) {
      filtered = filtered.filter(os => os.veiculoTipo === filters.veiculoTipo);
    }
    
    return filtered;
  }, [ordensServico, filters]);

  // Calculate report data based on grouping
  const reportData = useMemo(() => {
    if (!filteredOS || !pagamentos || !despesas || !repasses) return [];

    switch (groupBy) {
      case 'periodo':
        return groupByPeriod(filteredOS, pagamentos, despesas, repasses, periodoType);
      
      case 'cliente': {
        const clientesMap = new Map(clientes?.map(c => [c.id!, c.nome]) || []);
        return groupByClient(filteredOS, pagamentos, despesas, repasses, clientesMap);
      }
      
      case 'veiculo':
        return groupByVehicleType(filteredOS, pagamentos, despesas, repasses);
      
      case 'tipoServico':
        return groupByServiceType(filteredOS, pagamentos, despesas, repasses);
      
      default:
        return [];
    }
  }, [filteredOS, pagamentos, despesas, repasses, groupBy, periodoType, clientes]);

  // Calculate summary totals
  const summary = useMemo(() => {
    if (!reportData.length) {
      return {
        totalReceita: 0,
        totalDespesas: 0,
        totalRepasses: 0,
        totalImpostos: 0,
        totalMargem: 0,
        totalOS: 0,
      };
    }

    return {
      totalReceita: reportData.reduce((sum, r) => sum + r.receita, 0),
      totalDespesas: reportData.reduce((sum, r) => sum + r.despesas, 0),
      totalRepasses: reportData.reduce((sum, r) => sum + r.repasses, 0),
      totalImpostos: reportData.reduce((sum, r) => sum + r.impostos, 0),
      totalMargem: reportData.reduce((sum, r) => sum + r.margem, 0),
      totalOS: reportData.reduce((sum, r) => sum + r.count, 0),
    };
  }, [reportData]);

  // Group by vehicle type
  /**
   * Groups revenue data by vehicle type
   * @param os - Array of filtered service orders
   * @param pag - Array of payments
   * @param desp - Array of expenses
   * @param rep - Array of supplier transfers
   * @returns Array of revenue reports grouped by vehicle type, sorted by revenue descending
   */
  function groupByVehicleType(
    os: OrdemServico[],
    pag: PagamentoCliente[] | undefined,
    desp: Despesa[] | undefined,
    rep: RepasseFornecedor[] | undefined
  ): RevenueReportData[] {
    if (!pag || !desp || !rep) return [];

    const groups: Map<string, OrdemServico[]> = new Map();

    os.forEach(ordem => {
      const key = ordem.veiculoTipo;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(ordem);
    });

    const results: RevenueReportData[] = [];

    for (const [veiculoTipo, osGroup] of groups) {
      const osIds = new Set(osGroup.map(o => o.id!));

      const receita = pag
        .filter(p => osIds.has(p.ordemServicoId) && p.status === 'Pago')
        .reduce((sum, p) => sum + p.valor, 0);

      const despesasTotal = desp
        .filter(d => d.ordemServicoId && osIds.has(d.ordemServicoId))
        .reduce((sum, d) => sum + d.valor, 0);

      const repassesTotal = rep
        .filter(r => osIds.has(r.ordemServicoId) && r.status === 'Pago')
        .reduce((sum, r) => sum + r.valor, 0);

      const impostos = osGroup.reduce((sum, o) => sum + o.impostosAplicados, 0);
      const margem = receita - impostos - despesasTotal - repassesTotal;

      results.push({
        periodo: veiculoTipo,
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

  // Group by service type
  /**
   * Groups revenue data by service type
   * @param os - Array of filtered service orders
   * @param pag - Array of payments
   * @param desp - Array of expenses
   * @param rep - Array of supplier transfers
   * @returns Array of revenue reports grouped by service type, sorted by revenue descending
   */
  function groupByServiceType(
    os: OrdemServico[],
    pag: PagamentoCliente[] | undefined,
    desp: Despesa[] | undefined,
    rep: RepasseFornecedor[] | undefined
  ): RevenueReportData[] {
    if (!pag || !desp || !rep) return [];

    const groups: Map<string, OrdemServico[]> = new Map();

    os.forEach(ordem => {
      const key = ordem.tipoServico === 'transfer' ? 'Transfer' : `Hora (${ordem.pacoteHoras || 0}h)`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(ordem);
    });

    const results: RevenueReportData[] = [];

    for (const [tipo, osGroup] of groups) {
      const osIds = new Set(osGroup.map(o => o.id!));

      const receita = pag
        .filter(p => osIds.has(p.ordemServicoId) && p.status === 'Pago')
        .reduce((sum, p) => sum + p.valor, 0);

      const despesasTotal = desp
        .filter(d => d.ordemServicoId && osIds.has(d.ordemServicoId))
        .reduce((sum, d) => sum + d.valor, 0);

      const repassesTotal = rep
        .filter(r => osIds.has(r.ordemServicoId) && r.status === 'Pago')
        .reduce((sum, r) => sum + r.valor, 0);

      const impostos = osGroup.reduce((sum, o) => sum + o.impostosAplicados, 0);
      const margem = receita - impostos - despesasTotal - repassesTotal;

      results.push({
        periodo: tipo,
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

  // Handle export
  const handleExport = () => {
    if (!reportData.length) {
      showToast('warning', 'Não há dados para exportar');
      return;
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const filename = `relatorio_${groupBy}_${dateStr}.csv`;
    
    exportReportToCSV(reportData, filename);
    showToast('success', 'Relatório exportado com sucesso!');
  };

  // Get unique vehicle types
  const vehicleTypes = useMemo(() => {
    if (!settings?.vehiclesCatalog) return [];
    return settings.vehiclesCatalog;
  }, [settings]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black-900">Relatórios</h1>
          <p className="text-gray-600 mt-1">Análise financeira e operacional</p>
        </div>
        <Button
          variant="primary"
          onClick={handleExport}
          disabled={!reportData.length}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Filters Section */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Filtros do Relatório
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Início
            </label>
            <Input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Fim
            </label>
            <Input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </div>

          {/* Cliente Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cliente
            </label>
            <Select
              value={clienteFilter}
              onChange={(e) => setClienteFilter(e.target.value)}
            >
              <option value="all">Todos os clientes</option>
              {clientes?.map(cliente => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome}
                </option>
              ))}
            </Select>
          </div>

          {/* Tipo de Serviço Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Serviço
            </label>
            <Select
              value={tipoServicoFilter}
              onChange={(e) => setTipoServicoFilter(e.target.value)}
            >
              <option value="all">Todos os tipos</option>
              <option value="transfer">Transfer</option>
              <option value="hora">Por Hora</option>
            </Select>
          </div>

          {/* Veículo Tipo Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Veículo
            </label>
            <Select
              value={veiculoTipoFilter}
              onChange={(e) => setVeiculoTipoFilter(e.target.value)}
            >
              <option value="all">Todos os veículos</option>
              {vehicleTypes.map(vt => (
                <option key={vt.id} value={vt.id}>
                  {vt.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Group By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agrupar por
            </label>
            <Select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as GroupByType)}
            >
              <option value="periodo">Período</option>
              <option value="cliente">Cliente</option>
              <option value="veiculo">Tipo de Veículo</option>
              <option value="tipoServico">Tipo de Serviço</option>
            </Select>
          </div>

          {/* Period Type (only for periodo grouping) */}
          {groupBy === 'periodo' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Período
              </label>
              <Select
                value={periodoType}
                onChange={(e) => setPeriodoType(e.target.value as PeriodoType)}
              >
                <option value="mes">Mês</option>
                <option value="trimestre">Trimestre</option>
                <option value="ano">Ano</option>
              </Select>
            </div>
          )}
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Receita</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(summary.totalReceita)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Despesas</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(summary.totalDespesas)}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Repasses</p>
              <p className="text-xl font-bold text-orange-600">{formatCurrency(summary.totalRepasses)}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-orange-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Impostos</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(summary.totalImpostos)}</p>
            </div>
            <Wallet className="h-8 w-8 text-red-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Margem Total</p>
              <p className={`text-xl font-bold ${summary.totalMargem >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(summary.totalMargem)}
              </p>
            </div>
            <TrendingUp className={`h-8 w-8 ${summary.totalMargem >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total OS</p>
              <p className="text-xl font-bold text-black-900">{summary.totalOS}</p>
            </div>
            <FileBarChart className="h-8 w-8 text-gold-600" />
          </div>
        </Card>
      </div>

      {/* Report Data Table */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Dados do Relatório</h2>
        
        {reportData.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum dado encontrado para os filtros selecionados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {groupBy === 'periodo' ? 'Período' : 
                     groupBy === 'cliente' ? 'Cliente' :
                     groupBy === 'veiculo' ? 'Veículo' : 'Tipo de Serviço'}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receita
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Despesas
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Repasses
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Impostos
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Margem
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qtd OS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {row.periodo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-semibold">
                      {formatCurrency(row.receita)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                      {formatCurrency(row.despesas)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-orange-600">
                      {formatCurrency(row.repasses)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                      {formatCurrency(row.impostos)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${
                      row.margem >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(row.margem)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      {row.count}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    TOTAL
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-green-600">
                    {formatCurrency(summary.totalReceita)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-red-600">
                    {formatCurrency(summary.totalDespesas)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-orange-600">
                    {formatCurrency(summary.totalRepasses)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-red-600">
                    {formatCurrency(summary.totalImpostos)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${
                    summary.totalMargem >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(summary.totalMargem)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                    {summary.totalOS}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
