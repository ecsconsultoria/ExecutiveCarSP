import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { db } from '../db';
import type { Fornecedor, Contato } from '../db/models';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Select, TextArea, Checkbox } from '../components/forms/Input';

export function Fornecedores() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState<Fornecedor | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const fornecedores = useLiveQuery(() => db.fornecedores.toArray(), []);
  const settings = useLiveQuery(() => db.settings.get(1));

  const filteredFornecedores = fornecedores?.filter((fornecedor) =>
    fornecedor.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingFornecedor({
      nome: '',
      tipo: 'empresa',
      contatos: [],
      motoristaTipo: 'mono',
      veiculosOfertados: [],
      observacoes: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setIsModalOpen(true);
  };

  const handleEdit = (fornecedor: Fornecedor) => {
    setEditingFornecedor(fornecedor);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    await db.fornecedores.delete(id);
    setDeleteConfirm(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFornecedor) return;

    const fornecedor = {
      ...editingFornecedor,
      updatedAt: new Date(),
    };

    if (editingFornecedor.id) {
      await db.fornecedores.update(editingFornecedor.id, fornecedor);
    } else {
      await db.fornecedores.add(fornecedor);
    }

    setIsModalOpen(false);
    setEditingFornecedor(null);
  };

  const toggleVehicle = (vehicleId: string) => {
    if (!editingFornecedor) return;
    const veiculosOfertados = editingFornecedor.veiculosOfertados.includes(vehicleId)
      ? editingFornecedor.veiculosOfertados.filter((id) => id !== vehicleId)
      : [...editingFornecedor.veiculosOfertados, vehicleId];
    setEditingFornecedor({ ...editingFornecedor, veiculosOfertados });
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-black-900">Fornecedores</h1>
        <Button onClick={handleAdd}>
          <Plus className="h-5 w-5 mr-2" />
          Novo Fornecedor
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-gold-500 focus:border-gold-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Motorista
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Veículos
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFornecedores?.map((fornecedor) => {
                const vehicleNames = fornecedor.veiculosOfertados
                  .map(
                    (vId) =>
                      settings?.vehiclesCatalog.find((v) => v.id === vId)?.name || vId
                  )
                  .join(', ');
                return (
                  <tr key={fornecedor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {fornecedor.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {fornecedor.tipo === 'empresa' ? 'Empresa' : 'Autônomo'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {fornecedor.motoristaTipo === 'bilingue' ? 'Bilíngue' : 'Monolíngue'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {vehicleNames || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(fornecedor)}
                        className="text-gold-600 hover:text-gold-900 mr-4"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      {deleteConfirm === fornecedor.id ? (
                        <div className="inline-flex gap-2">
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => fornecedor.id && handleDelete(fornecedor.id)}
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
                          onClick={() => fornecedor.id && setDeleteConfirm(fornecedor.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredFornecedores?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    Nenhum fornecedor encontrado
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
        title={editingFornecedor?.id ? 'Editar Fornecedor' : 'Novo Fornecedor'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input
                label="Nome"
                value={editingFornecedor?.nome || ''}
                onChange={(e) =>
                  setEditingFornecedor((prev) =>
                    prev ? { ...prev, nome: e.target.value } : null
                  )
                }
                required
              />
            </div>

            <Select
              label="Tipo"
              options={[
                { value: 'empresa', label: 'Empresa' },
                { value: 'autonomo', label: 'Autônomo' },
              ]}
              value={editingFornecedor?.tipo || 'empresa'}
              onChange={(e) =>
                setEditingFornecedor((prev) =>
                  prev ? { ...prev, tipo: e.target.value as 'empresa' | 'autonomo' } : null
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
              value={editingFornecedor?.motoristaTipo || 'mono'}
              onChange={(e) =>
                setEditingFornecedor((prev) =>
                  prev
                    ? { ...prev, motoristaTipo: e.target.value as 'bilingue' | 'mono' }
                    : null
                )
              }
              required
            />

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Veículos Ofertados
              </label>
              <div className="grid grid-cols-2 gap-2">
                {settings?.vehiclesCatalog.map((vehicle) => (
                  <Checkbox
                    key={vehicle.id}
                    label={vehicle.name}
                    checked={editingFornecedor?.veiculosOfertados.includes(vehicle.id)}
                    onChange={() => toggleVehicle(vehicle.id)}
                  />
                ))}
              </div>
            </div>

            <div className="col-span-2">
              <h3 className="text-lg font-medium mb-2">Contatos</h3>
              {editingFornecedor?.contatos.map((contato, index) => (
                <div key={index} className="grid grid-cols-4 gap-2 mb-2">
                  <Select
                    options={[
                      { value: 'telefone', label: 'Telefone' },
                      { value: 'email', label: 'Email' },
                      { value: 'whatsapp', label: 'WhatsApp' },
                    ]}
                    value={contato.tipo}
                    onChange={(e) => {
                      const newContatos = [...editingFornecedor.contatos];
                      newContatos[index].tipo = e.target.value as Contato['tipo'];
                      setEditingFornecedor({ ...editingFornecedor, contatos: newContatos });
                    }}
                  />
                  <div className="col-span-2">
                    <Input
                      value={contato.valor}
                      onChange={(e) => {
                        const newContatos = [...editingFornecedor.contatos];
                        newContatos[index].valor = e.target.value;
                        setEditingFornecedor({ ...editingFornecedor, contatos: newContatos });
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      label="Principal"
                      checked={contato.principal}
                      onChange={(e) => {
                        const newContatos = editingFornecedor.contatos.map((c, i) => ({
                          ...c,
                          principal: i === index ? e.target.checked : false,
                        }));
                        setEditingFornecedor({ ...editingFornecedor, contatos: newContatos });
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newContatos = editingFornecedor.contatos.filter(
                          (_, i) => i !== index
                        );
                        setEditingFornecedor({ ...editingFornecedor, contatos: newContatos });
                      }}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newContato: Contato = {
                    tipo: 'telefone',
                    valor: '',
                    principal: editingFornecedor?.contatos.length === 0,
                  };
                  setEditingFornecedor((prev) =>
                    prev
                      ? { ...prev, contatos: [...prev.contatos, newContato] }
                      : null
                  );
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Contato
              </Button>
            </div>

            <div className="col-span-2">
              <TextArea
                label="Observações"
                value={editingFornecedor?.observacoes || ''}
                onChange={(e) =>
                  setEditingFornecedor((prev) =>
                    prev ? { ...prev, observacoes: e.target.value } : null
                  )
                }
                rows={3}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
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
