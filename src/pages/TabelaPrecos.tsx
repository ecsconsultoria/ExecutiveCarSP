import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { db } from '../db';
import type { TabelaPreco, Ajuste } from '../db/models';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Select, Checkbox } from '../components/forms/Input';
import { CurrencyInput } from '../components/forms/CurrencyInput';

export function TabelaPrecos() {
  const [filterTipoServico, setFilterTipoServico] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPreco, setEditingPreco] = useState<TabelaPreco | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const precos = useLiveQuery(() => db.tabela_precos.toArray(), []);
  const settings = useLiveQuery(() => db.settings.get(1));

  const filteredPrecos = precos?.filter(
    (preco) =>
      filterTipoServico === 'all' || preco.tipoServico === filterTipoServico
  );

  const handleAdd = () => {
    setEditingPreco({
      tipoServico: 'transfer',
      pacoteHoras: null,
      veiculoTipo: settings?.vehiclesCatalog[0]?.id || '',
      blindado: false,
      motoristaTipo: 'mono',
      valorClienteBase: 0,
      valorFornecedorBase: 0,
      ajustes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setIsModalOpen(true);
  };

  const handleEdit = (preco: TabelaPreco) => {
    setEditingPreco(preco);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    await db.tabela_precos.delete(id);
    setDeleteConfirm(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPreco) return;

    const preco = {
      ...editingPreco,
      updatedAt: new Date(),
    };

    if (editingPreco.id) {
      await db.tabela_precos.update(editingPreco.id, preco);
    } else {
      await db.tabela_precos.add(preco);
    }

    setIsModalOpen(false);
    setEditingPreco(null);
  };

  const getVehicleName = (vehicleId: string) => {
    return settings?.vehiclesCatalog.find((v) => v.id === vehicleId)?.name || vehicleId;
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-black-900">Tabela de Preços</h1>
        <Button onClick={handleAdd} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          Novo Preço
        </Button>
      </div>

      <Card>
        <div className="mb-3 sm:mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Select
            label="Filtrar por Tipo de Serviço"
            options={[
              { value: 'all', label: 'Todos' },
              { value: 'transfer', label: 'Transfer' },
              { value: 'hora', label: 'Por Hora' },
            ]}
            value={filterTipoServico}
            onChange={(e) => setFilterTipoServico(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo Serviço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Veículo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Motorista
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Blindado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Cliente
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Fornecedor
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPrecos?.map((preco) => (
                <tr key={preco.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {preco.tipoServico === 'transfer'
                      ? 'Transfer'
                      : `${preco.pacoteHoras}h`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getVehicleName(preco.veiculoTipo)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {preco.motoristaTipo === 'bilingue' ? 'Bilíngue' : 'Monolíngue'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {preco.blindado ? 'Sim' : 'Não'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    R$ {preco.valorClienteBase.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    R$ {preco.valorFornecedorBase.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(preco)}
                      className="text-gold-600 hover:text-gold-900 mr-4"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    {deleteConfirm === preco.id ? (
                      <div className="inline-flex gap-2">
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => preco.id && handleDelete(preco.id)}
                        >
                          Confirmar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteConfirm(null)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => preco.id && setDeleteConfirm(preco.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredPrecos?.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    Nenhum preço encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPreco?.id ? 'Editar Preço' : 'Novo Preço'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <Select
              label="Tipo de Serviço"
              options={[
                { value: 'transfer', label: 'Transfer' },
                { value: 'hora', label: 'Por Hora' },
              ]}
              value={editingPreco?.tipoServico || 'transfer'}
              onChange={(e) =>
                setEditingPreco((prev) =>
                  prev
                    ? {
                        ...prev,
                        tipoServico: e.target.value as 'transfer' | 'hora',
                        pacoteHoras:
                          e.target.value === 'transfer'
                            ? null
                            : settings?.hourPackages[0] || 3,
                      }
                    : null
                )
              }
              required
            />

            {editingPreco?.tipoServico === 'hora' && (
              <Select
                label="Pacote de Horas"
                options={
                  settings?.hourPackages.map((h) => ({
                    value: h,
                    label: `${h} horas`,
                  })) || []
                }
                value={editingPreco?.pacoteHoras || ''}
                onChange={(e) =>
                  setEditingPreco((prev) =>
                    prev ? { ...prev, pacoteHoras: Number(e.target.value) } : null
                  )
                }
                required
              />
            )}

            <Select
              label="Tipo de Veículo"
              options={
                settings?.vehiclesCatalog.map((v) => ({
                  value: v.id,
                  label: v.name,
                })) || []
              }
              value={editingPreco?.veiculoTipo || ''}
              onChange={(e) =>
                setEditingPreco((prev) =>
                  prev ? { ...prev, veiculoTipo: e.target.value } : null
                )
              }
              required
            />

            <Select
              label="Tipo de Motorista"
              options={[
                { value: 'mono', label: 'Monolíngue' },
                { value: 'bilingue', label: 'Bilíngue' },
              ]}
              value={editingPreco?.motoristaTipo || 'mono'}
              onChange={(e) =>
                setEditingPreco((prev) =>
                  prev
                    ? { ...prev, motoristaTipo: e.target.value as 'bilingue' | 'mono' }
                    : null
                )
              }
              required
            />

            <div className="md:col-span-2">
              <Checkbox
                label="Veículo Blindado"
                checked={editingPreco?.blindado || false}
                onChange={(e) =>
                  setEditingPreco((prev) =>
                    prev ? { ...prev, blindado: e.target.checked } : null
                  )
                }
              />
            </div>

            <CurrencyInput
              label="Valor Base Cliente"
              value={editingPreco?.valorClienteBase || 0}
              onChange={(value) =>
                setEditingPreco((prev) =>
                  prev ? { ...prev, valorClienteBase: value } : null
                )
              }
            />

            <CurrencyInput
              label="Valor Base Fornecedor"
              value={editingPreco?.valorFornecedorBase || 0}
              onChange={(value) =>
                setEditingPreco((prev) =>
                  prev ? { ...prev, valorFornecedorBase: value } : null
                )
              }
            />

            <div className="md:col-span-2">
              <h3 className="text-base sm:text-lg font-medium mb-2">Ajustes</h3>
              {editingPreco?.ajustes.map((ajuste, index) => (
                <div key={index} className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                  <Select
                    options={[
                      { value: 'percentual', label: 'Percentual' },
                      { value: 'fixo', label: 'Fixo' },
                    ]}
                    value={ajuste.tipo}
                    onChange={(e) => {
                      const newAjustes = [...editingPreco.ajustes];
                      newAjustes[index].tipo = e.target.value as 'percentual' | 'fixo';
                      setEditingPreco({ ...editingPreco, ajustes: newAjustes });
                    }}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    value={ajuste.valor}
                    onChange={(e) => {
                      const newAjustes = [...editingPreco.ajustes];
                      newAjustes[index].valor = Number(e.target.value);
                      setEditingPreco({ ...editingPreco, ajustes: newAjustes });
                    }}
                  />
                  <Input
                    placeholder="Descrição"
                    value={ajuste.descricao}
                    onChange={(e) => {
                      const newAjustes = [...editingPreco.ajustes];
                      newAjustes[index].descricao = e.target.value;
                      setEditingPreco({ ...editingPreco, ajustes: newAjustes });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newAjustes = editingPreco.ajustes.filter(
                        (_, i) => i !== index
                      );
                      setEditingPreco({ ...editingPreco, ajustes: newAjustes });
                    }}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newAjuste: Ajuste = {
                    tipo: 'percentual',
                    valor: 0,
                    descricao: '',
                  };
                  setEditingPreco((prev) =>
                    prev ? { ...prev, ajustes: [...prev.ajustes, newAjuste] } : null
                  );
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Ajuste
              </Button>
            </div>
          </div>

          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
