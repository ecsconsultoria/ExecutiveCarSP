import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet
} from 'lucide-react';
import { db } from '../db';
import type { PagamentoCliente, RepasseFornecedor } from '../db/models';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Select, TextArea } from '../components/forms/Input';
import { useToast } from '../components/ui/Toast';

type Tab = 'recebimentos' | 'repasses' | 'dashboard';

export function Financeiro() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [fornecedorFilter, setFornecedorFilter] = useState<string>('all');
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');

  // Modals state
  const [isPagamentoModalOpen, setIsPagamentoModalOpen] = useState(false);
  const [isRepasseModalOpen, setIsRepasseModalOpen] = useState(false);
  const [editingPagamento, setEditingPagamento] = useState<PagamentoCliente | null>(null);
  const [editingRepasse, setEditingRepasse] = useState<RepasseFornecedor | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'pagamento' | 'repasse'; id: number } | null>(null);

  const { showToast } = useToast();

  // Live queries
  const pagamentos = useLiveQuery(() => db.pagamentos_cliente.toArray(), []);
  const repasses = useLiveQuery(() => db.repasses_fornecedor.toArray(), []);
  const ordensServico = useLiveQuery(() => db.ordens_servico.toArray(), []);
  const clientes = useLiveQuery(() => db.clientes.toArray(), []);
  const fornecedores = useLiveQuery(() => db.fornecedores.toArray(), []);
  const settings = useLiveQuery(() => db.settings.get(1), []);

  // Helper functions
  const getClienteNome = (ordemServicoId: number) => {
    const os = ordensServico?.find(o => o.id === ordemServicoId);
    if (!os) return 'N/A';
    const cliente = clientes?.find(c => c.id === os.clienteId);
    return cliente?.nome || 'N/A';
  };

  const getFornecedorNome = (fornecedorId: number) => {
    const fornecedor = fornecedores?.find(f => f.id === fornecedorId);
    return fornecedor?.nome || 'N/A';
  };

  // Calculate if payment is overdue
  const isOverdue = (vencimento: Date, status: string) => {
    if (status === 'Pago' || status === 'Cancelado') return false;
    return new Date(vencimento) < new Date();
  };

  // Filter functions
  const filteredPagamentos = useMemo(() => {
    if (!pagamentos) return [];
    
    return pagamentos.filter(p => {
      // Status filter
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;

      // Date range filter
      if (dateRangeStart && new Date(p.dataVencimento) < new Date(dateRangeStart)) return false;
      if (dateRangeEnd && new Date(p.dataVencimento) > new Date(dateRangeEnd)) return false;

      // Search filter
      if (searchTerm) {
        const clienteNome = getClienteNome(p.ordemServicoId).toLowerCase();
        const osId = p.ordemServicoId.toString();
        return clienteNome.includes(searchTerm.toLowerCase()) || osId.includes(searchTerm);
      }

      return true;
    });
  }, [pagamentos, statusFilter, dateRangeStart, dateRangeEnd, searchTerm, ordensServico, clientes]);

  const filteredRepasses = useMemo(() => {
    if (!repasses) return [];
    
    return repasses.filter(r => {
      // Status filter
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;

      // Fornecedor filter
      if (fornecedorFilter !== 'all' && r.fornecedorId.toString() !== fornecedorFilter) return false;

      // Date range filter
      if (dateRangeStart && new Date(r.dataVencimento) < new Date(dateRangeStart)) return false;
      if (dateRangeEnd && new Date(r.dataVencimento) > new Date(dateRangeEnd)) return false;

      // Search filter
      if (searchTerm) {
        const fornecedorNome = getFornecedorNome(r.fornecedorId).toLowerCase();
        const osId = r.ordemServicoId.toString();
        return fornecedorNome.includes(searchTerm.toLowerCase()) || osId.includes(searchTerm);
      }

      return true;
    });
  }, [repasses, statusFilter, fornecedorFilter, dateRangeStart, dateRangeEnd, searchTerm, fornecedores]);

  // Dashboard calculations
  const dashboardStats = useMemo(() => {
    if (!pagamentos || !repasses || !settings) return null;

    const totalReceita = pagamentos
      .filter(p => p.status === 'Pago')
      .reduce((sum, p) => sum + p.valor, 0);

    const totalRepasses = repasses
      .filter(r => r.status === 'Pago')
      .reduce((sum, r) => sum + r.valor, 0);

    const impostos = totalReceita * (settings.imposto / 100);
    const totalDespesas = totalRepasses + impostos;
    const margem = totalReceita - totalDespesas;

    const aReceber = pagamentos
      .filter(p => p.status === 'AReceber')
      .reduce((sum, p) => sum + p.valor, 0);

    const vencidos = pagamentos
      .filter(p => isOverdue(p.dataVencimento, p.status))
      .reduce((sum, p) => sum + p.valor, 0);

    const aFaturar = repasses
      .filter(r => r.status === 'AFaturar')
      .reduce((sum, r) => sum + r.valor, 0);

    const pendingPagamentos = pagamentos.filter(p => p.status === 'AReceber');
    const vencidosPagamentos = pagamentos.filter(p => isOverdue(p.dataVencimento, p.status));
    const pendingRepasses = repasses.filter(r => r.status === 'AFaturar');

    return {
      totalReceita,
      totalRepasses,
      impostos,
      totalDespesas,
      margem,
      aReceber,
      vencidos,
      aFaturar,
      pendingPagamentos,
      vencidosPagamentos,
      pendingRepasses
    };
  }, [pagamentos, repasses, settings]);

  // CRUD Handlers - Pagamentos
  const handleAddPagamento = () => {
    setEditingPagamento({
      ordemServicoId: 0,
      valor: 0,
      dataVencimento: new Date(),
      dataPagamento: null,
      status: 'AReceber',
      formaPagamento: null,
      observacoes: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setIsPagamentoModalOpen(true);
  };

  const handleEditPagamento = (pagamento: PagamentoCliente) => {
    setEditingPagamento(pagamento);
    setIsPagamentoModalOpen(true);
  };

  const handleMarkAsPaid = async (pagamento: PagamentoCliente) => {
    try {
      await db.pagamentos_cliente.update(pagamento.id!, {
        status: 'Pago',
        dataPagamento: new Date(),
        updatedAt: new Date(),
      });
      showToast('success', 'Pagamento marcado como pago!');
    } catch (error) {
      showToast('error', 'Erro ao atualizar pagamento');
    }
  };

  const handleDeletePagamento = async (id: number) => {
    try {
      await db.pagamentos_cliente.delete(id);
      setDeleteConfirm(null);
      showToast('success', 'Pagamento excluído com sucesso!');
    } catch (error) {
      showToast('error', 'Erro ao excluir pagamento');
    }
  };

  const handleSubmitPagamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPagamento || editingPagamento.ordemServicoId === 0) {
      showToast('error', 'Selecione uma Ordem de Serviço');
      return;
    }

    try {
      const pagamento = {
        ...editingPagamento,
        updatedAt: new Date(),
      };

      if (editingPagamento.id) {
        await db.pagamentos_cliente.update(editingPagamento.id, pagamento);
        showToast('success', 'Pagamento atualizado com sucesso!');
      } else {
        await db.pagamentos_cliente.add(pagamento);
        showToast('success', 'Pagamento cadastrado com sucesso!');
      }

      setIsPagamentoModalOpen(false);
      setEditingPagamento(null);
    } catch (error) {
      showToast('error', 'Erro ao salvar pagamento');
    }
  };

  // CRUD Handlers - Repasses
  const handleAddRepasse = () => {
    setEditingRepasse({
      ordemServicoId: 0,
      fornecedorId: 0,
      valor: 0,
      dataVencimento: new Date(),
      dataPagamento: null,
      status: 'AFaturar',
      formaPagamento: null,
      observacoes: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setIsRepasseModalOpen(true);
  };

  const handleEditRepasse = (repasse: RepasseFornecedor) => {
    setEditingRepasse(repasse);
    setIsRepasseModalOpen(true);
  };

  const handleDeleteRepasse = async (id: number) => {
    try {
      await db.repasses_fornecedor.delete(id);
      setDeleteConfirm(null);
      showToast('success', 'Repasse excluído com sucesso!');
    } catch (error) {
      showToast('error', 'Erro ao excluir repasse');
    }
  };

  const handleSubmitRepasse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRepasse || editingRepasse.ordemServicoId === 0 || editingRepasse.fornecedorId === 0) {
      showToast('error', 'Selecione uma Ordem de Serviço e um Fornecedor');
      return;
    }

    try {
      const repasse = {
        ...editingRepasse,
        updatedAt: new Date(),
      };

      if (editingRepasse.id) {
        await db.repasses_fornecedor.update(editingRepasse.id, repasse);
        showToast('success', 'Repasse atualizado com sucesso!');
      } else {
        await db.repasses_fornecedor.add(repasse);
        showToast('success', 'Repasse cadastrado com sucesso!');
      }

      setIsRepasseModalOpen(false);
      setEditingRepasse(null);
    } catch (error) {
      showToast('error', 'Erro ao salvar repasse');
    }
  };

  // Status badge component
  const PagamentoStatusBadge = ({ status }: { status: PagamentoCliente['status'] }) => {
    const config = {
      AReceber: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'A Receber' },
      Pago: { bg: 'bg-green-100', text: 'text-green-800', label: 'Pago' },
      Vencido: { bg: 'bg-red-100', text: 'text-red-800', label: 'Vencido' },
      Cancelado: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Cancelado' },
    };
    const c = config[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
        {c.label}
      </span>
    );
  };

  const RepasseStatusBadge = ({ status }: { status: RepasseFornecedor['status'] }) => {
    const config = {
      AFaturar: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'A Faturar' },
      Faturado: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Faturado' },
      Pago: { bg: 'bg-green-100', text: 'text-green-800', label: 'Pago' },
    };
    const c = config[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
        {c.label}
      </span>
    );
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Format date
  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black-900">Financeiro</h1>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'dashboard'
                ? 'border-gold-500 text-gold-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('recebimentos')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'recebimentos'
                ? 'border-gold-500 text-gold-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Recebimentos
          </button>
          <button
            onClick={() => setActiveTab('repasses')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'repasses'
                ? 'border-gold-500 text-gold-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Repasses
          </button>
        </nav>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && dashboardStats && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Receita</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(dashboardStats.totalReceita)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Repasses</p>
                  <p className="text-2xl font-bold text-orange-600">{formatCurrency(dashboardStats.totalRepasses)}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-orange-600" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Impostos</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(dashboardStats.impostos)}</p>
                </div>
                <Wallet className="h-8 w-8 text-red-600" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Despesas</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(dashboardStats.totalDespesas)}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Margem</p>
                  <p className={`text-2xl font-bold ${dashboardStats.margem >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(dashboardStats.margem)}
                  </p>
                </div>
                <TrendingUp className={`h-8 w-8 ${dashboardStats.margem >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </Card>
          </div>

          {/* Pending Items */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* A Receber */}
            <Card title="A Receber">
              <div className="mb-4">
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(dashboardStats.aReceber)}</p>
                <p className="text-sm text-gray-600">{dashboardStats.pendingPagamentos.length} pagamentos pendentes</p>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {dashboardStats.pendingPagamentos.map(p => (
                  <div key={p.id} className="flex justify-between items-center text-sm border-b pb-2">
                    <div>
                      <p className="font-medium">OS #{p.ordemServicoId}</p>
                      <p className="text-gray-600">{getClienteNome(p.ordemServicoId)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(p.valor)}</p>
                      <p className="text-gray-600">{formatDate(p.dataVencimento)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Vencidos */}
            <Card title="Vencidos">
              <div className="mb-4">
                <p className="text-2xl font-bold text-red-600">{formatCurrency(dashboardStats.vencidos)}</p>
                <p className="text-sm text-gray-600">{dashboardStats.vencidosPagamentos.length} pagamentos vencidos</p>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {dashboardStats.vencidosPagamentos.map(p => (
                  <div key={p.id} className="flex justify-between items-center text-sm border-b pb-2">
                    <div>
                      <p className="font-medium">OS #{p.ordemServicoId}</p>
                      <p className="text-gray-600">{getClienteNome(p.ordemServicoId)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(p.valor)}</p>
                      <p className="text-red-600">{formatDate(p.dataVencimento)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* A Faturar */}
            <Card title="A Faturar">
              <div className="mb-4">
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(dashboardStats.aFaturar)}</p>
                <p className="text-sm text-gray-600">{dashboardStats.pendingRepasses.length} repasses pendentes</p>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {dashboardStats.pendingRepasses.map(r => (
                  <div key={r.id} className="flex justify-between items-center text-sm border-b pb-2">
                    <div>
                      <p className="font-medium">OS #{r.ordemServicoId}</p>
                      <p className="text-gray-600">{getFornecedorNome(r.fornecedorId)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(r.valor)}</p>
                      <p className="text-gray-600">{formatDate(r.dataVencimento)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Recebimentos Tab */}
      {activeTab === 'recebimentos' && (
        <div className="space-y-4">
          {/* Actions and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar por OS ou Cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-gold-500 focus:border-gold-500"
                />
              </div>
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-48"
            >
              <option value="all">Todos os Status</option>
              <option value="AReceber">A Receber</option>
              <option value="Pago">Pago</option>
              <option value="Vencido">Vencido</option>
              <option value="Cancelado">Cancelado</option>
            </Select>
            <Input
              type="date"
              value={dateRangeStart}
              onChange={(e) => setDateRangeStart(e.target.value)}
              placeholder="Data inicial"
              className="w-full md:w-40"
            />
            <Input
              type="date"
              value={dateRangeEnd}
              onChange={(e) => setDateRangeEnd(e.target.value)}
              placeholder="Data final"
              className="w-full md:w-40"
            />
            <Button onClick={handleAddPagamento}>
              <Plus className="h-5 w-5 mr-2" />
              Novo
            </Button>
          </div>

          {/* Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OS #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimento</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pagamento</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Forma</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPagamentos?.map((pagamento) => {
                    const overdue = isOverdue(pagamento.dataVencimento, pagamento.status);
                    return (
                      <tr key={pagamento.id} className={overdue ? 'bg-red-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{pagamento.ordemServicoId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getClienteNome(pagamento.ordemServicoId)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(pagamento.valor)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(pagamento.dataVencimento)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(pagamento.dataPagamento)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <PagamentoStatusBadge status={overdue && pagamento.status === 'AReceber' ? 'Vencido' : pagamento.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {pagamento.formaPagamento || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          {pagamento.status !== 'Pago' && pagamento.status !== 'Cancelado' && (
                            <button
                              onClick={() => handleMarkAsPaid(pagamento)}
                              className="text-green-600 hover:text-green-900"
                              title="Marcar como Pago"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEditPagamento(pagamento)}
                            className="text-gold-600 hover:text-gold-900"
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ type: 'pagamento', id: pagamento.id! })}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Repasses Tab */}
      {activeTab === 'repasses' && (
        <div className="space-y-4">
          {/* Actions and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar por OS ou Fornecedor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-gold-500 focus:border-gold-500"
                />
              </div>
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-48"
            >
              <option value="all">Todos os Status</option>
              <option value="AFaturar">A Faturar</option>
              <option value="Faturado">Faturado</option>
              <option value="Pago">Pago</option>
            </Select>
            <Select
              value={fornecedorFilter}
              onChange={(e) => setFornecedorFilter(e.target.value)}
              className="w-full md:w-48"
            >
              <option value="all">Todos Fornecedores</option>
              {fornecedores?.map(f => (
                <option key={f.id} value={f.id}>{f.nome}</option>
              ))}
            </Select>
            <Input
              type="date"
              value={dateRangeStart}
              onChange={(e) => setDateRangeStart(e.target.value)}
              placeholder="Data inicial"
              className="w-full md:w-40"
            />
            <Input
              type="date"
              value={dateRangeEnd}
              onChange={(e) => setDateRangeEnd(e.target.value)}
              placeholder="Data final"
              className="w-full md:w-40"
            />
            <Button onClick={handleAddRepasse}>
              <Plus className="h-5 w-5 mr-2" />
              Novo
            </Button>
          </div>

          {/* Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OS #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fornecedor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimento</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pagamento</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Forma</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRepasses?.map((repasse) => (
                    <tr key={repasse.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{repasse.ordemServicoId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getFornecedorNome(repasse.fornecedorId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(repasse.valor)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(repasse.dataVencimento)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(repasse.dataPagamento)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <RepasseStatusBadge status={repasse.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {repasse.formaPagamento || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEditRepasse(repasse)}
                          className="text-gold-600 hover:text-gold-900"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ type: 'repasse', id: repasse.id! })}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Pagamento Modal */}
      <Modal
        isOpen={isPagamentoModalOpen}
        onClose={() => {
          setIsPagamentoModalOpen(false);
          setEditingPagamento(null);
        }}
        title={editingPagamento?.id ? 'Editar Recebimento' : 'Novo Recebimento'}
        size="lg"
      >
        <form onSubmit={handleSubmitPagamento} className="space-y-4">
          <Select
            label="Ordem de Serviço"
            value={editingPagamento?.ordemServicoId || ''}
            onChange={(e) => setEditingPagamento(prev => prev ? { ...prev, ordemServicoId: Number(e.target.value) } : null)}
            required
          >
            <option value="">Selecione...</option>
            {ordensServico?.map(os => (
              <option key={os.id} value={os.id}>
                OS #{os.id} - {clientes?.find(c => c.id === os.clienteId)?.nome}
              </option>
            ))}
          </Select>

          <Input
            type="number"
            label="Valor"
            value={editingPagamento?.valor || ''}
            onChange={(e) => setEditingPagamento(prev => prev ? { ...prev, valor: Number(e.target.value) } : null)}
            step="0.01"
            required
          />

          <Input
            type="date"
            label="Data de Vencimento"
            value={editingPagamento?.dataVencimento ? new Date(editingPagamento.dataVencimento).toISOString().split('T')[0] : ''}
            onChange={(e) => setEditingPagamento(prev => prev ? { ...prev, dataVencimento: new Date(e.target.value) } : null)}
            required
          />

          <Input
            type="date"
            label="Data de Pagamento"
            value={editingPagamento?.dataPagamento ? new Date(editingPagamento.dataPagamento).toISOString().split('T')[0] : ''}
            onChange={(e) => setEditingPagamento(prev => prev ? { ...prev, dataPagamento: e.target.value ? new Date(e.target.value) : null } : null)}
          />

          <Select
            label="Status"
            value={editingPagamento?.status || 'AReceber'}
            onChange={(e) => setEditingPagamento(prev => prev ? { ...prev, status: e.target.value as PagamentoCliente['status'] } : null)}
            required
          >
            <option value="AReceber">A Receber</option>
            <option value="Pago">Pago</option>
            <option value="Vencido">Vencido</option>
            <option value="Cancelado">Cancelado</option>
          </Select>

          <Select
            label="Forma de Pagamento"
            value={editingPagamento?.formaPagamento || ''}
            onChange={(e) => setEditingPagamento(prev => prev ? { ...prev, formaPagamento: e.target.value as PagamentoCliente['formaPagamento'] } : null)}
          >
            <option value="">Selecione...</option>
            <option value="PIX">PIX</option>
            <option value="Cartao">Cartão</option>
            <option value="Boleto">Boleto</option>
            <option value="Transferencia">Transferência</option>
          </Select>

          <TextArea
            label="Observações"
            value={editingPagamento?.observacoes || ''}
            onChange={(e) => setEditingPagamento(prev => prev ? { ...prev, observacoes: e.target.value } : null)}
            rows={3}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsPagamentoModalOpen(false);
                setEditingPagamento(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {editingPagamento?.id ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Repasse Modal */}
      <Modal
        isOpen={isRepasseModalOpen}
        onClose={() => {
          setIsRepasseModalOpen(false);
          setEditingRepasse(null);
        }}
        title={editingRepasse?.id ? 'Editar Repasse' : 'Novo Repasse'}
        size="lg"
      >
        <form onSubmit={handleSubmitRepasse} className="space-y-4">
          <Select
            label="Ordem de Serviço"
            value={editingRepasse?.ordemServicoId || ''}
            onChange={(e) => setEditingRepasse(prev => prev ? { ...prev, ordemServicoId: Number(e.target.value) } : null)}
            required
          >
            <option value="">Selecione...</option>
            {ordensServico?.map(os => (
              <option key={os.id} value={os.id}>
                OS #{os.id} - {clientes?.find(c => c.id === os.clienteId)?.nome}
              </option>
            ))}
          </Select>

          <Select
            label="Fornecedor"
            value={editingRepasse?.fornecedorId || ''}
            onChange={(e) => setEditingRepasse(prev => prev ? { ...prev, fornecedorId: Number(e.target.value) } : null)}
            required
          >
            <option value="">Selecione...</option>
            {fornecedores?.map(f => (
              <option key={f.id} value={f.id}>{f.nome}</option>
            ))}
          </Select>

          <Input
            type="number"
            label="Valor"
            value={editingRepasse?.valor || ''}
            onChange={(e) => setEditingRepasse(prev => prev ? { ...prev, valor: Number(e.target.value) } : null)}
            step="0.01"
            required
          />

          <Input
            type="date"
            label="Data de Vencimento"
            value={editingRepasse?.dataVencimento ? new Date(editingRepasse.dataVencimento).toISOString().split('T')[0] : ''}
            onChange={(e) => setEditingRepasse(prev => prev ? { ...prev, dataVencimento: new Date(e.target.value) } : null)}
            required
          />

          <Input
            type="date"
            label="Data de Pagamento"
            value={editingRepasse?.dataPagamento ? new Date(editingRepasse.dataPagamento).toISOString().split('T')[0] : ''}
            onChange={(e) => setEditingRepasse(prev => prev ? { ...prev, dataPagamento: e.target.value ? new Date(e.target.value) : null } : null)}
          />

          <Select
            label="Status"
            value={editingRepasse?.status || 'AFaturar'}
            onChange={(e) => setEditingRepasse(prev => prev ? { ...prev, status: e.target.value as RepasseFornecedor['status'] } : null)}
            required
          >
            <option value="AFaturar">A Faturar</option>
            <option value="Faturado">Faturado</option>
            <option value="Pago">Pago</option>
          </Select>

          <Select
            label="Forma de Pagamento"
            value={editingRepasse?.formaPagamento || ''}
            onChange={(e) => setEditingRepasse(prev => prev ? { ...prev, formaPagamento: e.target.value as RepasseFornecedor['formaPagamento'] } : null)}
          >
            <option value="">Selecione...</option>
            <option value="PIX">PIX</option>
            <option value="Cartao">Cartão</option>
            <option value="Boleto">Boleto</option>
            <option value="Transferencia">Transferência</option>
          </Select>

          <TextArea
            label="Observações"
            value={editingRepasse?.observacoes || ''}
            onChange={(e) => setEditingRepasse(prev => prev ? { ...prev, observacoes: e.target.value } : null)}
            rows={3}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsRepasseModalOpen(false);
                setEditingRepasse(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {editingRepasse?.id ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        title="Confirmar Exclusão"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Tem certeza que deseja excluir este {deleteConfirm?.type === 'pagamento' ? 'recebimento' : 'repasse'}?
            Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (deleteConfirm?.type === 'pagamento') {
                  handleDeletePagamento(deleteConfirm.id);
                } else if (deleteConfirm?.type === 'repasse') {
                  handleDeleteRepasse(deleteConfirm.id);
                }
              }}
            >
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
