import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/forms/Input';
import { Select } from '../components/forms/Select';
import { Plus, Edit2, Trash2, Power, PowerOff } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import type { TabelaPreco } from '../db/models';

export function TabelaPrecos() {
  const precos = useLiveQuery(() => db.tabela_precos.toArray()) || [];
  const settings = useLiveQuery(() => db.settings.toCollection().first());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPreco, setEditingPreco] = useState<TabelaPreco | null>(null);

  const [formData, setFormData] = useState<Partial<TabelaPreco>>({
    tipoServico: 'transfer',
    veiculoTipo: '',
    blindado: false,
    motoristaTipo: 'monolingue',
    valorClienteBase: 0,
    valorFornecedorBase: 0,
    ativo: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const precoData: TabelaPreco = {
      ...formData as TabelaPreco,
      createdAt: editingPreco?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    if (editingPreco?.id) {
      await db.tabela_precos.update(editingPreco.id, precoData);
    } else {
      await db.tabela_precos.add(precoData);
    }

    resetForm();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este preço?')) {
      await db.tabela_precos.delete(id);
    }
  };

  const handleEdit = (preco: TabelaPreco) => {
    setEditingPreco(preco);
    setFormData(preco);
    setIsModalOpen(true);
  };

  const toggleAtivo = async (preco: TabelaPreco) => {
    await db.tabela_precos.update(preco.id!, { ativo: !preco.ativo });
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setEditingPreco(null);
    setFormData({
      tipoServico: 'transfer',
      veiculoTipo: '',
      blindado: false,
      motoristaTipo: 'monolingue',
      valorClienteBase: 0,
      valorFornecedorBase: 0,
      ativo: true,
    });
  };

  const veiculoOptions = settings?.veiculosCatalogo.filter(v => v.ativo).map(v => ({
    value: v.id,
    label: v.nome
  })) || [];

  const pacoteOptions = settings?.pacotesHora.map(h => ({
    value: h,
    label: `${h} horas`
  })) || [];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tabela de Preços</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={20} className="mr-2" />
          Novo Preço
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Veículo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pacote</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motorista</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blindado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor Cliente</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {precos.map((preco) => {
                const veiculo = settings?.veiculosCatalogo.find(v => v.id === preco.veiculoTipo);
                return (
                  <tr key={preco.id} className={!preco.ativo ? 'opacity-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {preco.tipoServico === 'transfer' ? 'Transfer' : 'Por Hora'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {veiculo?.nome || preco.veiculoTipo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {preco.pacoteHoras ? `${preco.pacoteHoras}h` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {preco.motoristaTipo === 'bilingue' ? 'Bilíngue' : 'Monolíngue'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {preco.blindado ? 'Sim' : 'Não'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                      {formatCurrency(preco.valorClienteBase)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <button
                        onClick={() => toggleAtivo(preco)}
                        className={`${preco.ativo ? 'text-green-600' : 'text-gray-400'}`}
                      >
                        {preco.ativo ? <Power size={18} /> : <PowerOff size={18} />}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(preco)}
                        className="text-gold-600 hover:text-gold-900 mr-3"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(preco.id!)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {precos.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    Nenhum preço cadastrado
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
        title={editingPreco ? 'Editar Preço' : 'Novo Preço'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Tipo de Serviço"
            value={formData.tipoServico}
            onChange={(e) => setFormData({ ...formData, tipoServico: e.target.value as any })}
            options={[
              { value: 'transfer', label: 'Transfer' },
              { value: 'hora', label: 'Por Hora' },
            ]}
            required
          />

          {formData.tipoServico === 'hora' && (
            <Select
              label="Pacote de Horas"
              value={formData.pacoteHoras || ''}
              onChange={(e) => setFormData({ ...formData, pacoteHoras: Number(e.target.value) })}
              options={[{ value: '', label: 'Selecione...' }, ...pacoteOptions]}
              required
            />
          )}

          <Select
            label="Tipo de Veículo"
            value={formData.veiculoTipo}
            onChange={(e) => setFormData({ ...formData, veiculoTipo: e.target.value })}
            options={[{ value: '', label: 'Selecione...' }, ...veiculoOptions]}
            required
          />

          <Select
            label="Blindado"
            value={formData.blindado ? 'true' : 'false'}
            onChange={(e) => setFormData({ ...formData, blindado: e.target.value === 'true' })}
            options={[
              { value: 'false', label: 'Não' },
              { value: 'true', label: 'Sim' },
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

          <Input
            label="Valor Cliente Base"
            type="number"
            step="0.01"
            value={formData.valorClienteBase}
            onChange={(e) => setFormData({ ...formData, valorClienteBase: Number(e.target.value) })}
            required
          />

          <Input
            label="Valor Fornecedor Base"
            type="number"
            step="0.01"
            value={formData.valorFornecedorBase}
            onChange={(e) => setFormData({ ...formData, valorFornecedorBase: Number(e.target.value) })}
            required
          />

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={resetForm}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingPreco ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
