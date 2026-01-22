import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/forms/Input';
import { Plus, Trash2, Save } from 'lucide-react';
import type { Settings, VeiculoTipo, CancelPolicyWindow } from '../db/models';

export function Configuracoes() {
  const settings = useLiveQuery(() => db.settings.toCollection().first());
  const [formData, setFormData] = useState<Partial<Settings>>({
    moeda: 'BRL',
    timezone: 'America/Sao_Paulo',
    imposto: 10,
    cancelPolicy: [],
    veiculosCatalogo: [],
    pacotesHora: [],
    agendamentoFormUrl: '',
    theme: 'gold',
  });

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (settings?.id) {
      await db.settings.update(settings.id, formData);
      alert('Configurações salvas com sucesso!');
    }
  };

  const addVeiculo = () => {
    const novoId = `veiculo-${Date.now()}`;
    setFormData({
      ...formData,
      veiculosCatalogo: [
        ...(formData.veiculosCatalogo || []),
        { id: novoId, nome: '', blindadoDisponivel: false, ativo: true },
      ],
    });
  };

  const updateVeiculo = (index: number, updates: Partial<VeiculoTipo>) => {
    const veiculos = [...(formData.veiculosCatalogo || [])];
    veiculos[index] = { ...veiculos[index], ...updates };
    setFormData({ ...formData, veiculosCatalogo: veiculos });
  };

  const removeVeiculo = (index: number) => {
    const veiculos = [...(formData.veiculosCatalogo || [])];
    veiculos.splice(index, 1);
    setFormData({ ...formData, veiculosCatalogo: veiculos });
  };

  const addPolicyWindow = () => {
    setFormData({
      ...formData,
      cancelPolicy: [
        ...(formData.cancelPolicy || []),
        { horasAntes: 24, percentual: 0, descricao: '' },
      ],
    });
  };

  const updatePolicyWindow = (index: number, updates: Partial<CancelPolicyWindow>) => {
    const policy = [...(formData.cancelPolicy || [])];
    policy[index] = { ...policy[index], ...updates };
    setFormData({ ...formData, cancelPolicy: policy });
  };

  const removePolicyWindow = (index: number) => {
    const policy = [...(formData.cancelPolicy || [])];
    policy.splice(index, 1);
    setFormData({ ...formData, cancelPolicy: policy });
  };

  const addPacoteHora = () => {
    const novoPacote = prompt('Digite o número de horas:');
    if (novoPacote) {
      setFormData({
        ...formData,
        pacotesHora: [...(formData.pacotesHora || []), Number(novoPacote)].sort((a, b) => a - b),
      });
    }
  };

  const removePacoteHora = (index: number) => {
    const pacotes = [...(formData.pacotesHora || [])];
    pacotes.splice(index, 1);
    setFormData({ ...formData, pacotesHora: pacotes });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <Button onClick={handleSubmit}>
          <Save size={20} className="mr-2" />
          Salvar Configurações
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Configurações Gerais */}
        <Card title="Configurações Gerais">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Moeda"
              value={formData.moeda}
              onChange={(e) => setFormData({ ...formData, moeda: e.target.value })}
              disabled
            />
            <Input
              label="Timezone"
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              disabled
            />
            <Input
              label="Imposto Padrão (%)"
              type="number"
              step="0.01"
              value={formData.imposto}
              onChange={(e) => setFormData({ ...formData, imposto: Number(e.target.value) })}
              required
            />
            <Input
              label="URL Formulário de Agendamento"
              type="url"
              value={formData.agendamentoFormUrl}
              onChange={(e) => setFormData({ ...formData, agendamentoFormUrl: e.target.value })}
              placeholder="https://forms.google.com/..."
            />
          </div>
        </Card>

        {/* Política de Cancelamento */}
        <Card title="Política de Cancelamento">
          <div className="space-y-3">
            {formData.cancelPolicy?.map((window, index) => (
              <div key={index} className="flex gap-3 items-end">
                <Input
                  label="Horas Antes"
                  type="number"
                  value={window.horasAntes}
                  onChange={(e) => updatePolicyWindow(index, { horasAntes: Number(e.target.value) })}
                  className="flex-1"
                />
                <Input
                  label="Percentual (%)"
                  type="number"
                  value={window.percentual}
                  onChange={(e) => updatePolicyWindow(index, { percentual: Number(e.target.value) })}
                  className="flex-1"
                />
                <Input
                  label="Descrição"
                  value={window.descricao}
                  onChange={(e) => updatePolicyWindow(index, { descricao: e.target.value })}
                  className="flex-1"
                  placeholder="Ex: >48h, 24-48h, <24h"
                />
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => removePolicyWindow(index)}
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={addPolicyWindow}>
              <Plus size={18} className="mr-2" />
              Adicionar Janela
            </Button>
          </div>
        </Card>

        {/* Catálogo de Veículos */}
        <Card title="Catálogo de Veículos">
          <div className="space-y-3">
            {formData.veiculosCatalogo?.map((veiculo, index) => (
              <div key={veiculo.id} className="flex gap-3 items-end">
                <Input
                  label="Nome do Veículo"
                  value={veiculo.nome}
                  onChange={(e) => updateVeiculo(index, { nome: e.target.value })}
                  className="flex-1"
                />
                <div className="flex items-center gap-2 pb-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={veiculo.blindadoDisponivel}
                      onChange={(e) => updateVeiculo(index, { blindadoDisponivel: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    Blindado Disponível
                  </label>
                  <label className="flex items-center gap-2 text-sm ml-4">
                    <input
                      type="checkbox"
                      checked={veiculo.ativo}
                      onChange={(e) => updateVeiculo(index, { ativo: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    Ativo
                  </label>
                </div>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => removeVeiculo(index)}
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={addVeiculo}>
              <Plus size={18} className="mr-2" />
              Adicionar Veículo
            </Button>
          </div>
        </Card>

        {/* Pacotes de Hora */}
        <Card title="Pacotes de Hora">
          <div className="flex flex-wrap gap-2 mb-4">
            {formData.pacotesHora?.map((pacote, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                <span className="font-medium">{pacote}h</span>
                <button
                  type="button"
                  onClick={() => removePacoteHora(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <Button type="button" variant="secondary" onClick={addPacoteHora}>
            <Plus size={18} className="mr-2" />
            Adicionar Pacote
          </Button>
        </Card>
      </form>
    </div>
  );
}
