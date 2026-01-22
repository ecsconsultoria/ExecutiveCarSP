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
import type { Fornecedor } from '../db/models';

export function Fornecedores() {
  const fornecedores = useLiveQuery(() => db.fornecedores.toArray()) || [];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState<Fornecedor | null>(null);

  const [formData, setFormData] = useState<Partial<Fornecedor>>({
    nome: '',
    tipo: 'empresa',
    contatos: [],
    motoristaTipo: 'monolingue',
    veiculosOfertados: [],
    observacoes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const fornecedorData: Fornecedor = {
      ...formData as Fornecedor,
      createdAt: editingFornecedor?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    if (editingFornecedor?.id) {
      await db.fornecedores.update(editingFornecedor.id, fornecedorData);
    } else {
      await db.fornecedores.add(fornecedorData);
    }

    resetForm();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este fornecedor?')) {
      await db.fornecedores.delete(id);
    }
  };

  const handleEdit = (fornecedor: Fornecedor) => {
    setEditingFornecedor(fornecedor);
    setFormData(fornecedor);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setEditingFornecedor(null);
    setFormData({
      nome: '',
      tipo: 'empresa',
      contatos: [],
      motoristaTipo: 'monolingue',
      veiculosOfertados: [],
      observacoes: '',
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Fornecedores</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={20} className="mr-2" />
          Novo Fornecedor
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motorista</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Veículos</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fornecedores.map((fornecedor) => (
                <tr key={fornecedor.id}>
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
                    {fornecedor.veiculosOfertados.length} veículo(s)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(fornecedor)}
                      className="text-gold-600 hover:text-gold-900 mr-3"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(fornecedor.id!)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {fornecedores.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Nenhum fornecedor cadastrado
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
        title={editingFornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            required
          />

          <Select
            label="Tipo"
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
            options={[
              { value: 'empresa', label: 'Empresa' },
              { value: 'autonomo', label: 'Autônomo' },
            ]}
            required
          />

          <Select
            label="Tipo de Motorista"
            value={formData.motoristaTipo}
            onChange={(e) => setFormData({ ...formData, motoristaTipo: e.target.value as any })}
            options={[
              { value: 'monolingue', label: 'Monolíngue' },
              { value: 'bilingue', label: 'Bilíngue' },
            ]}
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
              {editingFornecedor ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
