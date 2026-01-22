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
  Wallet,
  FileText,
  Download,
  Upload,
  X,
  Split,
  FileDown
} from 'lucide-react';
import { db } from '../db';
import type { PagamentoCliente, RepasseFornecedor, Parcela, Anexo } from '../db/models';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Select, TextArea } from '../components/forms/Input';
import { useToast } from '../components/ui/Toast';
import { formatCurrency } from '../utils/currency';
import { formatDate as formatDateUtil } from '../utils/date';
import { generateFinancialExtractPDF } from '../utils/pdfAdvanced';

type Tab = 'recebimentos' | 'repasses' | 'dashboard';

export function Financeiro() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [fornecedorFilter, setFornecedorFilter] = useState<string>('all');
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');
  const [reconciledFilter, setReconciledFilter] = useState<string>('all'); // Phase 3: Reconciliation filter

  // Modals state
  const [isPagamentoModalOpen, setIsPagamentoModalOpen] = useState(false);
  const [isRepasseModalOpen, setIsRepasseModalOpen] = useState(false);
  const [editingPagamento, setEditingPagamento] = useState<PagamentoCliente | null>(null);
  const [editingRepasse, setEditingRepasse] = useState<RepasseFornecedor | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'pagamento' | 'repasse'; id: number } | null>(null);
  
  // Phase 3: Installments modal
  const [isInstallmentsModalOpen, setIsInstallmentsModalOpen] = useState(false);
  const [installmentsConfig, setInstallmentsConfig] = useState({ numParcelas: 1, juros: 0, desconto: 0 });
  
  // Phase 3: Extract modal
  const [isExtractModalOpen, setIsExtractModalOpen] = useState(false);
  const [extractFilters, setExtractFilters] = useState({ clienteId: '', fornecedorId: '', osId: '' });

  const { showToast } = useToast();

  // Live queries
  const pagamentos = useLiveQuery(() => db.pagamentos_cliente.toArray(), []);
  const repasses = useLiveQuery(() => db.repasses_fornecedor.toArray(), []);
  const ordensServico = useLiveQuery(() => db.ordens_servico.toArray(), []);
  const clientes = useLiveQuery(() => db.clientes.toArray(), []);
  const fornecedores = useLiveQuery(() => db.fornecedores.toArray(), []);
  const settings = useLiveQuery(() => db.settings.get(1), []);
  const anexos = useLiveQuery(() => db.anexos.toArray(), []); // Phase 3: Attachments

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
      
      // Reconciled filter (Phase 3)
      if (reconciledFilter === 'reconciled' && !p.conciliado) return false;
      if (reconciledFilter === 'not_reconciled' && p.conciliado) return false;

      // Date range filter
      if (dateRangeStart && new Date(p.dataVencimento) < new Date(dateRangeStart)) return false;
      if (dateRangeEnd && new Date(p.dataVencimento) > new Date(dateRangeEnd)) return false;

      // Search filter
      if (searchTerm) {
        const clienteNome = getClienteNome(p.ordemServicoId).toLowerCase();
        const osId = p.ordemServicoId.toString();
        const centroCusto = (p.centroCusto || '').toLowerCase();
        return clienteNome.includes(searchTerm.toLowerCase()) || 
               osId.includes(searchTerm) || 
               centroCusto.includes(searchTerm.toLowerCase());
      }

      return true;
    });
  }, [pagamentos, statusFilter, reconciledFilter, dateRangeStart, dateRangeEnd, searchTerm, ordensServico, clientes]);

  const filteredRepasses = useMemo(() => {
    if (!repasses) return [];
    
    return repasses.filter(r => {
      // Status filter
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;

      // Fornecedor filter
      if (fornecedorFilter !== 'all' && r.fornecedorId.toString() !== fornecedorFilter) return false;
      
      // Reconciled filter (Phase 3)
      if (reconciledFilter === 'reconciled' && !r.conciliado) return false;
      if (reconciledFilter === 'not_reconciled' && r.conciliado) return false;

      // Date range filter
      if (dateRangeStart && new Date(r.dataVencimento) < new Date(dateRangeStart)) return false;
      if (dateRangeEnd && new Date(r.dataVencimento) > new Date(dateRangeEnd)) return false;

      // Search filter
      if (searchTerm) {
        const fornecedorNome = getFornecedorNome(r.fornecedorId).toLowerCase();
        const osId = r.ordemServicoId.toString();
        const centroCusto = (r.centroCusto || '').toLowerCase();
        return fornecedorNome.includes(searchTerm.toLowerCase()) || 
               osId.includes(searchTerm) || 
               centroCusto.includes(searchTerm.toLowerCase());
      }

      return true;
    });
  }, [repasses, statusFilter, fornecedorFilter, reconciledFilter, dateRangeStart, dateRangeEnd, searchTerm, fornecedores]);

  // Dashboard calculations
  const dashboardStats = useMemo(() => {
    if (!pagamentos || !repasses || !ordensServico) return null;

    const totalReceita = pagamentos
      .filter(p => p.status === 'Pago')
      .reduce((sum, p) => sum + p.valor, 0);

    const totalRepasses = repasses
      .filter(r => r.status === 'Pago')
      .reduce((sum, r) => sum + r.valor, 0);

    // Calculate impostos from the OrdemServico records
    const impostos = ordensServico.reduce((sum, os) => sum + (os.impostosAplicados || 0), 0);
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
  }, [pagamentos, repasses, ordensServico]);

  // CRUD Handlers - Pagamentos
  const handleAddPagamento = () => {
    setEditingPagamento({
      ordemServicoId: undefined as any,
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
    if (!editingPagamento || !editingPagamento.ordemServicoId) {
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
      ordemServicoId: undefined as any,
      fornecedorId: undefined as any,
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
    if (!editingRepasse || !editingRepasse.ordemServicoId || !editingRepasse.fornecedorId) {
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

  // Phase 3: Reconciliation handlers
  const handleToggleReconciled = async (type: 'pagamento' | 'repasse', id: number, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      const update = {
        conciliado: newStatus,
        dataConciliacao: newStatus ? new Date() : null,
        updatedAt: new Date(),
      };

      if (type === 'pagamento') {
        await db.pagamentos_cliente.update(id, update);
      } else {
        await db.repasses_fornecedor.update(id, update);
      }

      showToast('success', newStatus ? 'Item marcado como conciliado!' : 'Conciliação removida!');
    } catch (error) {
      showToast('error', 'Erro ao atualizar conciliação');
    }
  };

  // Phase 3: Installments handlers
  const handleOpenInstallmentsModal = () => {
    setInstallmentsConfig({ numParcelas: 1, juros: 0, desconto: 0 });
    setIsInstallmentsModalOpen(true);
  };

  const handleGenerateInstallments = () => {
    if (!editingPagamento || installmentsConfig.numParcelas < 1) {
      showToast('error', 'Configure o número de parcelas');
      return;
    }

    const valorTotal = editingPagamento.valor;
    const numParcelas = installmentsConfig.numParcelas;
    const valorParcela = valorTotal / numParcelas;
    
    const parcelas: Parcela[] = [];
    const baseDate = editingPagamento.dataVencimento;
    
    for (let i = 0; i < numParcelas; i++) {
      const dataVencimento = new Date(baseDate);
      dataVencimento.setMonth(dataVencimento.getMonth() + i);
      
      parcelas.push({
        numero: i + 1,
        valor: valorParcela,
        dataVencimento,
        dataPagamento: null,
        status: 'Pendente',
        juros: i > 0 ? installmentsConfig.juros : 0,
        desconto: i === 0 ? installmentsConfig.desconto : 0,
      });
    }

    setEditingPagamento(prev => prev ? { ...prev, parcelas } : null);
    setIsInstallmentsModalOpen(false);
    showToast('success', `${numParcelas} parcelas geradas!`);
  };

  const handlePayInstallment = async (pagamentoId: number, parcelaNumero: number) => {
    try {
      const pagamento = pagamentos?.find(p => p.id === pagamentoId);
      if (!pagamento || !pagamento.parcelas) return;

      const updatedParcelas = pagamento.parcelas.map(p => 
        p.numero === parcelaNumero 
          ? { ...p, status: 'Pago' as const, dataPagamento: new Date() }
          : p
      );

      const allPaid = updatedParcelas.every(p => p.status === 'Pago');

      await db.pagamentos_cliente.update(pagamentoId, {
        parcelas: updatedParcelas,
        status: allPaid ? 'Pago' : pagamento.status,
        dataPagamento: allPaid ? new Date() : pagamento.dataPagamento,
        updatedAt: new Date(),
      });

      showToast('success', 'Parcela paga com sucesso!');
    } catch (error) {
      showToast('error', 'Erro ao pagar parcela');
    }
  };

  // Phase 3: Attachments handlers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'pagamento' | 'repasse') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const fileList = Array.from(files);
      const anexoIds: number[] = [];

      for (const file of fileList) {
        const reader = new FileReader();
        const url = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });

        const anexo: Anexo = {
          ordemServicoId: null,
          pagamentoClienteId: type === 'pagamento' && editingPagamento?.id ? editingPagamento.id : null,
          repasseFornecedorId: type === 'repasse' && editingRepasse?.id ? editingRepasse.id : null,
          nome: file.name,
          tipo: file.type,
          tamanho: file.size,
          url,
          createdAt: new Date(),
        };

        const id = await db.anexos.add(anexo);
        anexoIds.push(id as number);
      }

      if (type === 'pagamento' && editingPagamento) {
        const currentIds = editingPagamento.anexoIds || [];
        setEditingPagamento({ ...editingPagamento, anexoIds: [...currentIds, ...anexoIds] });
      } else if (type === 'repasse' && editingRepasse) {
        const currentIds = editingRepasse.anexoIds || [];
        setEditingRepasse({ ...editingRepasse, anexoIds: [...currentIds, ...anexoIds] });
      }

      showToast('success', `${fileList.length} arquivo(s) anexado(s)!`);
    } catch (error) {
      showToast('error', 'Erro ao fazer upload de arquivos');
    }
  };

  const handleRemoveAttachment = async (anexoId: number, type: 'pagamento' | 'repasse') => {
    try {
      await db.anexos.delete(anexoId);

      if (type === 'pagamento' && editingPagamento) {
        const updatedIds = (editingPagamento.anexoIds || []).filter(id => id !== anexoId);
        setEditingPagamento({ ...editingPagamento, anexoIds: updatedIds });
      } else if (type === 'repasse' && editingRepasse) {
        const updatedIds = (editingRepasse.anexoIds || []).filter(id => id !== anexoId);
        setEditingRepasse({ ...editingRepasse, anexoIds: updatedIds });
      }

      showToast('success', 'Anexo removido!');
    } catch (error) {
      showToast('error', 'Erro ao remover anexo');
    }
  };

  const handleDownloadAttachment = (anexo: Anexo) => {
    const link = document.createElement('a');
    link.href = anexo.url;
    link.download = anexo.nome;
    link.click();
  };

  // Phase 3: Financial Extract
  const handleGenerateExtract = async () => {
    try {
      if (!settings) {
        showToast('error', 'Configurações não encontradas');
        return;
      }

      let filteredPagamentosForExtract = pagamentos || [];
      let filteredRepassesForExtract = repasses || [];
      let filterDescription = 'Todos os registros';

      if (extractFilters.osId) {
        const osId = Number(extractFilters.osId);
        filteredPagamentosForExtract = filteredPagamentosForExtract.filter(p => p.ordemServicoId === osId);
        filteredRepassesForExtract = filteredRepassesForExtract.filter(r => r.ordemServicoId === osId);
        filterDescription = `OS #${osId}`;
      } else if (extractFilters.clienteId) {
        const clienteId = Number(extractFilters.clienteId);
        const clienteOS = ordensServico?.filter(os => os.clienteId === clienteId).map(os => os.id!) || [];
        filteredPagamentosForExtract = filteredPagamentosForExtract.filter(p => clienteOS.includes(p.ordemServicoId));
        const cliente = clientes?.find(c => c.id === clienteId);
        filterDescription = `Cliente: ${cliente?.nome || clienteId}`;
      } else if (extractFilters.fornecedorId) {
        const fornecedorId = Number(extractFilters.fornecedorId);
        filteredRepassesForExtract = filteredRepassesForExtract.filter(r => r.fornecedorId === fornecedorId);
        const fornecedor = fornecedores?.find(f => f.id === fornecedorId);
        filterDescription = `Fornecedor: ${fornecedor?.nome || fornecedorId}`;
        filteredPagamentosForExtract = []; // No payments for supplier extract
      }

      if (dateRangeStart) {
        const startDate = new Date(dateRangeStart);
        filteredPagamentosForExtract = filteredPagamentosForExtract.filter(p => new Date(p.dataVencimento) >= startDate);
        filteredRepassesForExtract = filteredRepassesForExtract.filter(r => new Date(r.dataVencimento) >= startDate);
      }

      if (dateRangeEnd) {
        const endDate = new Date(dateRangeEnd);
        filteredPagamentosForExtract = filteredPagamentosForExtract.filter(p => new Date(p.dataVencimento) <= endDate);
        filteredRepassesForExtract = filteredRepassesForExtract.filter(r => new Date(r.dataVencimento) <= endDate);
      }

      if (dateRangeStart && dateRangeEnd) {
        filterDescription += ` (${formatDate(new Date(dateRangeStart))} - ${formatDate(new Date(dateRangeEnd))})`;
      }

      await generateFinancialExtractPDF(
        filteredPagamentosForExtract,
        filteredRepassesForExtract,
        settings,
        filterDescription
      );

      setIsExtractModalOpen(false);
      showToast('success', 'Extrato gerado com sucesso!');
    } catch (error) {
      showToast('error', 'Erro ao gerar extrato');
      console.error(error);
    }
  };

  // Phase 3: CSV Export
  const handleExportCSV = () => {
    try {
      const data = activeTab === 'recebimentos' ? filteredPagamentos : filteredRepasses;
      
      if (data.length === 0) {
        showToast('error', 'Nenhum dado para exportar');
        return;
      }

      const csvData = data.map((item: any) => {
        if (activeTab === 'recebimentos') {
          const p = item as PagamentoCliente;
          return {
            'OS': p.ordemServicoId,
            'Cliente': getClienteNome(p.ordemServicoId),
            'Valor': p.valor.toFixed(2),
            'Vencimento': formatDate(p.dataVencimento),
            'Pagamento': formatDate(p.dataPagamento),
            'Status': p.status,
            'Forma': p.formaPagamento || '-',
            'CentroCusto': p.centroCusto || '-',
            'Conciliado': p.conciliado ? 'Sim' : 'Não',
            'Parcelas': p.parcelas?.length || 0,
          };
        } else {
          const r = item as RepasseFornecedor;
          return {
            'OS': r.ordemServicoId,
            'Fornecedor': getFornecedorNome(r.fornecedorId),
            'Valor': r.valor.toFixed(2),
            'Vencimento': formatDate(r.dataVencimento),
            'Pagamento': formatDate(r.dataPagamento),
            'Status': r.status,
            'Forma': r.formaPagamento || '-',
            'CentroCusto': r.centroCusto || '-',
            'Conciliado': r.conciliado ? 'Sim' : 'Não',
          };
        }
      });

      // Convert to CSV
      const headers = Object.keys(csvData[0]);
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => headers.map(h => `"${(row as any)[h]}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      showToast('success', 'Arquivo CSV exportado com sucesso!');
    } catch (error) {
      showToast('error', 'Erro ao exportar CSV');
      console.error(error);
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

  // Format date helper
  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return formatDateUtil(date);
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
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Buscar por OS, Cliente ou Centro de Custo..."
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
              <Select
                value={reconciledFilter}
                onChange={(e) => setReconciledFilter(e.target.value)}
                className="w-full md:w-48"
              >
                <option value="all">Todos</option>
                <option value="reconciled">Conciliados</option>
                <option value="not_reconciled">Não Conciliados</option>
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
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddPagamento}>
                <Plus className="h-5 w-5 mr-2" />
                Novo
              </Button>
              <Button onClick={() => setIsExtractModalOpen(true)} variant="ghost">
                <FileText className="h-5 w-5 mr-2" />
                Extrato
              </Button>
              <Button onClick={handleExportCSV} variant="ghost">
                <FileDown className="h-5 w-5 mr-2" />
                Exportar CSV
              </Button>
            </div>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Centro Custo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parcelas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Anexos</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPagamentos?.map((pagamento) => {
                    const overdue = isOverdue(pagamento.dataVencimento, pagamento.status);
                    const anexosList = anexos?.filter(a => pagamento.anexoIds?.includes(a.id!)) || [];
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <PagamentoStatusBadge status={overdue && pagamento.status === 'AReceber' ? 'Vencido' : pagamento.status} />
                            {pagamento.conciliado && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                ✓ Conciliado
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {pagamento.centroCusto || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {pagamento.parcelas ? (
                            <div className="flex flex-col gap-1">
                              <span>{pagamento.parcelas.length}x</span>
                              <span className="text-xs text-gray-500">
                                {pagamento.parcelas.filter(p => p.status === 'Pago').length} pagas
                              </span>
                            </div>
                          ) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {anexosList.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              {anexosList.map(anexo => (
                                <button
                                  key={anexo.id}
                                  onClick={() => handleDownloadAttachment(anexo)}
                                  className="text-blue-600 hover:text-blue-900 text-xs flex items-center gap-1"
                                >
                                  <Download className="h-3 w-3" />
                                  {anexo.nome.substring(0, 15)}...
                                </button>
                              ))}
                            </div>
                          ) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
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
                              onClick={() => handleToggleReconciled('pagamento', pagamento.id!, !!pagamento.conciliado)}
                              className={`${pagamento.conciliado ? 'text-green-600' : 'text-gray-400'} hover:text-green-900`}
                              title={pagamento.conciliado ? 'Desmarcar Conciliação' : 'Marcar como Conciliado'}
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
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
                          </div>
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
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Buscar por OS, Fornecedor ou Centro de Custo..."
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
              <Select
                value={reconciledFilter}
                onChange={(e) => setReconciledFilter(e.target.value)}
                className="w-full md:w-48"
              >
                <option value="all">Todos</option>
                <option value="reconciled">Conciliados</option>
                <option value="not_reconciled">Não Conciliados</option>
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
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddRepasse}>
                <Plus className="h-5 w-5 mr-2" />
                Novo
              </Button>
              <Button onClick={() => setIsExtractModalOpen(true)} variant="ghost">
                <FileText className="h-5 w-5 mr-2" />
                Extrato
              </Button>
              <Button onClick={handleExportCSV} variant="ghost">
                <FileDown className="h-5 w-5 mr-2" />
                Exportar CSV
              </Button>
            </div>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Centro Custo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Anexos</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRepasses?.map((repasse) => {
                    const anexosList = anexos?.filter(a => repasse.anexoIds?.includes(a.id!)) || [];
                    return (
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <RepasseStatusBadge status={repasse.status} />
                            {repasse.conciliado && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                ✓ Conciliado
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {repasse.centroCusto || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {anexosList.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              {anexosList.map(anexo => (
                                <button
                                  key={anexo.id}
                                  onClick={() => handleDownloadAttachment(anexo)}
                                  className="text-blue-600 hover:text-blue-900 text-xs flex items-center gap-1"
                                >
                                  <Download className="h-3 w-3" />
                                  {anexo.nome.substring(0, 15)}...
                                </button>
                              ))}
                            </div>
                          ) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleToggleReconciled('repasse', repasse.id!, !!repasse.conciliado)}
                              className={`${repasse.conciliado ? 'text-green-600' : 'text-gray-400'} hover:text-green-900`}
                              title={repasse.conciliado ? 'Desmarcar Conciliação' : 'Marcar como Conciliado'}
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
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
                          </div>
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

          {/* Phase 3: Cost Center */}
          <Input
            label="Centro de Custo"
            value={editingPagamento?.centroCusto || ''}
            onChange={(e) => setEditingPagamento(prev => prev ? { ...prev, centroCusto: e.target.value } : null)}
            placeholder="Ex: Corporativo, Operacional..."
          />

          {/* Phase 3: Installments */}
          {!editingPagamento?.id && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Parcelamento</label>
                <Button type="button" onClick={handleOpenInstallmentsModal} variant="ghost" size="sm">
                  <Split className="h-4 w-4 mr-2" />
                  Configurar Parcelas
                </Button>
              </div>
              {editingPagamento?.parcelas && editingPagamento.parcelas.length > 0 && (
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600 mb-2">{editingPagamento.parcelas.length} parcelas configuradas</p>
                  <div className="space-y-1">
                    {editingPagamento.parcelas.slice(0, 3).map(p => (
                      <div key={p.numero} className="text-xs text-gray-600">
                        Parcela {p.numero}: {formatCurrency(p.valor)} - Venc: {formatDate(p.dataVencimento)}
                      </div>
                    ))}
                    {editingPagamento.parcelas.length > 3 && (
                      <p className="text-xs text-gray-500">+ {editingPagamento.parcelas.length - 3} parcelas...</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Phase 3: Display existing installments */}
          {editingPagamento?.id && editingPagamento?.parcelas && editingPagamento.parcelas.length > 0 && (
            <div className="border-t pt-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Parcelas</label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {editingPagamento.parcelas.map(parcela => (
                  <div key={parcela.numero} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <div className="flex-1">
                      <p className="text-sm font-medium">Parcela {parcela.numero}/{editingPagamento.parcelas!.length}</p>
                      <p className="text-xs text-gray-600">
                        {formatCurrency(parcela.valor)} - Venc: {formatDate(parcela.dataVencimento)}
                        {parcela.juros && parcela.juros > 0 && ` | Juros: ${formatCurrency(parcela.juros)}`}
                        {parcela.desconto && parcela.desconto > 0 && ` | Desc: ${formatCurrency(parcela.desconto)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        parcela.status === 'Pago' ? 'bg-green-100 text-green-800' : 
                        parcela.status === 'Vencido' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {parcela.status}
                      </span>
                      {parcela.status !== 'Pago' && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handlePayInstallment(editingPagamento.id!, parcela.numero)}
                        >
                          Pagar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Phase 3: Attachments */}
          <div className="border-t pt-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Anexos</label>
            <div className="space-y-2">
              {editingPagamento?.anexoIds && editingPagamento.anexoIds.length > 0 && (
                <div className="space-y-1">
                  {anexos?.filter(a => editingPagamento.anexoIds!.includes(a.id!)).map(anexo => (
                    <div key={anexo.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{anexo.nome}</span>
                        <span className="text-xs text-gray-500">({(anexo.tamanho / 1024).toFixed(1)} KB)</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleDownloadAttachment(anexo)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(anexo.id!, 'pagamento')}
                          className="text-red-600 hover:text-red-900"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <label className="flex items-center justify-center w-full h-10 px-4 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <Upload className="h-4 w-4 mr-2 text-gray-400" />
                <span className="text-sm text-gray-600">Adicionar Anexo</span>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  onChange={(e) => handleFileUpload(e, 'pagamento')}
                />
              </label>
            </div>
          </div>

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

          {/* Phase 3: Cost Center */}
          <Input
            label="Centro de Custo"
            value={editingRepasse?.centroCusto || ''}
            onChange={(e) => setEditingRepasse(prev => prev ? { ...prev, centroCusto: e.target.value } : null)}
            placeholder="Ex: Corporativo, Operacional..."
          />

          {/* Phase 3: Attachments */}
          <div className="border-t pt-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Anexos</label>
            <div className="space-y-2">
              {editingRepasse?.anexoIds && editingRepasse.anexoIds.length > 0 && (
                <div className="space-y-1">
                  {anexos?.filter(a => editingRepasse.anexoIds!.includes(a.id!)).map(anexo => (
                    <div key={anexo.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{anexo.nome}</span>
                        <span className="text-xs text-gray-500">({(anexo.tamanho / 1024).toFixed(1)} KB)</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleDownloadAttachment(anexo)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(anexo.id!, 'repasse')}
                          className="text-red-600 hover:text-red-900"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <label className="flex items-center justify-center w-full h-10 px-4 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <Upload className="h-4 w-4 mr-2 text-gray-400" />
                <span className="text-sm text-gray-600">Adicionar Anexo</span>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  onChange={(e) => handleFileUpload(e, 'repasse')}
                />
              </label>
            </div>
          </div>

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

      {/* Phase 3: Installments Configuration Modal */}
      <Modal
        isOpen={isInstallmentsModalOpen}
        onClose={() => setIsInstallmentsModalOpen(false)}
        title="Configurar Parcelamento"
        size="md"
      >
        <div className="space-y-4">
          <Input
            type="number"
            label="Número de Parcelas"
            value={installmentsConfig.numParcelas}
            onChange={(e) => setInstallmentsConfig({ ...installmentsConfig, numParcelas: Number(e.target.value) })}
            min="1"
            max="12"
            required
          />
          
          <Input
            type="number"
            label="Juros por Parcela (R$)"
            value={installmentsConfig.juros}
            onChange={(e) => setInstallmentsConfig({ ...installmentsConfig, juros: Number(e.target.value) })}
            step="0.01"
            min="0"
          />
          
          <Input
            type="number"
            label="Desconto na 1ª Parcela (R$)"
            value={installmentsConfig.desconto}
            onChange={(e) => setInstallmentsConfig({ ...installmentsConfig, desconto: Number(e.target.value) })}
            step="0.01"
            min="0"
          />

          {editingPagamento && (
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm font-medium text-gray-700 mb-2">Resumo:</p>
              <p className="text-xs text-gray-600">
                Valor Total: {formatCurrency(editingPagamento.valor)}
              </p>
              <p className="text-xs text-gray-600">
                Valor por Parcela: {formatCurrency(editingPagamento.valor / installmentsConfig.numParcelas)}
              </p>
              <p className="text-xs text-gray-600">
                Parcelas: {installmentsConfig.numParcelas}x de {formatCurrency(editingPagamento.valor / installmentsConfig.numParcelas)}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={() => setIsInstallmentsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGenerateInstallments}>
              Gerar Parcelas
            </Button>
          </div>
        </div>
      </Modal>

      {/* Phase 3: Extract Modal */}
      <Modal
        isOpen={isExtractModalOpen}
        onClose={() => setIsExtractModalOpen(false)}
        title="Gerar Extrato Financeiro"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Selecione os filtros para gerar o extrato em PDF:
          </p>

          <Select
            label="Cliente"
            value={extractFilters.clienteId}
            onChange={(e) => setExtractFilters({ ...extractFilters, clienteId: e.target.value, fornecedorId: '', osId: '' })}
          >
            <option value="">Todos os Clientes</option>
            {clientes?.map(c => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </Select>

          <Select
            label="Fornecedor"
            value={extractFilters.fornecedorId}
            onChange={(e) => setExtractFilters({ ...extractFilters, fornecedorId: e.target.value, clienteId: '', osId: '' })}
          >
            <option value="">Todos os Fornecedores</option>
            {fornecedores?.map(f => (
              <option key={f.id} value={f.id}>{f.nome}</option>
            ))}
          </Select>

          <Input
            label="Ordem de Serviço #"
            value={extractFilters.osId}
            onChange={(e) => setExtractFilters({ ...extractFilters, osId: e.target.value, clienteId: '', fornecedorId: '' })}
            placeholder="Digite o número da OS"
          />

          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
            <p className="font-medium mb-1">Filtros de data ativos:</p>
            <p className="text-xs">
              {dateRangeStart ? `De: ${formatDate(new Date(dateRangeStart))}` : 'Sem data inicial'}
            </p>
            <p className="text-xs">
              {dateRangeEnd ? `Até: ${formatDate(new Date(dateRangeEnd))}` : 'Sem data final'}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={() => setIsExtractModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGenerateExtract}>
              <FileText className="h-4 w-4 mr-2" />
              Gerar PDF
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
