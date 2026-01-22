import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/forms/Input';
import { CurrencyInput } from '../components/forms/CurrencyInput';
import type { OrdemServico, Trecho } from '../db/models';
import { calculatePrice, findMatchingPrice } from '../utils/pricing';

export function OSWizard() {
  const navigate = useNavigate();
  const settings = useLiveQuery(() => db.settings.get(1));
  const clientes = useLiveQuery(() => db.clientes.toArray());
  const fornecedores = useLiveQuery(() => db.fornecedores.toArray());
  const tabelaPrecos = useLiveQuery(() => db.tabela_precos.toArray());

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<OrdemServico>>({
    tipoServico: 'transfer',
    blindado: false,
    motoristaTipo: 'mono',
    terceirizacao: 'nenhum',
    roteiro: [{ origem: '', destino: '', distancia: null, duracao: null }],
    notas: '',
    anexos: [],
    status: 'Reservado',
  });

  const [manualPrice, setManualPrice] = useState(false);
  const [precoManual, setPrecoManual] = useState(0);

  if (!settings || !clientes || !fornecedores || !tabelaPrecos) {
    return <div>Carregando...</div>;
  }

  const updateField = (field: keyof OrdemServico, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const addTrecho = () => {
    const newTrecho: Trecho = { origem: '', destino: '', distancia: null, duracao: null };
    updateField('roteiro', [...(formData.roteiro || []), newTrecho]);
  };

  const updateTrecho = (index: number, field: keyof Trecho, value: any) => {
    const roteiro = [...(formData.roteiro || [])];
    roteiro[index] = { ...roteiro[index], [field]: value };
    updateField('roteiro', roteiro);
  };

  const removeTrecho = (index: number) => {
    const roteiro = (formData.roteiro || []).filter((_, i) => i !== index);
    updateField('roteiro', roteiro);
  };

  const calculatePricing = () => {
    if (manualPrice) {
      return {
        basePrice: precoManual,
        tax: precoManual * (settings.imposto / 100),
        total: precoManual + (precoManual * (settings.imposto / 100)),
      };
    }

    const matchedPrice = findMatchingPrice(tabelaPrecos, {
      tipoServico: formData.tipoServico!,
      pacoteHoras: formData.pacoteHoras,
      veiculoTipo: formData.veiculoTipo!,
      blindado: formData.blindado!,
      motoristaTipo: formData.motoristaTipo!,
    });

    if (matchedPrice) {
      const calc = calculatePrice(
        matchedPrice.valorClienteBase,
        matchedPrice.ajustes,
        settings.imposto
      );
      return {
        basePrice: calc.subtotal,
        tax: calc.tax,
        total: calc.total,
      };
    }

    return null;
  };

  const handleSubmit = async () => {
    const pricing = calculatePricing();
    if (!pricing) {
      alert('Não foi possível calcular o preço. Por favor, use preço manual.');
      return;
    }

    const now = new Date();
    const os: Omit<OrdemServico, 'id'> = {
      clienteId: formData.clienteId!,
      tipoServico: formData.tipoServico!,
      pacoteHoras: formData.pacoteHoras || null,
      veiculoTipo: formData.veiculoTipo!,
      blindado: formData.blindado!,
      motoristaTipo: formData.motoristaTipo!,
      terceirizacao: formData.terceirizacao!,
      fornecedorId: formData.fornecedorId || null,
      roteiro: formData.roteiro!,
      agendamento: formData.agendamento!,
      status: 'Reservado',
      motivoCancelamento: null,
      taxaCancelamento: null,
      precoClienteTotal: pricing.total,
      precoFornecedor: formData.precoFornecedor || 0,
      impostosAplicados: pricing.tax,
      notas: formData.notas || '',
      anexos: [],
      createdAt: now,
      updatedAt: now,
    };

    const osId = await db.ordens_servico.add(os as OrdemServico);

    // Create compromisso
    await db.compromissos.add({
      ordemServicoId: osId as number,
      dataHoraInicio: formData.agendamento!.dataHoraInicio,
      dataHoraFim: formData.agendamento!.dataHoraFim || formData.agendamento!.dataHoraInicio,
      titulo: `OS #${osId} - ${formData.veiculoTipo}`,
      descricao: formData.notas || '',
      createdAt: now,
      updatedAt: now,
    });

    alert('Ordem de Serviço criada com sucesso!');
    navigate(`/os/${osId}`);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-black-900 mb-8">Nova Ordem de Serviço</h1>

      <Card>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 mx-1 rounded ${
                  s <= step ? 'bg-gold-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span className={step === 1 ? 'text-gold-500' : 'text-gray-500'}>Cliente & Serviço</span>
            <span className={step === 2 ? 'text-gold-500' : 'text-gray-500'}>Roteiro & Agenda</span>
            <span className={step === 3 ? 'text-gold-500' : 'text-gray-500'}>Preço & Confirmação</span>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <Select
              label="Cliente *"
              value={formData.clienteId || ''}
              onChange={(e) => updateField('clienteId', parseInt(e.target.value))}
              options={[
                { value: '', label: 'Selecione um cliente' },
                ...(clientes?.map((c) => ({ value: c.id!, label: c.nome })) || []),
              ]}
            />
            <Select
              label="Tipo de Serviço *"
              value={formData.tipoServico || 'transfer'}
              onChange={(e) => updateField('tipoServico', e.target.value)}
              options={[
                { value: 'transfer', label: 'Transfer' },
                { value: 'hora', label: 'Por Hora' },
              ]}
            />
            {formData.tipoServico === 'hora' && (
              <Select
                label="Pacote de Horas *"
                value={formData.pacoteHoras || ''}
                onChange={(e) => updateField('pacoteHoras', parseInt(e.target.value))}
                options={[
                  { value: '', label: 'Selecione o pacote' },
                  ...(settings.hourPackages.map((h) => ({ value: h, label: `${h} horas` })) || []),
                ]}
              />
            )}
            <Select
              label="Tipo de Veículo *"
              value={formData.veiculoTipo || ''}
              onChange={(e) => updateField('veiculoTipo', e.target.value)}
              options={[
                { value: '', label: 'Selecione o veículo' },
                ...(settings.vehiclesCatalog.map((v) => ({ value: v.id, label: v.name })) || []),
              ]}
            />
            <Select
              label="Blindado"
              value={formData.blindado ? 'true' : 'false'}
              onChange={(e) => updateField('blindado', e.target.value === 'true')}
              options={[
                { value: 'false', label: 'Não' },
                { value: 'true', label: 'Sim' },
              ]}
            />
            <Select
              label="Tipo de Motorista *"
              value={formData.motoristaTipo || 'mono'}
              onChange={(e) => updateField('motoristaTipo', e.target.value)}
              options={[
                { value: 'mono', label: 'Monolíngue' },
                { value: 'bilingue', label: 'Bilíngue' },
              ]}
            />
            <Select
              label="Terceirização"
              value={formData.terceirizacao || 'nenhum'}
              onChange={(e) => updateField('terceirizacao', e.target.value)}
              options={[
                { value: 'nenhum', label: 'Nenhum' },
                { value: 'motorista', label: 'Motorista' },
                { value: 'motorista_carro', label: 'Motorista + Carro' },
              ]}
            />
            {formData.terceirizacao !== 'nenhum' && (
              <Select
                label="Fornecedor"
                value={formData.fornecedorId || ''}
                onChange={(e) => updateField('fornecedorId', parseInt(e.target.value))}
                options={[
                  { value: '', label: 'Selecione um fornecedor' },
                  ...(fornecedores?.map((f) => ({ value: f.id!, label: f.nome })) || []),
                ]}
              />
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Roteiro</h3>
            {formData.roteiro?.map((trecho, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Trecho {index + 1}</span>
                  {formData.roteiro!.length > 1 && (
                    <Button variant="danger" size="sm" onClick={() => removeTrecho(index)}>
                      Remover
                    </Button>
                  )}
                </div>
                <Input
                  label="Origem"
                  value={trecho.origem}
                  onChange={(e) => updateTrecho(index, 'origem', e.target.value)}
                />
                <Input
                  label="Destino"
                  value={trecho.destino}
                  onChange={(e) => updateTrecho(index, 'destino', e.target.value)}
                />
              </div>
            ))}
            <Button onClick={addTrecho} variant="ghost">Adicionar Trecho</Button>

            <h3 className="font-semibold text-lg mt-6">Agendamento</h3>
            <Input
              label="Data e Hora de Início *"
              type="datetime-local"
              value={formData.agendamento?.dataHoraInicio ? new Date(formData.agendamento.dataHoraInicio).toISOString().slice(0, 16) : ''}
              onChange={(e) => updateField('agendamento', {
                ...formData.agendamento,
                tipo: formData.tipoServico,
                dataHoraInicio: new Date(e.target.value),
              })}
            />
            {formData.tipoServico === 'hora' && (
              <Input
                label="Data e Hora de Fim"
                type="datetime-local"
                value={formData.agendamento?.dataHoraFim ? new Date(formData.agendamento.dataHoraFim).toISOString().slice(0, 16) : ''}
                onChange={(e) => updateField('agendamento', {
                  ...formData.agendamento,
                  dataHoraFim: new Date(e.target.value),
                })}
              />
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={manualPrice}
                onChange={(e) => setManualPrice(e.target.checked)}
                className="h-4 w-4 text-gold-600"
              />
              <label className="text-sm font-medium">Usar preço manual</label>
            </div>

            {manualPrice ? (
              <CurrencyInput
                label="Preço Total (sem imposto)"
                value={precoManual}
                onChange={setPrecoManual}
              />
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg">
                {(() => {
                  const pricing = calculatePricing();
                  return pricing ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Preço Base:</span>
                        <span className="font-medium">R$ {pricing.basePrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Imposto ({settings.imposto}%):</span>
                        <span className="font-medium">R$ {pricing.tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Total:</span>
                        <span className="text-gold-600">R$ {pricing.total.toFixed(2)}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-red-600">Nenhum preço encontrado na tabela. Use preço manual.</p>
                  );
                })()}
              </div>
            )}

            {formData.terceirizacao !== 'nenhum' && (
              <CurrencyInput
                label="Preço Fornecedor"
                value={formData.precoFornecedor || 0}
                onChange={(value) => updateField('precoFornecedor', value)}
              />
            )}

            <Input
              label="Notas"
              value={formData.notas || ''}
              onChange={(e) => updateField('notas', e.target.value)}
            />
          </div>
        )}

        <div className="flex justify-between mt-6 pt-6 border-t">
          {step > 1 && (
            <Button variant="ghost" onClick={() => setStep(step - 1)}>
              Voltar
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)} className="ml-auto">
              Próximo
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="ml-auto">
              Criar Ordem de Serviço
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
