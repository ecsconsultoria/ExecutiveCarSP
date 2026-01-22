import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { db } from '../db';
import type { Cliente, Contato } from '../db/models';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Select, TextArea, Checkbox } from '../components/forms/Input';

export function Clientes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const clientes = useLiveQuery(() => db.clientes.toArray(), []);

  const filteredClientes = clientes?.filter(
    (cliente) =>
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.documento.includes(searchTerm)
  );

  const handleAdd = () => {
    setEditingCliente({
      nome: '',
      documento: '',
      contatos: [],
      endereco: {
        rua: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
      },
      observacoes: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setIsModalOpen(true);
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    await db.clientes.delete(id);
    setDeleteConfirm(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCliente) return;

    const cliente = {
      ...editingCliente,
      updatedAt: new Date(),
    };

    if (editingCliente.id) {
      await db.clientes.update(editingCliente.id, cliente);
    } else {
      await db.clientes.add(cliente);
    }

    setIsModalOpen(false);
    setEditingCliente(null);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-black-900">Clientes</h1>
        <Button onClick={handleAdd}>
          <Plus className="h-5 w-5 mr-2" />
          Novo Cliente
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar por nome ou documento..."
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
                  Documento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato Principal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cidade
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClientes?.map((cliente) => {
                const contatoPrincipal = cliente.contatos.find((c) => c.principal);
                return (
                  <tr key={cliente.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {cliente.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cliente.documento}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contatoPrincipal
                        ? `${contatoPrincipal.tipo}: ${contatoPrincipal.valor}`
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cliente.endereco.cidade}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(cliente)}
                        className="text-gold-600 hover:text-gold-900 mr-4"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      {deleteConfirm === cliente.id ? (
                        <div className="inline-flex gap-2">
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => cliente.id && handleDelete(cliente.id)}
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
                          onClick={() => cliente.id && setDeleteConfirm(cliente.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredClientes?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    Nenhum cliente encontrado
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
        title={editingCliente?.id ? 'Editar Cliente' : 'Novo Cliente'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input
                label="Nome"
                value={editingCliente?.nome || ''}
                onChange={(e) =>
                  setEditingCliente((prev) =>
                    prev ? { ...prev, nome: e.target.value } : null
                  )
                }
                required
              />
            </div>

            <Input
              label="Documento (CPF/CNPJ)"
              value={editingCliente?.documento || ''}
              onChange={(e) =>
                setEditingCliente((prev) =>
                  prev ? { ...prev, documento: e.target.value } : null
                )
              }
              required
            />

            <div className="col-span-2">
              <h3 className="text-lg font-medium mb-2">Endereço</h3>
            </div>

            <div className="col-span-2 md:col-span-1">
              <Input
                label="Rua"
                value={editingCliente?.endereco.rua || ''}
                onChange={(e) =>
                  setEditingCliente((prev) =>
                    prev
                      ? {
                          ...prev,
                          endereco: { ...prev.endereco, rua: e.target.value },
                        }
                      : null
                  )
                }
              />
            </div>

            <Input
              label="Número"
              value={editingCliente?.endereco.numero || ''}
              onChange={(e) =>
                setEditingCliente((prev) =>
                  prev
                    ? {
                        ...prev,
                        endereco: { ...prev.endereco, numero: e.target.value },
                      }
                    : null
                )
              }
            />

            <Input
              label="Complemento"
              value={editingCliente?.endereco.complemento || ''}
              onChange={(e) =>
                setEditingCliente((prev) =>
                  prev
                    ? {
                        ...prev,
                        endereco: { ...prev.endereco, complemento: e.target.value },
                      }
                    : null
                )
              }
            />

            <Input
              label="Bairro"
              value={editingCliente?.endereco.bairro || ''}
              onChange={(e) =>
                setEditingCliente((prev) =>
                  prev
                    ? {
                        ...prev,
                        endereco: { ...prev.endereco, bairro: e.target.value },
                      }
                    : null
                )
              }
            />

            <Input
              label="Cidade"
              value={editingCliente?.endereco.cidade || ''}
              onChange={(e) =>
                setEditingCliente((prev) =>
                  prev
                    ? {
                        ...prev,
                        endereco: { ...prev.endereco, cidade: e.target.value },
                      }
                    : null
                )
              }
            />

            <Input
              label="Estado"
              value={editingCliente?.endereco.estado || ''}
              onChange={(e) =>
                setEditingCliente((prev) =>
                  prev
                    ? {
                        ...prev,
                        endereco: { ...prev.endereco, estado: e.target.value },
                      }
                    : null
                )
              }
              maxLength={2}
            />

            <Input
              label="CEP"
              value={editingCliente?.endereco.cep || ''}
              onChange={(e) =>
                setEditingCliente((prev) =>
                  prev
                    ? {
                        ...prev,
                        endereco: { ...prev.endereco, cep: e.target.value },
                      }
                    : null
                )
              }
            />

            <div className="col-span-2">
              <h3 className="text-lg font-medium mb-2">Contatos</h3>
              {editingCliente?.contatos.map((contato, index) => (
                <div key={index} className="grid grid-cols-4 gap-2 mb-2">
                  <Select
                    options={[
                      { value: 'telefone', label: 'Telefone' },
                      { value: 'email', label: 'Email' },
                      { value: 'whatsapp', label: 'WhatsApp' },
                    ]}
                    value={contato.tipo}
                    onChange={(e) => {
                      const newContatos = [...editingCliente.contatos];
                      newContatos[index].tipo = e.target.value as Contato['tipo'];
                      setEditingCliente({ ...editingCliente, contatos: newContatos });
                    }}
                  />
                  <div className="col-span-2">
                    <Input
                      value={contato.valor}
                      onChange={(e) => {
                        const newContatos = [...editingCliente.contatos];
                        newContatos[index].valor = e.target.value;
                        setEditingCliente({ ...editingCliente, contatos: newContatos });
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      label="Principal"
                      checked={contato.principal}
                      onChange={(e) => {
                        const newContatos = editingCliente.contatos.map((c, i) => ({
                          ...c,
                          principal: i === index ? e.target.checked : false,
                        }));
                        setEditingCliente({ ...editingCliente, contatos: newContatos });
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newContatos = editingCliente.contatos.filter(
                          (_, i) => i !== index
                        );
                        setEditingCliente({ ...editingCliente, contatos: newContatos });
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
                    principal: editingCliente?.contatos.length === 0,
                  };
                  setEditingCliente((prev) =>
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
                value={editingCliente?.observacoes || ''}
                onChange={(e) =>
                  setEditingCliente((prev) =>
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
