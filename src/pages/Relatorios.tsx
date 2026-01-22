import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  FileText,
  Download,
  TrendingUp,
  DollarSign,
  Wallet,
  FileBarChart,
  Users,
  Car,
  Save,
  X,
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
  type RevenueReportData,
  type ReportFilters,
} from '../utils/reports';
import {
  generateDriverReport,
  generateVehicleReport,
  generateRevenueChartData,
  saveSavedFilter,
  getSavedFilters,
  deleteSavedFilter,
  exportReportToCSV,
} from '../utils/reportsAdvanced';
import type { OrdemServico, PagamentoCliente, Despesa, RepasseFornecedor } from '../db/models';

type GroupByType = 'periodo' | 'cliente' | 'veiculo' | 'tipoServico';
type PeriodoType = 'mes' | 'trimestre' | 'ano';
type ReportTab = 'receita' | 'motorista' | 'veiculo';

export function Relatorios() {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [clienteFilter, setClienteFilter] = useState<string>('all');
  const [tipoServicoFilter, setTipoServicoFilter] = useState<string>('all');
  const [veiculoTipoFilter, setVeiculoTipoFilter] = useState<string>('all');
  const [groupBy, setGroupBy] = useState<GroupByType>('periodo');
  const [periodoType, setPeriodoType] = useState<PeriodoType>('mes');
  const [activeTab, setActiveTab] = useState<ReportTab>('receita');
  const [showSaveFilter, setShowSaveFilter] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [selectedSavedFilter, setSelectedSavedFilter] = useState<string>('none');

  const { showToast } = useToast();

  // Live queries
  const ordensServico = useLiveQuery(() => db.ordens_servico.toArray(), []);
  const pagamentos = useLiveQuery(() => db.pagamentos_cliente.toArray(), []);
  const despesas = useLiveQuery(() => db.despesas.toArray(), []);
  const repasses = useLiveQuery(() => db.repasses_fornecedor.toArray(), []);
  const clientes = useLiveQuery(() => db.clientes.toArray(), []);
  const fornecedores = useLiveQuery(() => db.fornecedores.toArray(), []);
  const settings = useLiveQuery(() => db.settings.get(1), []);
  const savedFilters = useLiveQuery(() => getSavedFilters('relatorio'), []);

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
        mediaValorServico: 0,
      };
    }

    const totalReceita = reportData.reduce((sum, r) => sum + r.receita, 0);
    const totalOS = reportData.reduce((sum, r) => sum + r.count, 0);

    return {
      totalReceita,
      totalDespesas: reportData.reduce((sum, r) => sum + r.despesas, 0),
      totalRepasses: reportData.reduce((sum, r) => sum + r.repasses, 0),
      totalImpostos: reportData.reduce((sum, r) => sum + r.impostos, 0),
      totalMargem: reportData.reduce((sum, r) => sum + r.margem, 0),
      totalOS,
      mediaValorServico: totalOS > 0 ? totalReceita / totalOS : 0,
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

  // Generate driver reports
  const driverReports = useMemo(() => {
    if (!filteredOS || !fornecedores || !repasses) return [];
    return generateDriverReport(filteredOS, fornecedores, repasses);
  }, [filteredOS, fornecedores, repasses]);

  // Generate vehicle reports
  const vehicleReports = useMemo(() => {
    if (!filteredOS || !clientes) return [];
    const clientesMap = new Map(clientes.map(c => [c.id!, c.nome]));
    return generateVehicleReport(filteredOS, clientesMap);
  }, [filteredOS, clientes]);

  // Generate chart data for revenue
  const revenueChartData = useMemo(() => {
    if (!reportData.length) return null;
    return generateRevenueChartData(reportData);
  }, [reportData]);

  // Handle save filter
  const handleSaveFilter = async () => {
    if (!filterName.trim()) {
      showToast('warning', 'Digite um nome para o filtro');
      return;
    }

    try {
      await saveSavedFilter({
        nome: filterName,
        tipo: 'relatorio',
        filtros: {
          dataInicio,
          dataFim,
          clienteFilter,
          tipoServicoFilter,
          veiculoTipoFilter,
          groupBy,
          periodoType,
        },
      });
      
      setFilterName('');
      setShowSaveFilter(false);
      showToast('success', 'Filtro salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar filtro:', error);
      showToast('error', 'Erro ao salvar filtro');
    }
  };

  // Handle apply saved filter
  const handleApplySavedFilter = (filterId: string) => {
    if (filterId === 'none') {
      setSelectedSavedFilter('none');
      return;
    }

    const filter = savedFilters?.find(f => f.id === parseInt(filterId));
    if (!filter) return;

    const filtros = filter.filtros;
    setDataInicio(filtros.dataInicio || '');
    setDataFim(filtros.dataFim || '');
    setClienteFilter(filtros.clienteFilter || 'all');
    setTipoServicoFilter(filtros.tipoServicoFilter || 'all');
    setVeiculoTipoFilter(filtros.veiculoTipoFilter || 'all');
    setGroupBy(filtros.groupBy || 'periodo');
    setPeriodoType(filtros.periodoType || 'mes');
    setSelectedSavedFilter(filterId);
    showToast('success', 'Filtro aplicado!');
  };

  // Handle delete saved filter
  const handleDeleteFilter = async (filterId: number) => {
    try {
      await deleteSavedFilter(filterId);
      if (selectedSavedFilter === filterId.toString()) {
        setSelectedSavedFilter('none');
      }
      showToast('success', 'Filtro excluído!');
    } catch (error) {
      console.error('Erro ao excluir filtro:', error);
      showToast('error', 'Erro ao excluir filtro');
    }
  };

  // Handle export
  const handleExport = () => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    
    if (activeTab === 'receita') {
      if (!reportData.length) {
        showToast('warning', 'Não há dados para exportar');
        return;
      }
      const filename = `relatorio_receita_${dateStr}.csv`;
      exportReportToCSV(reportData, filename, 'revenue');
    } else if (activeTab === 'motorista') {
      if (!driverReports.length) {
        showToast('warning', 'Não há dados para exportar');
        return;
      }
      const filename = `relatorio_motoristas_${dateStr}.csv`;
      exportReportToCSV(driverReports, filename, 'driver');
    } else if (activeTab === 'veiculo') {
      if (!vehicleReports.length) {
        showToast('warning', 'Não há dados para exportar');
        return;
      }
      const filename = `relatorio_veiculos_${dateStr}.csv`;
      exportReportToCSV(vehicleReports, filename, 'vehicle');
    }
    
    showToast('success', 'Relatório exportado com sucesso!');
  };

  // Get unique vehicle types
  const vehicleTypes = useMemo(() => {
    if (!settings?.vehiclesCatalog) return [];
    return settings.vehiclesCatalog;
  }, [settings]);

  const hasData = activeTab === 'receita' ? reportData.length > 0 : 
                  activeTab === 'motorista' ? driverReports.length > 0 :
                  vehicleReports.length > 0;

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
          disabled={!hasData}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
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

          {/* Group By - only for revenue tab */}
          {activeTab === 'receita' && (
            <>
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
            </>
          )}
        </div>

        {/* Saved Filters Section */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filtros Salvos
              </label>
              <div className="flex gap-2">
                <Select
                  value={selectedSavedFilter}
                  onChange={(e) => handleApplySavedFilter(e.target.value)}
                  className="flex-1"
                >
                  <option value="none">Selecione um filtro salvo</option>
                  {savedFilters?.map(filter => (
                    <option key={filter.id} value={filter.id}>
                      {filter.nome}
                    </option>
                  ))}
                </Select>
                {selectedSavedFilter !== 'none' && (
                  <Button
                    variant="ghost"
                    onClick={() => handleDeleteFilter(parseInt(selectedSavedFilter))}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Excluir
                  </Button>
                )}
              </div>
            </div>
            <div className="pt-6">
              {!showSaveFilter ? (
                <Button
                  variant="ghost"
                  onClick={() => setShowSaveFilter(true)}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Salvar Filtro
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Nome do filtro"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    className="w-48"
                  />
                  <Button
                    variant="primary"
                    onClick={handleSaveFilter}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Salvar
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowSaveFilter(false);
                      setFilterName('');
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
              <p className="text-sm font-medium text-gray-600">Serviços</p>
              <p className="text-xl font-bold text-black-900">{summary.totalOS}</p>
            </div>
            <FileBarChart className="h-8 w-8 text-gold-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Médio</p>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(summary.mediaValorServico)}</p>
            </div>
            <Wallet className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
      </div>

      {/* Report Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex gap-4">
            <button
              onClick={() => setActiveTab('receita')}
              className={`py-2 px-4 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'receita'
                  ? 'border-gold-600 text-gold-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <DollarSign className="h-4 w-4" />
              Receita
            </button>
            <button
              onClick={() => setActiveTab('motorista')}
              className={`py-2 px-4 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'motorista'
                  ? 'border-gold-600 text-gold-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="h-4 w-4" />
              Por Motorista
            </button>
            <button
              onClick={() => setActiveTab('veiculo')}
              className={`py-2 px-4 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'veiculo'
                  ? 'border-gold-600 text-gold-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Car className="h-4 w-4" />
              Por Veículo
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'receita' && (
        <>
          {/* Chart Visualization */}
          {revenueChartData && (
            <Card className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Visualização Gráfica</h2>
              <div className="space-y-4">
                {revenueChartData.datasets.map((dataset, datasetIndex) => (
                  <div key={datasetIndex}>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">{dataset.label}</h3>
                    <div className="space-y-2">
                      {dataset.data.map((value, index) => {
                        const maxValue = Math.max(...dataset.data);
                        const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
                        const color = dataset.label === 'Receita' ? 'bg-gold-500' : 'bg-green-500';
                        
                        return (
                          <div key={index} className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-600 w-24 truncate">
                              {revenueChartData.labels[index]}
                            </span>
                            <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                              <div
                                className={`${color} h-6 rounded-full flex items-center justify-end pr-2`}
                                style={{ width: `${percentage}%` }}
                              >
                                <span className="text-xs font-semibold text-white">
                                  {formatCurrency(value)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Revenue Report Table */}
          <Card>
            <h2 className="text-lg font-semibold mb-4">Dados do Relatório de Receita</h2>
            
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
        </>
      )}

      {activeTab === 'motorista' && (
        <>
          {/* Top 5 Drivers Chart */}
          {driverReports.length > 0 && (
            <Card className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Top 5 Motoristas por Receita</h2>
              <div className="space-y-3">
                {driverReports.slice(0, 5).map((driver, index) => {
                  const maxValue = driverReports[0].valorTotal;
                  const percentage = maxValue > 0 ? (driver.valorTotal / maxValue) * 100 : 0;
                  
                  return (
                    <div key={driver.fornecedorId} className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-400 w-8">#{index + 1}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{driver.fornecedorNome}</span>
                          <span className="text-sm font-bold text-green-600">{formatCurrency(driver.valorTotal)}</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-8 relative">
                          <div
                            className="bg-gradient-to-r from-gold-500 to-gold-600 h-8 rounded-full flex items-center justify-between px-3"
                            style={{ width: `${percentage}%` }}
                          >
                            <span className="text-xs font-medium text-white">
                              {driver.servicosCompletados} serviços
                            </span>
                            <span className="text-xs font-medium text-white">
                              {driver.taxaCompletude.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Driver Report Table */}
          <Card>
            <h2 className="text-lg font-semibold mb-4">Relatório de Desempenho por Motorista</h2>
            
            {driverReports.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum dado encontrado para os filtros selecionados</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Motorista
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Serviços
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor Total
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Completados
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cancelados
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Taxa Completude
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Média/Serviço
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {driverReports.map((driver) => (
                      <tr key={driver.fornecedorId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {driver.fornecedorNome}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                          {driver.totalServicos}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-semibold">
                          {formatCurrency(driver.valorTotal)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                          {driver.servicosCompletados}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                          {driver.servicosCancelados}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600 font-semibold">
                          {driver.taxaCompletude.toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                          {formatCurrency(driver.mediaValorServico)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}

      {activeTab === 'veiculo' && (
        <>
          {/* Vehicle Distribution Pie Chart */}
          {vehicleReports.length > 0 && (
            <Card className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Distribuição de Veículos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Visual representation */}
                <div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {vehicleReports.map((vehicle, index) => {
                      const colors = [
                        'bg-gold-500',
                        'bg-blue-500',
                        'bg-red-500',
                        'bg-green-500',
                        'bg-purple-500',
                        'bg-orange-500',
                      ];
                      const totalServicos = vehicleReports.reduce((sum, v) => sum + v.totalServicos, 0);
                      const percentage = totalServicos > 0 ? (vehicle.totalServicos / totalServicos) * 100 : 0;
                      const color = colors[index % colors.length];
                      
                      return (
                        <div
                          key={vehicle.veiculoTipo}
                          className={`${color} text-white px-4 py-6 rounded-lg flex-1 min-w-[120px] text-center`}
                        >
                          <div className="text-3xl font-bold">{percentage.toFixed(0)}%</div>
                          <div className="text-xs mt-1 opacity-90">{vehicle.veiculoTipo}</div>
                          <div className="text-sm font-semibold mt-2">{vehicle.totalServicos} serviços</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Legend and details */}
                <div className="space-y-2">
                  {vehicleReports.map((vehicle, index) => {
                    const colors = [
                      'bg-gold-500',
                      'bg-blue-500',
                      'bg-red-500',
                      'bg-green-500',
                      'bg-purple-500',
                      'bg-orange-500',
                    ];
                    const color = colors[index % colors.length];
                    
                    return (
                      <div key={vehicle.veiculoTipo} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
                        <div className={`${color} w-4 h-4 rounded-full`}></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{vehicle.veiculoTipo}</div>
                          <div className="text-xs text-gray-500">
                            {vehicle.totalServicos} serviços • {formatCurrency(vehicle.valorTotal)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          )}

          {/* Vehicle Report Table */}
          <Card>
            <h2 className="text-lg font-semibold mb-4">Relatório de Utilização por Veículo</h2>
            
            {vehicleReports.length === 0 ? (
              <div className="text-center py-12">
                <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum dado encontrado para os filtros selecionados</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Veículo
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Serviços
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor Total
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Completados
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cancelados
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Taxa Utilização
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Média/Serviço
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vehicleReports.map((vehicle) => (
                      <tr key={vehicle.veiculoTipo} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {vehicle.veiculoTipo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                          {vehicle.totalServicos}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-semibold">
                          {formatCurrency(vehicle.valorTotal)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                          {vehicle.servicosCompletados}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                          {vehicle.servicosCancelados}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600 font-semibold">
                          {vehicle.taxaUtilizacao.toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                          {formatCurrency(vehicle.mediaValorServico)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
