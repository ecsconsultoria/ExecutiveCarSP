import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { CancelPolicyWindow, VehicleType } from '../db/models';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Checkbox } from '../components/forms/Input';
import { Trash2, Plus } from 'lucide-react';

export function Configuracoes() {
  const settings = useLiveQuery(() => db.settings.get(1));
  
  const [imposto, setImposto] = useState(10);
  const [formUrl, setFormUrl] = useState('');
  const [cancelPolicy, setCancelPolicy] = useState<CancelPolicyWindow[]>([]);
  const [vehicles, setVehicles] = useState<VehicleType[]>([]);
  const [hourPackages, setHourPackages] = useState<number[]>([]);
  const [newVehicleName, setNewVehicleName] = useState('');
  const [newVehicleBlindado, setNewVehicleBlindado] = useState(false);
  const [newHourPackage, setNewHourPackage] = useState('');

  useEffect(() => {
    if (settings) {
      setImposto(settings.imposto);
      setFormUrl(settings.formUrl);
      setCancelPolicy(settings.cancelPolicy);
      setVehicles(settings.vehiclesCatalog);
      setHourPackages(settings.hourPackages);
    }
  }, [settings]);

  const handleSave = async () => {
    await db.settings.update(1, {
      imposto,
      formUrl,
      cancelPolicy,
      vehiclesCatalog: vehicles,
      hourPackages,
    });
    alert('Configurações salvas com sucesso!');
  };

  const addVehicle = () => {
    if (newVehicleName.trim()) {
      const id = newVehicleName.toLowerCase().replace(/\s+/g, '-');
      setVehicles([...vehicles, { id, name: newVehicleName, blindado: newVehicleBlindado }]);
      setNewVehicleName('');
      setNewVehicleBlindado(false);
    }
  };

  const removeVehicle = (id: string) => {
    setVehicles(vehicles.filter(v => v.id !== id));
  };

  const addHourPackage = () => {
    const hours = parseInt(newHourPackage);
    if (hours > 0 && !hourPackages.includes(hours)) {
      setHourPackages([...hourPackages, hours].sort((a, b) => a - b));
      setNewHourPackage('');
    }
  };

  const removeHourPackage = (hours: number) => {
    setHourPackages(hourPackages.filter(h => h !== hours));
  };

  const updateCancelPolicy = (index: number, field: keyof CancelPolicyWindow, value: any) => {
    const updated = [...cancelPolicy];
    updated[index] = { ...updated[index], [field]: value };
    setCancelPolicy(updated);
  };

  const addCancelPolicyWindow = () => {
    setCancelPolicy([...cancelPolicy, { minHours: 0, maxHours: null, percentage: 0 }]);
  };

  const removeCancelPolicyWindow = (index: number) => {
    setCancelPolicy(cancelPolicy.filter((_, i) => i !== index));
  };

  if (!settings) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-black-900 mb-8">Configurações</h1>

      <div className="space-y-6">
        {/* General Settings */}
        <Card title="Configurações Gerais">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Moeda"
              value="BRL"
              disabled
            />
            <Input
              label="Fuso Horário"
              value="America/Sao_Paulo"
              disabled
            />
            <Input
              label="Imposto (%)"
              type="number"
              value={imposto}
              onChange={(e) => setImposto(parseFloat(e.target.value))}
            />
            <Input
              label="URL do Formulário de Agendamento"
              type="url"
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
              placeholder="https://exemplo.com/formulario"
            />
          </div>
        </Card>

        {/* Cancel Policy */}
        <Card title="Política de Cancelamento">
          <div className="space-y-4">
            {cancelPolicy.map((window, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1 grid grid-cols-3 gap-4">
                  <Input
                    label="Horas Mínimas"
                    type="number"
                    value={window.minHours}
                    onChange={(e) => updateCancelPolicy(index, 'minHours', parseInt(e.target.value))}
                  />
                  <Input
                    label="Horas Máximas (null = sem limite)"
                    type="number"
                    value={window.maxHours ?? ''}
                    onChange={(e) => updateCancelPolicy(index, 'maxHours', e.target.value ? parseInt(e.target.value) : null)}
                  />
                  <Input
                    label="Taxa (%)"
                    type="number"
                    value={window.percentage}
                    onChange={(e) => updateCancelPolicy(index, 'percentage', parseFloat(e.target.value))}
                  />
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => removeCancelPolicyWindow(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button onClick={addCancelPolicyWindow}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Janela
            </Button>
          </div>
        </Card>

        {/* Vehicles Catalog */}
        <Card title="Catálogo de Veículos">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">{vehicle.name}</span>
                    {vehicle.blindado && (
                      <span className="ml-2 text-xs bg-gold-100 text-gold-800 px-2 py-1 rounded">
                        Blindado
                      </span>
                    )}
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => removeVehicle(vehicle.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-4 items-end">
              <Input
                label="Nome do Veículo"
                value={newVehicleName}
                onChange={(e) => setNewVehicleName(e.target.value)}
                placeholder="Ex: Sedan Executivo"
              />
              <Checkbox
                label="Blindado"
                checked={newVehicleBlindado}
                onChange={(e) => setNewVehicleBlindado(e.target.checked)}
              />
              <Button onClick={addVehicle}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>
        </Card>

        {/* Hour Packages */}
        <Card title="Pacotes de Horas">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {hourPackages.map((hours) => (
                <div key={hours} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                  <span className="font-medium">{hours}h</span>
                  <button
                    onClick={() => removeHourPackage(hours)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <Input
                label="Horas"
                type="number"
                value={newHourPackage}
                onChange={(e) => setNewHourPackage(e.target.value)}
                placeholder="Ex: 3"
              />
              <Button onClick={addHourPackage}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg">
            Salvar Configurações
          </Button>
        </div>
      </div>
    </div>
  );
}
