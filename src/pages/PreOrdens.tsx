import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Search, CheckCircle, XCircle, Eye, Trash2, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../db';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select, Input } from '../components/forms/Input';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import type { PreOrdem } from '../db/models';

export function PreOrdens() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [importSourceFilter, setImportSourceFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [detailsModal, setDetailsModal] = useState<{ isOpen: boolean; preOrdem: PreOrdem | null }>({
    isOpen: false,
    preOrdem: null,
  });
  const [editedPreOrdem, setEditedPreOrdem] = useState<PreOrdem | null>(null);

  const { showToast } = useToast();

  const preOrdens = useLiveQuery(() => db.pre_ordens.toArray(), []);
  const settings = useLiveQuery(() => db.settings.get(1));

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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black-900">Pré-Ordens</h1>
        <p className="text-gray-600 mt-2">Gerenciar ordens importadas e convertê-las em OS</p>
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
    </div>
  );
}
