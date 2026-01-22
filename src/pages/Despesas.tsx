import React, { useState, useMemo, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Filter,
  Download,
  Upload,
  FileText,
  Image,
  Eye,
  X,
} from 'lucide-react';
import { db } from '../db';
import type { Despesa, Anexo } from '../db/models';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Select, TextArea } from '../components/forms/Input';
import { CurrencyInput } from '../components/forms/CurrencyInput';
import { useToast } from '../components/ui/Toast';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/date';

type CategoriaType = 'combustivel' | 'pedagio' | 'alimentacao' | 'outros' | 'impostos';

const categoryColors: Record<CategoriaType, { bg: string; text: string; label: string }> = {
  combustivel: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Combustível' },
  pedagio: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pedágio' },
  alimentacao: { bg: 'bg-green-100', text: 'text-green-800', label: 'Alimentação' },
  outros: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Outros' },
  impostos: { bg: 'bg-red-100', text: 'text-red-800', label: 'Impostos' },
};

export function Despesas() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState<string>('all');
  const [osFilter, setOsFilter] = useState<string>('all');
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDespesa, setEditingDespesa] = useState<Despesa | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [viewAnexo, setViewAnexo] = useState<Anexo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; type: string; data: string } | null>(null);

  const { showToast } = useToast();

  // Live queries
  const despesas = useLiveQuery(() => db.despesas.toArray(), []);
  const ordensServico = useLiveQuery(() => db.ordens_servico.toArray(), []);
  const clientes = useLiveQuery(() => db.clientes.toArray(), []);
  const anexos = useLiveQuery(() => db.anexos.toArray(), []);

  // Helper function to get OS info
  const getOSInfo = (osId: number | null) => {
    if (!osId || !ordensServico || !clientes) return null;
    const os = ordensServico.find(o => o.id === osId);
    if (!os) return null;
    const cliente = clientes.find(c => c.id === os.clienteId);
    return { os, cliente };
  };

  // Filter despesas
  const filteredDespesas = useMemo(() => {
    if (!despesas) return [];

    return despesas.filter(d => {
      // Categoria filter
      if (categoriaFilter !== 'all' && d.categoria !== categoriaFilter) return false;

      // OS filter
      if (osFilter === 'linked' && !d.ordemServicoId) return false;
      if (osFilter === 'unlinked' && d.ordemServicoId) return false;
      if (osFilter !== 'all' && osFilter !== 'linked' && osFilter !== 'unlinked') {
        if (d.ordemServicoId?.toString() !== osFilter) return false;
      }

      // Date range filter
      if (dateRangeStart && new Date(d.data) < new Date(dateRangeStart)) return false;
      if (dateRangeEnd && new Date(d.data) > new Date(dateRangeEnd)) return false;

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const descMatch = d.descricao.toLowerCase().includes(searchLower);
        const notasMatch = d.notas?.toLowerCase().includes(searchLower);
        return descMatch || notasMatch;
      }

      return true;
    });
  }, [despesas, categoriaFilter, osFilter, dateRangeStart, dateRangeEnd, searchTerm]);

  // Calculate totals
  const totalDespesas = useMemo(() => {
    return filteredDespesas.reduce((sum, d) => sum + d.valor, 0);
  }, [filteredDespesas]);

  // Per-OS summary
  const osSummary = useMemo(() => {
    if (osFilter === 'all' || osFilter === 'linked' || osFilter === 'unlinked' || !osFilter) return null;
    
    const osId = parseInt(osFilter);
    const osDespesas = filteredDespesas.filter(d => d.ordemServicoId === osId);
    const total = osDespesas.reduce((sum, d) => sum + d.valor, 0);
    const osInfo = getOSInfo(osId);
    
    return {
      osId,
      total,
      count: osDespesas.length,
      osInfo,
    };
  }, [osFilter, filteredDespesas, ordensServico, clientes]);

  // File upload handlers
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      showToast('error', 'Formato inválido. Use JPG, PNG ou PDF.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'Arquivo muito grande. Máximo 5MB.');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedFile({
        name: file.name,
        type: file.type,
        data: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // CRUD handlers
  const handleAddDespesa = () => {
    setEditingDespesa({
      ordemServicoId: null,
      descricao: '',
      categoria: 'outros',
      valor: 0,
      data: new Date(),
      notas: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setUploadedFile(null);
    setIsModalOpen(true);
  };

  const handleEditDespesa = (despesa: Despesa) => {
    setEditingDespesa(despesa);
    setUploadedFile(null);
    setIsModalOpen(true);
  };

  const handleDeleteDespesa = async (id: number) => {
    try {
      // Delete associated anexo if exists
      const anexo = anexos?.find(a => a.despesaId === id);
      if (anexo) {
        await db.anexos.delete(anexo.id!);
      }
      
      await db.despesas.delete(id);
      setDeleteConfirm(null);
      showToast('success', 'Despesa excluída com sucesso!');
    } catch (error) {
      showToast('error', 'Erro ao excluir despesa');
    }
  };

  const handleSubmitDespesa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDespesa) return;

    if (!editingDespesa.descricao.trim()) {
      showToast('error', 'Descrição é obrigatória');
      return;
    }

    if (editingDespesa.valor <= 0) {
      showToast('error', 'Valor deve ser maior que zero');
      return;
    }

    try {
      const despesa = {
        ...editingDespesa,
        updatedAt: new Date(),
      };

      let despesaId: number;
      if (editingDespesa.id) {
        await db.despesas.update(editingDespesa.id, despesa);
        despesaId = editingDespesa.id;
        showToast('success', 'Despesa atualizada com sucesso!');
      } else {
        despesaId = (await db.despesas.add(despesa)) as number;
        showToast('success', 'Despesa cadastrada com sucesso!');
      }

      // Handle file upload
      if (uploadedFile) {
        // Check if anexo already exists for this despesa
        const existingAnexo = anexos?.find(a => a.despesaId === despesaId);
        
        const anexoData: Anexo = {
          ordemServicoId: null,
          despesaId: despesaId,
          nome: uploadedFile.name,
          tipo: uploadedFile.type,
          tamanho: uploadedFile.data.length,
          url: uploadedFile.data,
          createdAt: new Date(),
        };

        if (existingAnexo) {
          await db.anexos.update(existingAnexo.id!, anexoData);
        } else {
          await db.anexos.add(anexoData);
        }
      }

      setIsModalOpen(false);
      setEditingDespesa(null);
      setUploadedFile(null);
    } catch (error) {
      console.error(error);
      showToast('error', 'Erro ao salvar despesa');
    }
  };

  const handleViewAnexo = (despesaId: number) => {
    const anexo = anexos?.find(a => a.despesaId === despesaId);
    if (anexo) {
      setViewAnexo(anexo);
    }
  };

  const handleDownloadAnexo = (anexo: Anexo) => {
    const link = document.createElement('a');
    link.href = anexo.url;
    link.download = anexo.nome;
    link.click();
  };

  const getAnexoIcon = (tipo: string) => {
    if (tipo.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (tipo === 'application/pdf') return <FileText className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-black-900">Despesas</h1>
        <Button onClick={handleAddDespesa}>
          <Plus className="h-5 w-5 mr-2" />
          Nova Despesa
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Despesas</p>
              <p className="text-2xl font-bold text-black-900">{formatCurrency(totalDespesas)}</p>
            </div>
            <div className="bg-gold-100 p-3 rounded-full">
              <FileText className="h-6 w-6 text-gold-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Quantidade</p>
              <p className="text-2xl font-bold text-black-900">{filteredDespesas.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Filter className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Média por Despesa</p>
              <p className="text-2xl font-bold text-black-900">
                {filteredDespesas.length > 0
                  ? formatCurrency(totalDespesas / filteredDespesas.length)
                  : 'R$ 0,00'}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Per-OS Summary */}
      {osSummary && (
        <Card className="mb-6 bg-gold-50 border-gold-200">
          <h3 className="font-semibold text-gold-900 mb-2">Resumo OS #{osSummary.osId}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Cliente</p>
              <p className="font-medium">{osSummary.osInfo?.cliente?.nome || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Despesas</p>
              <p className="font-bold text-gold-600">{formatCurrency(osSummary.total)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Quantidade de Despesas</p>
              <p className="font-medium">{osSummary.count}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gold-500 focus:border-gold-500"
            />
          </div>

          <Select
            value={categoriaFilter}
            onChange={(e) => setCategoriaFilter(e.target.value)}
          >
            <option value="all">Todas Categorias</option>
            {Object.entries(categoryColors).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </Select>

          <Select
            value={osFilter}
            onChange={(e) => setOsFilter(e.target.value)}
          >
            <option value="all">Todas OS</option>
            <option value="linked">Vinculadas a OS</option>
            <option value="unlinked">Não Vinculadas</option>
            {ordensServico?.map(os => (
              <option key={os.id} value={os.id}>
                OS #{os.id}
              </option>
            ))}
          </Select>

          <Input
            type="date"
            value={dateRangeStart}
            onChange={(e) => setDateRangeStart(e.target.value)}
            placeholder="Data início"
          />

          <Input
            type="date"
            value={dateRangeEnd}
            onChange={(e) => setDateRangeEnd(e.target.value)}
            placeholder="Data fim"
          />
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  OS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Anexo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDespesas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Nenhuma despesa encontrada
                  </td>
                </tr>
              ) : (
                filteredDespesas.map((despesa) => {
                  const categoria = categoryColors[despesa.categoria];
                  const osInfo = despesa.ordemServicoId ? getOSInfo(despesa.ordemServicoId) : null;
                  const anexo = anexos?.find(a => a.despesaId === despesa.id);

                  return (
                    <tr key={despesa.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{despesa.descricao}</div>
                        {despesa.notas && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">{despesa.notas}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${categoria.bg} ${categoria.text}`}>
                          {categoria.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(despesa.valor)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(despesa.data)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {despesa.ordemServicoId ? (
                          <div className="text-sm">
                            <div className="text-gold-600 font-medium">
                              OS #{despesa.ordemServicoId}
                            </div>
                            {osInfo && (
                              <div className="text-gray-500 text-xs">
                                {osInfo.cliente?.nome}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {anexo ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewAnexo(despesa.id!)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Visualizar anexo"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadAnexo(anexo)}
                              className="text-green-600 hover:text-green-800"
                              title="Baixar anexo"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditDespesa(despesa)}
                          className="text-gold-600 hover:text-gold-900 mr-3"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(despesa.id!)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDespesa(null);
          setUploadedFile(null);
        }}
        title={editingDespesa?.id ? 'Editar Despesa' : 'Nova Despesa'}
        size="lg"
      >
        <form onSubmit={handleSubmitDespesa}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Descrição *"
                value={editingDespesa?.descricao || ''}
                onChange={(e) =>
                  setEditingDespesa(prev => prev ? { ...prev, descricao: e.target.value } : null)
                }
                placeholder="Ex: Abastecimento do veículo"
                required
              />
            </div>

            <Select
              label="Categoria *"
              value={editingDespesa?.categoria || 'outros'}
              onChange={(e) =>
                setEditingDespesa(prev => prev ? { ...prev, categoria: e.target.value as CategoriaType } : null)
              }
            >
              {Object.entries(categoryColors).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </Select>

            <CurrencyInput
              label="Valor *"
              value={editingDespesa?.valor || 0}
              onChange={(value) =>
                setEditingDespesa(prev => prev ? { ...prev, valor: value } : null)
              }
            />

            <Input
              label="Data *"
              type="date"
              value={editingDespesa?.data ? new Date(editingDespesa.data).toISOString().split('T')[0] : ''}
              onChange={(e) =>
                setEditingDespesa(prev => prev ? { ...prev, data: new Date(e.target.value) } : null)
              }
              required
            />

            <Select
              label="Ordem de Serviço (Opcional)"
              value={editingDespesa?.ordemServicoId || ''}
              onChange={(e) =>
                setEditingDespesa(prev => prev ? { ...prev, ordemServicoId: e.target.value ? parseInt(e.target.value) : null } : null)
              }
            >
              <option value="">Sem vínculo</option>
              {ordensServico?.map(os => {
                const cliente = clientes?.find(c => c.id === os.clienteId);
                return (
                  <option key={os.id} value={os.id}>
                    OS #{os.id} - {cliente?.nome || 'N/A'}
                  </option>
                );
              })}
            </Select>

            <div className="md:col-span-2">
              <TextArea
                label="Notas (Opcional)"
                value={editingDespesa?.notas || ''}
                onChange={(e) =>
                  setEditingDespesa(prev => prev ? { ...prev, notas: e.target.value } : null)
                }
                placeholder="Observações adicionais..."
                rows={3}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Anexar Comprovante (Opcional)
              </label>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Escolher Arquivo
                </Button>
                {uploadedFile && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {getAnexoIcon(uploadedFile.type)}
                    <span>{uploadedFile.name}</span>
                    <button
                      type="button"
                      onClick={removeUploadedFile}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Formatos aceitos: JPG, PNG, PDF (máx 5MB)
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsModalOpen(false);
                setEditingDespesa(null);
                setUploadedFile(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {editingDespesa?.id ? 'Atualizar' : 'Cadastrar'}
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
        <p className="text-gray-700 mb-6">
          Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={() => deleteConfirm && handleDeleteDespesa(deleteConfirm)}>
            Excluir
          </Button>
        </div>
      </Modal>

      {/* View Anexo Modal */}
      <Modal
        isOpen={viewAnexo !== null}
        onClose={() => setViewAnexo(null)}
        title="Visualizar Anexo"
        size="xl"
      >
        {viewAnexo && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {getAnexoIcon(viewAnexo.tipo)}
                <span>{viewAnexo.nome}</span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDownloadAnexo(viewAnexo)}
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar
              </Button>
            </div>
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              {viewAnexo.tipo.startsWith('image/') ? (
                <img
                  src={viewAnexo.url}
                  alt={viewAnexo.nome}
                  className="max-w-full h-auto mx-auto"
                />
              ) : viewAnexo.tipo === 'application/pdf' ? (
                <iframe
                  src={viewAnexo.url}
                  title={viewAnexo.nome}
                  className="w-full h-96"
                />
              ) : (
                <p className="text-gray-500 text-center">
                  Pré-visualização não disponível para este tipo de arquivo.
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
