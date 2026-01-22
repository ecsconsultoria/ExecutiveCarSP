import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { CancelPolicyWindow, VehicleType, PreOrdem } from '../db/models';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Checkbox } from '../components/forms/Input';
import { Trash2, Plus, Upload, Download, FileText, Info } from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { downloadTemplateCSV, parseCSV, parseJSON } from '../utils/importer';
import { Link } from 'react-router-dom';

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
  const [parsedPreOrdens, setParsedPreOrdens] = useState<PreOrdem[]>([]);
  const [importing, setImporting] = useState(false);
  const [pdfLogo, setPdfLogo] = useState('');
  const [pdfLanguage, setPdfLanguage] = useState<'pt-BR' | 'en' | 'es'>('pt-BR');
  const [googleSheetsEnabled, setGoogleSheetsEnabled] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    if (settings) {
      setImposto(settings.imposto);
      setFormUrl(settings.formUrl);
      setCancelPolicy(settings.cancelPolicy);
      setVehicles(settings.vehiclesCatalog);
      setHourPackages(settings.hourPackages);
      setPdfLogo(settings.pdfLogo || '');
      setPdfLanguage(settings.pdfLanguage || 'pt-BR');
      setGoogleSheetsEnabled(settings.googleSheetsEnabled || false);
      setWebhookUrl(settings.webhookUrl || '');
    }
  }, [settings]);

  const handleSave = async () => {
    await db.settings.update(1, {
      imposto,
      formUrl,
      cancelPolicy,
      vehiclesCatalog: vehicles,
      hourPackages,
      pdfLogo,
      pdfLanguage,
      googleSheetsEnabled,
      webhookUrl,
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsedPreOrdens([]);

    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      let result;

      if (fileExtension === 'csv') {
        result = await parseCSV(file);
      } else if (fileExtension === 'json') {
        result = await parseJSON(file);
      } else {
        showToast('error', 'Formato de arquivo não suportado. Use CSV ou JSON.');
        return;
      }

      if (result.success && result.data) {
        setParsedPreOrdens(result.data);
        showToast('success', `${result.data.length} registros prontos para importação`);
      } else {
        showToast('error', `Erro ao processar arquivo: ${result.errors?.join(', ')}`);
      }
    } catch (error) {
      showToast('error', 'Erro ao processar arquivo');
    }
  };

  const handleImport = async () => {
    if (parsedPreOrdens.length === 0) {
      showToast('warning', 'Nenhum registro para importar');
      return;
    }

    setImporting(true);
    try {
      await db.pre_ordens.bulkAdd(parsedPreOrdens);
      showToast('success', `${parsedPreOrdens.length} pré-ordens importadas com sucesso!`);
      setParsedPreOrdens([]);
    } catch (error) {
      showToast('error', 'Erro ao importar registros');
    } finally {
      setImporting(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'Por favor, selecione um arquivo de imagem');
      return;
    }

    const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSizeInBytes) {
      showToast('error', 'Imagem muito grande. Tamanho máximo: 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPdfLogo(reader.result as string);
    };
    reader.readAsDataURL(file);
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

        {/* PDF Settings */}
        <Card title="Configurações de PDF">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Idioma do PDF
                </label>
                <select
                  value={pdfLanguage}
                  onChange={(e) => setPdfLanguage(e.target.value as 'pt-BR' | 'en' | 'es')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500"
                >
                  <option value="pt-BR">Português (BR)</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </select>
              </div>
              <Input
                label="Número Sequencial Atual"
                type="number"
                value={settings.pdfNextSequentialNumber || 1}
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo para PDF
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gold-50 file:text-gold-700 hover:file:bg-gold-100"
              />
              {pdfLogo && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <img src={pdfLogo} alt="Logo Preview" className="max-h-24 object-contain" />
                </div>
              )}
            </div>
            <Checkbox
              label="Habilitar Integração com Google Sheets"
              checked={googleSheetsEnabled}
              onChange={(e) => setGoogleSheetsEnabled(e.target.checked)}
            />
            <Input
              label="URL do Webhook"
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://exemplo.com/webhook"
            />
          </div>
        </Card>

        {/* Form Importer */}
        <Card title="Importador de Formulários">
          <div className="space-y-6">
            {/* Template Download */}
            <div>
              <Button onClick={downloadTemplateCSV} variant="secondary">
                <Download className="h-4 w-4 mr-2" />
                Baixar Template CSV
              </Button>
            </div>

            {/* File Upload */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload de Arquivo (CSV ou JSON)
                </label>
                <input
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gold-50 file:text-gold-700 hover:file:bg-gold-100"
                />
              </div>

              {/* Preview */}
              {parsedPreOrdens.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">
                      Preview: {parsedPreOrdens.length} registro(s) encontrado(s)
                    </h3>
                    <Button onClick={handleImport} disabled={importing}>
                      <Upload className="h-4 w-4 mr-2" />
                      {importing ? 'Importando...' : 'Importar'}
                    </Button>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {parsedPreOrdens.slice(0, 5).map((preOrdem, idx) => (
                      <div key={idx} className="text-sm p-2 bg-white rounded border border-gray-200">
                        <div className="font-medium">{preOrdem.clienteNome}</div>
                        <div className="text-gray-600 text-xs">
                          {preOrdem.origem} → {preOrdem.destino} | {preOrdem.tipoServico} | {preOrdem.veiculoTipo}
                        </div>
                      </div>
                    ))}
                    {parsedPreOrdens.length > 5 && (
                      <div className="text-sm text-gray-500 text-center">
                        ... e mais {parsedPreOrdens.length - 5} registro(s)
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Link to view imported Pre-OS */}
            <div className="pt-4 border-t border-gray-200">
              <Link
                to="/pre-ordens"
                className="inline-flex items-center text-gold-600 hover:text-gold-700 font-medium"
              >
                <FileText className="h-4 w-4 mr-2" />
                Ver Pré-Ordens Importadas
              </Link>
            </div>

            {/* Google Sheets OAuth Stub */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Google Sheets OAuth (Em Breve)</h4>
                  <p className="text-sm text-blue-700">
                    Conecte sua conta Google para importar formulários diretamente do Google Sheets.
                    Esta funcionalidade estará disponível em breve.
                  </p>
                </div>
              </div>
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
