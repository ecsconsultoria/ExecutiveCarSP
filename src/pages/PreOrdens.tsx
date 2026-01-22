import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Search, CheckCircle, XCircle, Eye, Trash2, FileText, Upload, Settings, Plus, Edit, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../db';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select, Input } from '../components/forms/Input';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import type { PreOrdem, ImportPreset, ImportMapping, ImportValidation } from '../db/models';
import {
  getImportPresets,
  saveImportPreset,
  updateImportPreset,
  deleteImportPreset,
  createDefaultPreset,
  parseCSVWithPreset,
  parseJSONWithPreset,
  downloadTemplateCSVWithMapping,
} from '../utils/importerAdvanced';

export function PreOrdens() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [importSourceFilter, setImportSourceFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [detailsModal, setDetailsModal] = useState<{ isOpen: boolean; preOrdem: PreOrdem | null }>({
    isOpen: false,
    preOrdem: null,
  });
  const [editedPreOrdem, setEditedPreOrdem] = useState<PreOrdem | null>(null);
  
  // Import modal states
  const [importModal, setImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [importWarnings, setImportWarnings] = useState<string[]>([]);
  
  // Preset management modal states
  const [presetsModal, setPresetsModal] = useState(false);
  const [presetFormModal, setPresetFormModal] = useState(false);
  const [editingPreset, setEditingPreset] = useState<ImportPreset | null>(null);
  const [presetForm, setPresetForm] = useState<{
    nome: string;
    descricao: string;
    mapeamento: ImportMapping;
    validacoes: ImportValidation[];
  }>({
    nome: '',
    descricao: '',
    mapeamento: {
      clienteNome: 'clienteNome',
      clienteTelefone: 'clienteTelefone',
      clienteEmail: 'clienteEmail',
      tipoServico: 'tipoServico',
      pacoteHoras: 'pacoteHoras',
      veiculoTipo: 'veiculoTipo',
      blindado: 'blindado',
      motoristaTipo: 'motoristaTipo',
      origem: 'origem',
      destino: 'destino',
      dataHoraInicio: 'dataHoraInicio',
      dataHoraFim: 'dataHoraFim',
      observacoes: 'observacoes',
    },
    validacoes: [],
  });

  const { showToast } = useToast();

  const preOrdens = useLiveQuery(() => db.pre_ordens.toArray(), []);
  const settings = useLiveQuery(() => db.settings.get(1));
  const [presets, setPresets] = useState<ImportPreset[]>([]);

  // Load presets and create default if none exist
  useEffect(() => {
    loadPresets();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPresets = async () => {
    const loadedPresets = await getImportPresets();
    if (loadedPresets.length === 0) {
      // Create default preset
      const defaultId = await createDefaultPreset();
      const newPresets = await getImportPresets();
      setPresets(newPresets);
      setSelectedPreset(defaultId);
      showToast('info', 'Preset padrão criado automaticamente');
    } else {
      setPresets(loadedPresets);
      if (!selectedPreset) {
        setSelectedPreset(loadedPresets[0].id!);
      }
    }
  };

  const filteredPreOrdens = preOrdens
    ?.filter((po) => statusFilter === 'all' || po.status === statusFilter)
    ?.filter((po) => importSourceFilter === 'all' || po.importSource === importSourceFilter)
    ?.filter((po) =>
      po.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.origem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.destino.toLowerCase().includes(searchTerm.toLowerCase())
    )
    ?.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const getVehicleName = (vehicleId: string) => {
    return settings?.vehiclesCatalog.find((v) => v.id === vehicleId)?.name || vehicleId;
  };

  const handleConvertToOS = async (preOrdem: PreOrdem) => {
    try {
      // Check if cliente exists by name
      let cliente = await db.clientes
        .filter((c) => c.nome.toLowerCase() === preOrdem.clienteNome.toLowerCase())
        .first();

      // Create cliente if not exists
      if (!cliente) {
        const newClienteId = await db.clientes.add({
          nome: preOrdem.clienteNome,
          documento: '',
          contatos: preOrdem.clienteContatos || [],
          endereco: {
            rua: '',
            numero: '',
            complemento: '',
            bairro: '',
            cidade: '',
            estado: '',
            cep: '',
          },
          observacoes: `Cliente criado automaticamente da pré-ordem #${preOrdem.id}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        cliente = await db.clientes.get(newClienteId);
      }

      if (!cliente) {
        throw new Error('Erro ao criar/buscar cliente');
      }

      // Create OS from PreOrdem
      const osId = await db.ordens_servico.add({
        clienteId: cliente.id!,
        tipoServico: preOrdem.tipoServico,
        pacoteHoras: preOrdem.pacoteHoras,
        veiculoTipo: preOrdem.veiculoTipo,
        blindado: preOrdem.blindado,
        motoristaTipo: preOrdem.motoristaTipo,
        terceirizacao: 'nenhum',
        fornecedorId: null,
        roteiro: [
          {
            origem: preOrdem.origem,
            destino: preOrdem.destino,
            distancia: null,
            duracao: null,
          },
        ],
        agendamento: {
          tipo: preOrdem.tipoServico,
          dataHoraInicio: preOrdem.dataHoraInicio,
          dataHoraFim: preOrdem.dataHoraFim || null,
          dataHoraIda: preOrdem.dataHoraInicio,
          dataHoraVolta: null,
        },
        status: 'Reservado',
        motivoCancelamento: null,
        taxaCancelamento: null,
        precoClienteTotal: 0,
        precoFornecedor: 0,
        impostosAplicados: 0,
        notas: preOrdem.observacoes,
        anexos: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Update PreOrdem with converted OS ID and status
      await db.pre_ordens.update(preOrdem.id!, {
        status: 'convertido',
        convertedOSId: osId as number,
      });

      showToast('success', `Pré-ordem convertida em OS #${osId} com sucesso!`);
    } catch (error) {
      console.error('Error converting PreOrdem to OS:', error);
      showToast('error', 'Erro ao converter pré-ordem em OS');
    }
  };

  const handleReject = async (preOrdemId: number) => {
    try {
      await db.pre_ordens.update(preOrdemId, { status: 'rejeitado' });
      showToast('success', 'Pré-ordem rejeitada');
    } catch (error) {
      console.error('Error rejecting PreOrdem:', error);
      showToast('error', 'Erro ao rejeitar pré-ordem');
    }
  };

  const handleDelete = async (preOrdemId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta pré-ordem?')) {
      return;
    }
    try {
      await db.pre_ordens.delete(preOrdemId);
      showToast('success', 'Pré-ordem excluída');
    } catch (error) {
      console.error('Error deleting PreOrdem:', error);
      showToast('error', 'Erro ao excluir pré-ordem');
    }
  };

  const openDetailsModal = (preOrdem: PreOrdem) => {
    setDetailsModal({ isOpen: true, preOrdem });
    setEditedPreOrdem({ ...preOrdem });
  };

  const closeDetailsModal = () => {
    setDetailsModal({ isOpen: false, preOrdem: null });
    setEditedPreOrdem(null);
  };

  const handleSaveEdits = async () => {
    if (!editedPreOrdem || !editedPreOrdem.id) return;

    try {
      await db.pre_ordens.update(editedPreOrdem.id, editedPreOrdem);
      showToast('success', 'Pré-ordem atualizada');
      closeDetailsModal();
    } catch (error) {
      console.error('Error updating PreOrdem:', error);
      showToast('error', 'Erro ao atualizar pré-ordem');
    }
  };

  // Import handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportWarnings([]);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      showToast('error', 'Selecione um arquivo para importar');
      return;
    }

    const preset = presets.find(p => p.id === selectedPreset);
    const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();

    try {
      let result;
      if (fileExt === 'csv') {
        result = await parseCSVWithPreset(selectedFile, preset);
      } else if (fileExt === 'json') {
        result = await parseJSONWithPreset(selectedFile, preset);
      } else {
        showToast('error', 'Formato de arquivo não suportado. Use CSV ou JSON.');
        return;
      }

      if (!result.success) {
        showToast('error', `Erro ao importar: ${result.errors?.join(', ')}`);
        if (result.warnings && result.warnings.length > 0) {
          setImportWarnings(result.warnings);
        }
        return;
      }

      // Save to database
      if (result.data) {
        for (const preOrdem of result.data) {
          await db.pre_ordens.add(preOrdem);
        }
        showToast('success', `${result.data.length} pré-ordem(ns) importada(s) com sucesso`);
        
        // Show warnings if any
        if (result.warnings && result.warnings.length > 0) {
          setImportWarnings(result.warnings);
        } else {
          setImportModal(false);
          setSelectedFile(null);
        }
      }
    } catch (error) {
      console.error('Error importing:', error);
      showToast('error', 'Erro ao importar arquivo');
    }
  };

  // Preset management handlers
  const handleOpenPresetForm = (preset?: ImportPreset) => {
    if (preset) {
      setEditingPreset(preset);
      setPresetForm({
        nome: preset.nome,
        descricao: preset.descricao || '',
        mapeamento: preset.mapeamento,
        validacoes: preset.validacoes,
      });
    } else {
      setEditingPreset(null);
      setPresetForm({
        nome: '',
        descricao: '',
        mapeamento: {
          clienteNome: 'clienteNome',
          clienteTelefone: 'clienteTelefone',
          clienteEmail: 'clienteEmail',
          tipoServico: 'tipoServico',
          pacoteHoras: 'pacoteHoras',
          veiculoTipo: 'veiculoTipo',
          blindado: 'blindado',
          motoristaTipo: 'motoristaTipo',
          origem: 'origem',
          destino: 'destino',
          dataHoraInicio: 'dataHoraInicio',
          dataHoraFim: 'dataHoraFim',
          observacoes: 'observacoes',
        },
        validacoes: [],
      });
    }
    setPresetFormModal(true);
  };

  const handleSavePreset = async () => {
    if (!presetForm.nome.trim()) {
      showToast('error', 'Nome do preset é obrigatório');
      return;
    }

    try {
      if (editingPreset) {
        await updateImportPreset(editingPreset.id!, presetForm);
        showToast('success', 'Preset atualizado com sucesso');
      } else {
        await saveImportPreset(presetForm);
        showToast('success', 'Preset criado com sucesso');
      }
      await loadPresets();
      setPresetFormModal(false);
    } catch (error) {
      console.error('Error saving preset:', error);
      showToast('error', 'Erro ao salvar preset');
    }
  };

  const handleDeletePreset = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este preset?')) {
      return;
    }

    try {
      await deleteImportPreset(id);
      showToast('success', 'Preset excluído com sucesso');
      await loadPresets();
      
      // Reset selected preset if it was deleted
      if (selectedPreset === id) {
        const remainingPresets = await getImportPresets();
        setSelectedPreset(remainingPresets.length > 0 ? remainingPresets[0].id! : null);
      }
    } catch (error) {
      console.error('Error deleting preset:', error);
      showToast('error', 'Erro ao excluir preset');
    }
  };

  const handleAddValidation = () => {
    setPresetForm({
      ...presetForm,
      validacoes: [
        ...presetForm.validacoes,
        { campo: '', obrigatorio: false, tipo: 'texto' },
      ],
    });
  };

  const handleUpdateValidation = (index: number, field: keyof ImportValidation, value: string | boolean) => {
    const newValidations = [...presetForm.validacoes];
    newValidations[index] = { ...newValidations[index], [field]: value };
    setPresetForm({ ...presetForm, validacoes: newValidations });
  };

  const handleRemoveValidation = (index: number) => {
    setPresetForm({
      ...presetForm,
      validacoes: presetForm.validacoes.filter((_, i) => i !== index),
    });
  };

  const getStatusBadge = (status: PreOrdem['status']) => {
    const config = {
      pendente: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendente' },
      convertido: { bg: 'bg-green-100', text: 'text-green-800', label: 'Convertido' },
      rejeitado: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejeitado' },
    };

    const c = config[status];
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}
      >
        {c.label}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-black-900">Pré-Ordens</h1>
          <p className="text-gray-600 mt-2">Gerenciar ordens importadas e convertê-las em OS</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setPresetsModal(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Gerenciar Presets
          </Button>
          <Button onClick={() => setImportModal(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Importar Arquivo
          </Button>
        </div>
      </div>

      <Card>
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar por cliente, origem ou destino..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-gold-500 focus:border-gold-500"
            />
          </div>
          <Select
            label=""
            options={[
              { value: 'all', label: 'Todos os Status' },
              { value: 'pendente', label: 'Pendente' },
              { value: 'convertido', label: 'Convertido' },
              { value: 'rejeitado', label: 'Rejeitado' },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
          <Select
            label=""
            options={[
              { value: 'all', label: 'Todas as Fontes' },
              { value: 'csv', label: 'CSV' },
              { value: 'json', label: 'JSON' },
              { value: 'sheets', label: 'Google Sheets' },
            ]}
            value={importSourceFilter}
            onChange={(e) => setImportSourceFilter(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo Serviço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Veículo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rota
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPreOrdens?.map((po) => (
                <tr key={po.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {po.clienteNome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {po.tipoServico === 'transfer' ? 'Transfer' : `${po.pacoteHoras}h`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getVehicleName(po.veiculoTipo)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="max-w-xs truncate">
                      {po.origem} → {po.destino}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(po.dataHoraInicio).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {getStatusBadge(po.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openDetailsModal(po)}
                        title="Ver Detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {po.status === 'pendente' && (
                        <>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleConvertToOS(po)}
                            title="Converter em OS"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleReject(po.id!)}
                            title="Rejeitar"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {po.status === 'convertido' && po.convertedOSId && (
                        <Link to={`/os/${po.convertedOSId}`}>
                          <Button size="sm" variant="secondary" title="Ver OS">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(po.id!)}
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPreOrdens?.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    Nenhuma pré-ordem encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Details Modal */}
      <Modal
        isOpen={detailsModal.isOpen}
        onClose={closeDetailsModal}
        title="Detalhes da Pré-Ordem"
        size="lg"
      >
        {editedPreOrdem && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome do Cliente"
                value={editedPreOrdem.clienteNome}
                onChange={(e) =>
                  setEditedPreOrdem({ ...editedPreOrdem, clienteNome: e.target.value })
                }
              />
              <Select
                label="Tipo de Serviço"
                value={editedPreOrdem.tipoServico}
                onChange={(e) =>
                  setEditedPreOrdem({
                    ...editedPreOrdem,
                    tipoServico: e.target.value as 'transfer' | 'hora',
                  })
                }
                options={[
                  { value: 'transfer', label: 'Transfer' },
                  { value: 'hora', label: 'Por Hora' },
                ]}
              />
            </div>

            {editedPreOrdem.tipoServico === 'hora' && (
              <Input
                label="Pacote de Horas"
                type="number"
                value={editedPreOrdem.pacoteHoras || ''}
                onChange={(e) =>
                  setEditedPreOrdem({
                    ...editedPreOrdem,
                    pacoteHoras: parseInt(e.target.value) || null,
                  })
                }
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Tipo de Veículo"
                value={editedPreOrdem.veiculoTipo}
                onChange={(e) =>
                  setEditedPreOrdem({ ...editedPreOrdem, veiculoTipo: e.target.value })
                }
              >
                {settings?.vehiclesCatalog.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </Select>

              <Select
                label="Tipo de Motorista"
                value={editedPreOrdem.motoristaTipo}
                onChange={(e) =>
                  setEditedPreOrdem({
                    ...editedPreOrdem,
                    motoristaTipo: e.target.value as 'bilingue' | 'mono',
                  })
                }
                options={[
                  { value: 'mono', label: 'Monolíngue' },
                  { value: 'bilingue', label: 'Bilíngue' },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={editedPreOrdem.blindado}
                  onChange={(e) =>
                    setEditedPreOrdem({ ...editedPreOrdem, blindado: e.target.checked })
                  }
                  className="rounded border-gray-300 text-gold-500 focus:ring-gold-500"
                />
                <span className="text-sm font-medium text-gray-700">Veículo Blindado</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Origem"
                value={editedPreOrdem.origem}
                onChange={(e) =>
                  setEditedPreOrdem({ ...editedPreOrdem, origem: e.target.value })
                }
              />
              <Input
                label="Destino"
                value={editedPreOrdem.destino}
                onChange={(e) =>
                  setEditedPreOrdem({ ...editedPreOrdem, destino: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Data/Hora Início"
                type="datetime-local"
                value={
                  editedPreOrdem.dataHoraInicio
                    ? new Date(editedPreOrdem.dataHoraInicio).toISOString().slice(0, 16)
                    : ''
                }
                onChange={(e) =>
                  setEditedPreOrdem({
                    ...editedPreOrdem,
                    dataHoraInicio: new Date(e.target.value),
                  })
                }
              />
              {editedPreOrdem.tipoServico === 'hora' && (
                <Input
                  label="Data/Hora Fim"
                  type="datetime-local"
                  value={
                    editedPreOrdem.dataHoraFim
                      ? new Date(editedPreOrdem.dataHoraFim).toISOString().slice(0, 16)
                      : ''
                  }
                  onChange={(e) =>
                    setEditedPreOrdem({
                      ...editedPreOrdem,
                      dataHoraFim: e.target.value ? new Date(e.target.value) : null,
                    })
                  }
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                value={editedPreOrdem.observacoes}
                onChange={(e) =>
                  setEditedPreOrdem({ ...editedPreOrdem, observacoes: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gold-500 focus:border-gold-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fonte de Importação
                </label>
                <p className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
                  {editedPreOrdem.importSource.toUpperCase()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Criação
                </label>
                <p className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
                  {new Date(editedPreOrdem.createdAt).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>

            {editedPreOrdem.clienteContatos && editedPreOrdem.clienteContatos.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contatos do Cliente
                </label>
                <div className="space-y-2">
                  {editedPreOrdem.clienteContatos.map((contato, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded"
                    >
                      <span className="font-medium capitalize">{contato.tipo}:</span>
                      <span>{contato.valor}</span>
                      {contato.principal && (
                        <span className="text-xs bg-gold-100 text-gold-800 px-2 py-0.5 rounded">
                          Principal
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="ghost" onClick={closeDetailsModal}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEdits}>Salvar Alterações</Button>
              {editedPreOrdem.status === 'pendente' && (
                <>
                  <Button
                    variant="primary"
                    onClick={() => {
                      handleConvertToOS(editedPreOrdem);
                      closeDetailsModal();
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Converter em OS
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={importModal}
        onClose={() => {
          setImportModal(false);
          setSelectedFile(null);
          setImportWarnings([]);
        }}
        title="Importar Arquivo"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecionar Preset
            </label>
            <Select
              label=""
              value={selectedPreset?.toString() || ''}
              onChange={(e) => setSelectedPreset(parseInt(e.target.value))}
            >
              {presets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.nome} {preset.descricao ? `- ${preset.descricao}` : ''}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Arquivo (CSV ou JSON)
            </label>
            <input
              type="file"
              accept=".csv,.json"
              onChange={handleFileSelect}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-gold-500 focus:border-gold-500"
            />
            {selectedFile && (
              <p className="text-sm text-gray-600 mt-1">
                Arquivo selecionado: {selectedFile.name}
              </p>
            )}
          </div>

          {importWarnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">Avisos de Validação:</h4>
              <ul className="list-disc list-inside space-y-1">
                {importWarnings.map((warning, idx) => (
                  <li key={idx} className="text-sm text-yellow-700">{warning}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="ghost"
              onClick={() => {
                const preset = presets.find(p => p.id === selectedPreset);
                downloadTemplateCSVWithMapping(preset?.mapeamento);
              }}
            >
              Baixar Template CSV
            </Button>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setImportModal(false);
                  setSelectedFile(null);
                  setImportWarnings([]);
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleImport} disabled={!selectedFile}>
                Importar
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Presets Management Modal */}
      <Modal
        isOpen={presetsModal}
        onClose={() => setPresetsModal(false)}
        title="Gerenciar Presets de Importação"
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => handleOpenPresetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Preset
            </Button>
          </div>

          <div className="space-y-2">
            {presets.map((preset) => (
              <div
                key={preset.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{preset.nome}</h3>
                  {preset.descricao && (
                    <p className="text-sm text-gray-600 mt-1">{preset.descricao}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {preset.validacoes.length} validações configuradas
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenPresetForm(preset)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDeletePreset(preset.id!)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {presets.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                Nenhum preset configurado. Clique em "Novo Preset" para criar um.
              </p>
            )}
          </div>
        </div>
      </Modal>

      {/* Preset Form Modal */}
      <Modal
        isOpen={presetFormModal}
        onClose={() => setPresetFormModal(false)}
        title={editingPreset ? 'Editar Preset' : 'Novo Preset'}
        size="xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Nome do Preset"
              value={presetForm.nome}
              onChange={(e) => setPresetForm({ ...presetForm, nome: e.target.value })}
              placeholder="Ex: Padrão, Google Forms, etc."
            />
            <Input
              label="Descrição (opcional)"
              value={presetForm.descricao}
              onChange={(e) => setPresetForm({ ...presetForm, descricao: e.target.value })}
              placeholder="Descrição do preset"
            />
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Mapeamento de Campos</h3>
            <p className="text-sm text-gray-600 mb-4">
              Configure os nomes das colunas no arquivo CSV/JSON que correspondem a cada campo
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nome do Cliente"
                value={presetForm.mapeamento.clienteNome}
                onChange={(e) =>
                  setPresetForm({
                    ...presetForm,
                    mapeamento: { ...presetForm.mapeamento, clienteNome: e.target.value },
                  })
                }
              />
              <Input
                label="Telefone do Cliente"
                value={presetForm.mapeamento.clienteTelefone || ''}
                onChange={(e) =>
                  setPresetForm({
                    ...presetForm,
                    mapeamento: { ...presetForm.mapeamento, clienteTelefone: e.target.value },
                  })
                }
              />
              <Input
                label="Email do Cliente"
                value={presetForm.mapeamento.clienteEmail || ''}
                onChange={(e) =>
                  setPresetForm({
                    ...presetForm,
                    mapeamento: { ...presetForm.mapeamento, clienteEmail: e.target.value },
                  })
                }
              />
              <Input
                label="Tipo de Serviço"
                value={presetForm.mapeamento.tipoServico}
                onChange={(e) =>
                  setPresetForm({
                    ...presetForm,
                    mapeamento: { ...presetForm.mapeamento, tipoServico: e.target.value },
                  })
                }
              />
              <Input
                label="Pacote de Horas"
                value={presetForm.mapeamento.pacoteHoras || ''}
                onChange={(e) =>
                  setPresetForm({
                    ...presetForm,
                    mapeamento: { ...presetForm.mapeamento, pacoteHoras: e.target.value },
                  })
                }
              />
              <Input
                label="Tipo de Veículo"
                value={presetForm.mapeamento.veiculoTipo}
                onChange={(e) =>
                  setPresetForm({
                    ...presetForm,
                    mapeamento: { ...presetForm.mapeamento, veiculoTipo: e.target.value },
                  })
                }
              />
              <Input
                label="Blindado"
                value={presetForm.mapeamento.blindado || ''}
                onChange={(e) =>
                  setPresetForm({
                    ...presetForm,
                    mapeamento: { ...presetForm.mapeamento, blindado: e.target.value },
                  })
                }
              />
              <Input
                label="Tipo de Motorista"
                value={presetForm.mapeamento.motoristaTipo}
                onChange={(e) =>
                  setPresetForm({
                    ...presetForm,
                    mapeamento: { ...presetForm.mapeamento, motoristaTipo: e.target.value },
                  })
                }
              />
              <Input
                label="Origem"
                value={presetForm.mapeamento.origem}
                onChange={(e) =>
                  setPresetForm({
                    ...presetForm,
                    mapeamento: { ...presetForm.mapeamento, origem: e.target.value },
                  })
                }
              />
              <Input
                label="Destino"
                value={presetForm.mapeamento.destino}
                onChange={(e) =>
                  setPresetForm({
                    ...presetForm,
                    mapeamento: { ...presetForm.mapeamento, destino: e.target.value },
                  })
                }
              />
              <Input
                label="Data/Hora Início"
                value={presetForm.mapeamento.dataHoraInicio}
                onChange={(e) =>
                  setPresetForm({
                    ...presetForm,
                    mapeamento: { ...presetForm.mapeamento, dataHoraInicio: e.target.value },
                  })
                }
              />
              <Input
                label="Data/Hora Fim"
                value={presetForm.mapeamento.dataHoraFim || ''}
                onChange={(e) =>
                  setPresetForm({
                    ...presetForm,
                    mapeamento: { ...presetForm.mapeamento, dataHoraFim: e.target.value },
                  })
                }
              />
              <Input
                label="Observações"
                value={presetForm.mapeamento.observacoes || ''}
                onChange={(e) =>
                  setPresetForm({
                    ...presetForm,
                    mapeamento: { ...presetForm.mapeamento, observacoes: e.target.value },
                  })
                }
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium text-gray-900">Regras de Validação</h3>
              <Button size="sm" onClick={handleAddValidation}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Validação
              </Button>
            </div>
            <div className="space-y-3">
              {presetForm.validacoes.map((validation, idx) => (
                <div key={idx} className="flex gap-2 items-end border border-gray-200 rounded-lg p-3">
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <Input
                      label="Campo"
                      value={validation.campo}
                      onChange={(e) => handleUpdateValidation(idx, 'campo', e.target.value)}
                      placeholder="Nome do campo"
                    />
                    <Select
                      label="Tipo"
                      value={validation.tipo}
                      onChange={(e) => handleUpdateValidation(idx, 'tipo', e.target.value)}
                      options={[
                        { value: 'texto', label: 'Texto' },
                        { value: 'numero', label: 'Número' },
                        { value: 'data', label: 'Data' },
                        { value: 'booleano', label: 'Booleano' },
                      ]}
                    />
                    <div className="flex items-center pt-6">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={validation.obrigatorio}
                          onChange={(e) =>
                            handleUpdateValidation(idx, 'obrigatorio', e.target.checked)
                          }
                          className="rounded border-gray-300 text-gold-500 focus:ring-gold-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Obrigatório</span>
                      </label>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleRemoveValidation(idx)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {presetForm.validacoes.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhuma validação configurada. Clique em "Adicionar Validação" para criar regras.
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="ghost" onClick={() => setPresetFormModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSavePreset}>
              {editingPreset ? 'Atualizar Preset' : 'Criar Preset'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
