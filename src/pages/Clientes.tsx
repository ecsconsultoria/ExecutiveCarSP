import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/forms/Input';
import { Select } from '../components/forms/Select';
import { TextArea } from '../components/forms/TextArea';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import type { Cliente } from '../db/models';

export function Clientes() {
  const clientes = useLiveQuery(() => db.clientes.toArray()) || [];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);

  const [formData, setFormData] = useState<Partial<Cliente>>({
    tipo: 'pessoa_fisica',
    nome: '',
    documento: '',
    contatos: [],
    observacoes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const clienteData: Cliente = {
      ...formData as Cliente,
      createdAt: editingCliente?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    if (editingCliente?.id) {
      await db.clientes.update(editingCliente.id, clienteData);
    } else {
      await db.clientes.add(clienteData);
    }

    resetForm();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      await db.clientes.delete(id);
    }
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setFormData(cliente);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setEditingCliente(null);
    setFormData({
      tipo: 'pessoa_fisica',
      nome: '',
      documento: '',
      contatos: [],
      observacoes: '',
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={20} className="mr-2" />
          Novo Cliente
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contatos</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clientes.map((cliente) => (
                <tr key={cliente.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {cliente.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cliente.tipo === 'pessoa_fisica' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cliente.documento}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {cliente.contatos.map(c => c.valor).join(', ') || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(cliente)}
                      className="text-gold-600 hover:text-gold-900 mr-3"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(cliente.id!)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {clientes.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Nenhum cliente cadastrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Tipo"
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
            options={[
              { value: 'pessoa_fisica', label: 'Pessoa Física' },
              { value: 'pessoa_juridica', label: 'Pessoa Jurídica' },
            ]}
            required
          />

          <Input
            label={formData.tipo === 'pessoa_fisica' ? 'Nome Completo' : 'Razão Social'}
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            required
          />

          <Input
            label={formData.tipo === 'pessoa_fisica' ? 'CPF' : 'CNPJ'}
            value={formData.documento}
            onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
            required
          />

          <TextArea
            label="Observações"
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            rows={3}
          />

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={resetForm}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingCliente ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
