import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileDown, Receipt, Plus } from 'lucide-react';
import { db } from '../db';
import type { OrdemServico, PagamentoCliente, RepasseFornecedor } from '../db/models';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { TextArea, Input, Select } from '../components/forms/Input';
import { useToast } from '../components/ui/Toast';
import { formatCurrency } from '../utils/currency';
import { generateOSConfirmationPDF, generateReceiptPDF } from '../utils/pdf';

export function OSDetail() {
  const { id } = useParams<{ id: string }>();
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<OrdemServico['status']>('Reservado');
  const [motivoCancelamento, setMotivoCancelamento] = useState('');
  
  // Financial modals
  const [showPagamentoModal, setShowPagamentoModal] = useState(false);
  const [showRepasseModal, setShowRepasseModal] = useState(false);
  
  // Forms state
  const [pagamentoForm, setPagamentoForm] = useState({
    valor: 0,
    dataVencimento: '',
    status: 'AReceber' as PagamentoCliente['status'],
    formaPagamento: null as PagamentoCliente['formaPagamento'],
    observacoes: '',
  });
  
  const [repasseForm, setRepasseForm] = useState({
    valor: 0,
    dataVencimento: '',
    status: 'AFaturar' as RepasseFornecedor['status'],
    formaPagamento: null as RepasseFornecedor['formaPagamento'],
    observacoes: '',
  });

  const { showToast } = useToast();

  const os = useLiveQuery(() => db.ordens_servico.get(Number(id)), [id]);
  const cliente = useLiveQuery(
    () => (os ? db.clientes.get(os.clienteId) : undefined),
    [os]
  );
  const fornecedor = useLiveQuery(
    () => (os?.fornecedorId ? db.fornecedores.get(os.fornecedorId) : undefined),
    [os]
  );
  const settings = useLiveQuery(() => db.settings.get(1));
  
  // Financial data
  const pagamentos = useLiveQuery(
    () => (os ? db.pagamentos_cliente.where('ordemServicoId').equals(os.id!).toArray() : []),
    [os]
  );
  const repasses = useLiveQuery(
    () => (os ? db.repasses_fornecedor.where('ordemServicoId').equals(os.id!).toArray() : []),
    [os]
  );
  const despesas = useLiveQuery(
    () => (os ? db.despesas.where('ordemServicoId').equals(os.id!).toArray() : []),
    [os]
  );

  if (!os) {
    return (
      <div className="p-6">
        <Card>
          <p className="text-center text-gray-500">Ordem de serviço não encontrada.</p>
        </Card>
      </div>
    );
  }

  const handleStatusChange = async () => {
    if (!os.id) return;

    const updates: Partial<OrdemServico> = {
      status: newStatus,
      updatedAt: new Date(),
    };

    if (newStatus === 'Cancelado') {
      const horasAntecedencia =
        (os.agendamento.dataHoraInicio.getTime() - Date.now()) / (1000 * 60 * 60);
      
      let taxaPercentual = 0;
      for (const policy of settings?.cancelPolicy || []) {
        if (
          horasAntecedencia >= policy.minHours &&
          (!policy.maxHours || horasAntecedencia < policy.maxHours)
        ) {
          taxaPercentual = policy.percentage;
          break;
        }
      }

      updates.motivoCancelamento = motivoCancelamento;
      updates.taxaCancelamento = (os.precoClienteTotal * taxaPercentual) / 100;
    }

    await db.ordens_servico.update(os.id, updates);
    setShowStatusModal(false);
  };

  const canChangeTo = (status: OrdemServico['status']) => {
    const currentStatus = os.status;
    
    if (currentStatus === 'Cancelado' || currentStatus === 'Concluido') return false;
    
    if (status === 'EmAndamento') return currentStatus === 'Reservado';
    if (status === 'Concluido') return currentStatus === 'EmAndamento';
    if (status === 'Cancelado') return true;
    
    return false;
  };

  const getVehicleName = (vehicleId: string) => {
    return settings?.vehiclesCatalog.find((v) => v.id === vehicleId)?.name || vehicleId;
  };
  
  // PDF Generation functions
  const handleGenerateConfirmation = () => {
    if (!os || !cliente || !settings) {
      showToast('error', 'Dados necessários não carregados');
      return;
    }
    
    try {
      generateOSConfirmationPDF({ os, cliente, fornecedor, settings });
      showToast('success', 'PDF de confirmação gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      showToast('error', 'Erro ao gerar PDF de confirmação');
    }
  };
  
  const handleGenerateReceipt = () => {
    if (!os || !cliente || !settings) {
      showToast('error', 'Dados necessários não carregados');
      return;
    }
    
    const paidPagamento = pagamentos?.find(p => p.status === 'Pago');
    if (!paidPagamento) {
      showToast('error', 'Não há pagamento confirmado para gerar recibo');
      return;
    }
    
    try {
      generateReceiptPDF({ os, cliente, pagamento: paidPagamento, settings });
      showToast('success', 'Recibo gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar recibo:', error);
      showToast('error', 'Erro ao gerar recibo');
    }
  };
  
  // Financial calculations
  const calcularFinanceiro = () => {
    const receitaTotal = pagamentos?.reduce((sum, p) => p.status === 'Pago' ? sum + p.valor : sum, 0) || 0;
    const despesasTotal = despesas?.reduce((sum, d) => sum + d.valor, 0) || 0;
    const repassesTotal = repasses?.reduce((sum, r) => r.status === 'Pago' ? sum + r.valor : sum, 0) || 0;
    const impostos = os?.pricingBreakdown?.imposto || os?.impostosAplicados || 0;
    const margem = receitaTotal - despesasTotal - repassesTotal - impostos;
    
    return { receitaTotal, despesasTotal, repassesTotal, impostos, margem };
  };
  
  // Form handlers
  const handleAddPagamento = async () => {
    if (!os?.id) return;
    
    try {
      await db.pagamentos_cliente.add({
        ordemServicoId: os.id,
        valor: pagamentoForm.valor,
        dataVencimento: new Date(pagamentoForm.dataVencimento),
        dataPagamento: pagamentoForm.status === 'Pago' ? new Date() : null,
        status: pagamentoForm.status,
        formaPagamento: pagamentoForm.formaPagamento,
        observacoes: pagamentoForm.observacoes,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      showToast('success', 'Pagamento adicionado com sucesso!');
      setShowPagamentoModal(false);
      // Reset form
      setPagamentoForm({
        valor: os.precoClienteTotal,
        dataVencimento: '',
        status: 'AReceber',
        formaPagamento: null,
        observacoes: '',
      });
    } catch (error) {
      console.error('Erro ao adicionar pagamento:', error);
      showToast('error', 'Erro ao adicionar pagamento');
    }
  };
  
  const handleAddRepasse = async () => {
    if (!os?.id || !os?.fornecedorId) return;
    
    try {
      await db.repasses_fornecedor.add({
        ordemServicoId: os.id,
        fornecedorId: os.fornecedorId,
        valor: repasseForm.valor,
        dataVencimento: new Date(repasseForm.dataVencimento),
        dataPagamento: repasseForm.status === 'Pago' ? new Date() : null,
        status: repasseForm.status,
        formaPagamento: repasseForm.formaPagamento,
        observacoes: repasseForm.observacoes,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      showToast('success', 'Repasse adicionado com sucesso!');
      setShowRepasseModal(false);
      // Reset form
      setRepasseForm({
        valor: os.precoFornecedor,
        dataVencimento: '',
        status: 'AFaturar',
        formaPagamento: null,
        observacoes: '',
      });
    } catch (error) {
      console.error('Erro ao adicionar repasse:', error);
      showToast('error', 'Erro ao adicionar repasse');
    }
  };
  
  const openPagamentoModal = () => {
    setPagamentoForm({
      valor: os?.precoClienteTotal || 0,
      dataVencimento: '',
      status: 'AReceber',
      formaPagamento: null,
      observacoes: '',
    });
    setShowPagamentoModal(true);
  };
  
  const openRepasseModal = () => {
    setRepasseForm({
      valor: os?.precoFornecedor || 0,
      dataVencimento: '',
      status: 'AFaturar',
      formaPagamento: null,
      observacoes: '',
    });
    setShowRepasseModal(true);
  };
  
  // Status badge component for financial items
  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string }> = {
      'AReceber': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      'Pago': { bg: 'bg-green-100', text: 'text-green-800' },
      'Vencido': { bg: 'bg-red-100', text: 'text-red-800' },
      'Cancelado': { bg: 'bg-gray-100', text: 'text-gray-800' },
      'AFaturar': { bg: 'bg-blue-100', text: 'text-blue-800' },
      'Faturado': { bg: 'bg-purple-100', text: 'text-purple-800' },
    };
    
    const { bg, text } = config[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
        {status}
      </span>
    );
  };
  
  const getCategoryBadge = (categoria: string) => {
    const config: Record<string, { bg: string; text: string }> = {
      'combustivel': { bg: 'bg-orange-100', text: 'text-orange-800' },
      'pedagio': { bg: 'bg-blue-100', text: 'text-blue-800' },
      'alimentacao': { bg: 'bg-green-100', text: 'text-green-800' },
      'impostos': { bg: 'bg-red-100', text: 'text-red-800' },
      'outros': { bg: 'bg-gray-100', text: 'text-gray-800' },
    };
    
    const { bg, text } = config[categoria] || { bg: 'bg-gray-100', text: 'text-gray-800' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
        {categoria}
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <Link to="/os">
          <Button variant="ghost" className="w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-black-900">
          Ordem de Serviço #{os.id}
        </h1>
        <div className="sm:ml-auto">
          <StatusBadge status={os.status} />
        </div>
      </div>

      {/* PDF Generation Buttons */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
        <Button onClick={handleGenerateConfirmation} size="sm">
          <FileDown className="h-4 w-4 mr-2" />
          Gerar Confirmação
        </Button>
        {pagamentos?.some(p => p.status === 'Pago') && (
          <Button onClick={handleGenerateReceipt} size="sm" variant="secondary">
            <Receipt className="h-4 w-4 mr-2" />
            Gerar Recibo
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        <Card title="Informações do Cliente">
          <div className="space-y-2 text-sm sm:text-base">
            <div>
              <span className="font-medium">Nome:</span> {cliente?.nome || 'Carregando...'}
            </div>
            <div>
              <span className="font-medium">Documento:</span>{' '}
              {cliente?.documento || '-'}
            </div>
            {cliente?.contatos.find((c) => c.principal) && (
              <div>
                <span className="font-medium">Contato:</span>{' '}
                {cliente.contatos.find((c) => c.principal)?.valor || '-'}
              </div>
            )}
          </div>
        </Card>

        <Card title="Detalhes do Serviço">
          <div className="space-y-2 text-sm sm:text-base">
            <div>
              <span className="font-medium">Tipo:</span>{' '}
              {os.tipoServico === 'transfer' ? 'Transfer' : `${os.pacoteHoras} horas`}
            </div>
            <div>
              <span className="font-medium">Veículo:</span> {getVehicleName(os.veiculoTipo)}
              {os.blindado && ' (Blindado)'}
            </div>
            <div>
              <span className="font-medium">Motorista:</span>{' '}
              {os.motoristaTipo === 'bilingue' ? 'Bilíngue' : 'Monolíngue'}
            </div>
            <div>
              <span className="font-medium">Terceirização:</span>{' '}
              {os.terceirizacao === 'nenhum'
                ? 'Nenhuma'
                : os.terceirizacao === 'motorista'
                ? 'Motorista'
                : 'Motorista + Carro'}
            </div>
          </div>
        </Card>

        <Card title="Agendamento">
          <div className="space-y-2 text-sm sm:text-base">
            <div>
              <span className="font-medium">Data/Hora Início:</span>{' '}
              {new Date(os.agendamento.dataHoraInicio).toLocaleString('pt-BR')}
            </div>
            {os.agendamento.dataHoraFim && (
              <div>
                <span className="font-medium">Data/Hora Fim:</span>{' '}
                {new Date(os.agendamento.dataHoraFim).toLocaleString('pt-BR')}
              </div>
            )}
            {os.agendamento.dataHoraIda && (
              <div>
                <span className="font-medium">Ida:</span>{' '}
                {new Date(os.agendamento.dataHoraIda).toLocaleString('pt-BR')}
              </div>
            )}
            {os.agendamento.dataHoraVolta && (
              <div>
                <span className="font-medium">Volta:</span>{' '}
                {new Date(os.agendamento.dataHoraVolta).toLocaleString('pt-BR')}
              </div>
            )}
          </div>
        </Card>

        <Card title="Roteiro">
          {os.roteiro.map((trecho, index) => (
            <div key={index} className="mb-2 pb-2 border-b last:border-0">
              <div className="font-medium">Trecho {index + 1}</div>
              <div className="text-sm text-gray-600">
                De: {trecho.origem}
                <br />
                Para: {trecho.destino}
                {trecho.distancia && <br />}
                {trecho.distancia && `Distância: ${trecho.distancia} km`}
              </div>
            </div>
          ))}
          {os.roteiro.length === 0 && (
            <p className="text-gray-500">Nenhum trecho cadastrado</p>
          )}
        </Card>

        <Card title="Valores">
          <div className="space-y-2">
            <div>
              <span className="font-medium">Valor Cliente:</span> R${' '}
              {os.precoClienteTotal.toFixed(2)}
            </div>
            <div>
              <span className="font-medium">Valor Fornecedor:</span> R${' '}
              {os.precoFornecedor.toFixed(2)}
            </div>
            <div>
              <span className="font-medium">Impostos:</span>{' '}
              {os.impostosAplicados.toFixed(2)}%
            </div>
            {os.taxaCancelamento && (
              <div className="text-red-600">
                <span className="font-medium">Taxa de Cancelamento:</span> R${' '}
                {os.taxaCancelamento.toFixed(2)}
              </div>
            )}
            
            {/* Pricing Breakdown */}
            {os.pricingBreakdown && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-sm text-gray-700 mb-2">Detalhamento de Preços</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valor Base:</span>
                    <span>{formatCurrency(os.pricingBreakdown.valorBase)}</span>
                  </div>
                  {os.pricingBreakdown.ajustes.length > 0 && (
                    <>
                      {os.pricingBreakdown.ajustes.map((ajuste, idx) => (
                        <div key={idx} className="flex justify-between text-gray-600">
                          <span className="ml-2">• {ajuste.descricao}:</span>
                          <span>
                            {ajuste.tipo === 'percentual' ? `${ajuste.valor}%` : formatCurrency(ajuste.valor)}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span>{formatCurrency(os.pricingBreakdown.subtotal)}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Imposto:</span>
                    <span>{formatCurrency(os.pricingBreakdown.imposto)}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-1 border-t border-gray-200">
                    <span>Total:</span>
                    <span>{formatCurrency(os.pricingBreakdown.total)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {fornecedor && (
          <Card title="Fornecedor">
            <div className="space-y-2">
              <div>
                <span className="font-medium">Nome:</span> {fornecedor.nome}
              </div>
              <div>
                <span className="font-medium">Tipo:</span>{' '}
                {fornecedor.tipo === 'empresa' ? 'Empresa' : 'Autônomo'}
              </div>
            </div>
          </Card>
        )}

        {os.notas && (
          <Card title="Notas" className="md:col-span-2">
            <p className="whitespace-pre-wrap">{os.notas}</p>
          </Card>
        )}

        {os.motivoCancelamento && (
          <Card title="Motivo do Cancelamento" className="md:col-span-2">
            <p className="whitespace-pre-wrap text-red-600">{os.motivoCancelamento}</p>
          </Card>
        )}
        
        {/* Financial Summary Card */}
        <Card title="Resumo Financeiro" className="md:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Lists */}
            <div className="space-y-4">
              {/* Pagamentos */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm text-gray-700">Pagamentos</h4>
                  <Button size="sm" onClick={openPagamentoModal}>
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
                {pagamentos && pagamentos.length > 0 ? (
                  <div className="space-y-2">
                    {pagamentos.map(p => (
                      <div key={p.id} className="flex justify-between items-center text-sm border-b pb-2">
                        <div>
                          <div className="font-medium">{formatCurrency(p.valor)}</div>
                          <div className="text-xs text-gray-500">
                            Venc: {new Date(p.dataVencimento).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                        {getStatusBadge(p.status)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Nenhum pagamento cadastrado</p>
                )}
              </div>
              
              {/* Repasses */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm text-gray-700">Repasses</h4>
                  {fornecedor && (
                    <Button size="sm" onClick={openRepasseModal}>
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                  )}
                </div>
                {repasses && repasses.length > 0 ? (
                  <div className="space-y-2">
                    {repasses.map(r => (
                      <div key={r.id} className="flex justify-between items-center text-sm border-b pb-2">
                        <div>
                          <div className="font-medium">{formatCurrency(r.valor)}</div>
                          <div className="text-xs text-gray-500">
                            Venc: {new Date(r.dataVencimento).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                        {getStatusBadge(r.status)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Nenhum repasse cadastrado</p>
                )}
              </div>
              
              {/* Despesas */}
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">Despesas</h4>
                {despesas && despesas.length > 0 ? (
                  <div className="space-y-2">
                    {despesas.map(d => (
                      <div key={d.id} className="flex justify-between items-center text-sm border-b pb-2">
                        <div>
                          <div className="font-medium">{d.descricao}</div>
                          <div className="text-xs text-gray-500">{formatCurrency(d.valor)}</div>
                        </div>
                        {getCategoryBadge(d.categoria)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Nenhuma despesa cadastrada</p>
                )}
              </div>
            </div>
            
            {/* Right Column: Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-sm text-gray-700 mb-3">Totalizadores</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Receita Total:</span>
                  <span className="font-medium text-green-700">
                    {formatCurrency(calcularFinanceiro().receitaTotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Despesas Total:</span>
                  <span className="font-medium text-red-700">
                    {formatCurrency(calcularFinanceiro().despesasTotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Repasses Total:</span>
                  <span className="font-medium text-orange-700">
                    {formatCurrency(calcularFinanceiro().repassesTotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Impostos:</span>
                  <span className="font-medium text-purple-700">
                    {formatCurrency(calcularFinanceiro().impostos)}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-300">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Margem:</span>
                    <span className={`font-bold text-lg ${
                      calcularFinanceiro().margem >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(calcularFinanceiro().margem)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6 flex gap-4">
        {canChangeTo('EmAndamento') && (
          <Button
            onClick={() => {
              setNewStatus('EmAndamento');
              setShowStatusModal(true);
            }}
          >
            Iniciar Serviço
          </Button>
        )}
        {canChangeTo('Concluido') && (
          <Button
            onClick={() => {
              setNewStatus('Concluido');
              setShowStatusModal(true);
            }}
          >
            Concluir Serviço
          </Button>
        )}
        {canChangeTo('Cancelado') && (
          <Button
            variant="danger"
            onClick={() => {
              setNewStatus('Cancelado');
              setShowStatusModal(true);
            }}
          >
            Cancelar Serviço
          </Button>
        )}
      </div>

      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title={`Alterar Status para ${newStatus}`}
      >
        <div className="space-y-4">
          {newStatus === 'Cancelado' && (
            <>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                <h4 className="font-medium text-yellow-800 mb-2">
                  Política de Cancelamento
                </h4>
                {settings?.cancelPolicy.map((policy, index) => (
                  <div key={index} className="text-sm text-yellow-700">
                    {policy.minHours}h{policy.maxHours ? ` - ${policy.maxHours}h` : '+'}:{' '}
                    {policy.percentage}% de taxa
                  </div>
                ))}
              </div>
              <TextArea
                label="Motivo do Cancelamento"
                value={motivoCancelamento}
                onChange={(e) => setMotivoCancelamento(e.target.value)}
                rows={4}
                required
              />
            </>
          )}
          <p>Tem certeza que deseja alterar o status para {newStatus}?</p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowStatusModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleStatusChange}>Confirmar</Button>
          </div>
        </div>
      </Modal>
      
      {/* Modal Adicionar Pagamento */}
      <Modal
        isOpen={showPagamentoModal}
        onClose={() => setShowPagamentoModal(false)}
        title="Adicionar Pagamento"
      >
        <div className="space-y-4">
          <Input
            label="Valor"
            type="number"
            step="0.01"
            value={pagamentoForm.valor}
            onChange={(e) => setPagamentoForm({ ...pagamentoForm, valor: parseFloat(e.target.value) })}
            required
          />
          <Input
            label="Data de Vencimento"
            type="date"
            value={pagamentoForm.dataVencimento}
            onChange={(e) => setPagamentoForm({ ...pagamentoForm, dataVencimento: e.target.value })}
            required
          />
          <Select
            label="Status"
            value={pagamentoForm.status}
            onChange={(e) => setPagamentoForm({ ...pagamentoForm, status: e.target.value as PagamentoCliente['status'] })}
          >
            <option value="AReceber">A Receber</option>
            <option value="Pago">Pago</option>
            <option value="Vencido">Vencido</option>
            <option value="Cancelado">Cancelado</option>
          </Select>
          <Select
            label="Forma de Pagamento"
            value={pagamentoForm.formaPagamento || ''}
            onChange={(e) => setPagamentoForm({ 
              ...pagamentoForm, 
              formaPagamento: e.target.value ? e.target.value as PagamentoCliente['formaPagamento'] : null 
            })}
          >
            <option value="">Selecione...</option>
            <option value="PIX">PIX</option>
            <option value="Cartao">Cartão</option>
            <option value="Boleto">Boleto</option>
            <option value="Transferencia">Transferência</option>
          </Select>
          <TextArea
            label="Observações"
            value={pagamentoForm.observacoes}
            onChange={(e) => setPagamentoForm({ ...pagamentoForm, observacoes: e.target.value })}
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowPagamentoModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddPagamento}>Adicionar</Button>
          </div>
        </div>
      </Modal>
      
      {/* Modal Adicionar Repasse */}
      <Modal
        isOpen={showRepasseModal}
        onClose={() => setShowRepasseModal(false)}
        title="Adicionar Repasse"
      >
        <div className="space-y-4">
          <Input
            label="Valor"
            type="number"
            step="0.01"
            value={repasseForm.valor}
            onChange={(e) => setRepasseForm({ ...repasseForm, valor: parseFloat(e.target.value) })}
            required
          />
          <Input
            label="Data de Vencimento"
            type="date"
            value={repasseForm.dataVencimento}
            onChange={(e) => setRepasseForm({ ...repasseForm, dataVencimento: e.target.value })}
            required
          />
          <Select
            label="Status"
            value={repasseForm.status}
            onChange={(e) => setRepasseForm({ ...repasseForm, status: e.target.value as RepasseFornecedor['status'] })}
          >
            <option value="AFaturar">A Faturar</option>
            <option value="Faturado">Faturado</option>
            <option value="Pago">Pago</option>
          </Select>
          <Select
            label="Forma de Pagamento"
            value={repasseForm.formaPagamento || ''}
            onChange={(e) => setRepasseForm({ 
              ...repasseForm, 
              formaPagamento: e.target.value ? e.target.value as RepasseFornecedor['formaPagamento'] : null 
            })}
          >
            <option value="">Selecione...</option>
            <option value="PIX">PIX</option>
            <option value="Cartao">Cartão</option>
            <option value="Boleto">Boleto</option>
            <option value="Transferencia">Transferência</option>
          </Select>
          <TextArea
            label="Observações"
            value={repasseForm.observacoes}
            onChange={(e) => setRepasseForm({ ...repasseForm, observacoes: e.target.value })}
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowRepasseModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddRepasse}>Adicionar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
