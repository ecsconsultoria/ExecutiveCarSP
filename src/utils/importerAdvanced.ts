// Phase 3: Advanced importer with presets and enhanced validation
import Papa from 'papaparse';
import type { PreOrdem, ImportPreset, ImportMapping, ImportValidation } from '../db/models';
import { db } from '../db';

export interface ImportResult {
  success: boolean;
  data?: PreOrdem[];
  errors?: string[];
  warnings?: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Validate data against preset validations
export function validateImportData(
  data: any[],
  validations: ImportValidation[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  data.forEach((row, index) => {
    validations.forEach(validation => {
      const value = row[validation.campo];

      // Check required fields
      if (validation.obrigatorio && (!value || value.toString().trim() === '')) {
        errors.push(`Linha ${index + 1}: campo obrigatório "${validation.campo}" está vazio`);
        return;
      }

      // Skip validation if field is not required and empty
      if (!value || value.toString().trim() === '') {
        return;
      }

      // Type validation
      switch (validation.tipo) {
        case 'numero':
          if (isNaN(Number(value))) {
            errors.push(`Linha ${index + 1}: campo "${validation.campo}" deve ser um número`);
          }
          break;
        case 'data': {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            errors.push(`Linha ${index + 1}: campo "${validation.campo}" não é uma data válida`);
          }
          break;
        }
        case 'booleano': {
          const normalized = value.toString().toLowerCase().trim();
          if (!['sim', 'nao', 'não', 'yes', 'no', 'true', 'false', '1', '0'].includes(normalized)) {
            warnings.push(`Linha ${index + 1}: campo "${validation.campo}" tem valor booleano não reconhecido: "${value}"`);
          }
          break;
        }
      }

      // Format validation
      if (validation.formatoEsperado && !new RegExp(validation.formatoEsperado).test(value.toString())) {
        warnings.push(`Linha ${index + 1}: campo "${validation.campo}" não corresponde ao formato esperado`);
      }
    });
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// Parse CSV file with preset
export async function parseCSVWithPreset(file: File, preset?: ImportPreset): Promise<ImportResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          resolve({
            success: false,
            errors: results.errors.map(e => e.message),
          });
          return;
        }

        try {
          // Validate data if preset has validations
          let validationResult: ValidationResult = { valid: true, errors: [], warnings: [] };
          if (preset && preset.validacoes.length > 0) {
            validationResult = validateImportData(results.data as any[], preset.validacoes);
          }

          if (!validationResult.valid) {
            resolve({
              success: false,
              errors: validationResult.errors,
              warnings: validationResult.warnings,
            });
            return;
          }

          const preOrdens = mapDataToPreOrdens(results.data as any[], preset?.mapeamento, 'csv');
          resolve({
            success: true,
            data: preOrdens,
            warnings: validationResult.warnings,
          });
        } catch (error) {
          resolve({
            success: false,
            errors: [error instanceof Error ? error.message : 'Erro ao processar dados'],
          });
        }
      },
      error: (error) => {
        resolve({
          success: false,
          errors: [error.message],
        });
      },
    });
  });
}

// Parse JSON file with preset
export async function parseJSONWithPreset(file: File, preset?: ImportPreset): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
        
        // Validate data if preset has validations
        let validationResult: ValidationResult = { valid: true, errors: [], warnings: [] };
        if (preset && preset.validacoes.length > 0) {
          validationResult = validateImportData(dataArray, preset.validacoes);
        }

        if (!validationResult.valid) {
          resolve({
            success: false,
            errors: validationResult.errors,
            warnings: validationResult.warnings,
          });
          return;
        }

        const preOrdens = mapDataToPreOrdens(dataArray, preset?.mapeamento, 'json');
        
        resolve({
          success: true,
          data: preOrdens,
          warnings: validationResult.warnings,
        });
      } catch (error) {
        resolve({
          success: false,
          errors: [error instanceof Error ? error.message : 'Erro ao processar JSON'],
        });
      }
    };
    
    reader.onerror = () => {
      resolve({
        success: false,
        errors: ['Erro ao ler arquivo'],
      });
    };
    
    reader.readAsText(file);
  });
}

// Map imported data to PreOrdem format with optional custom mapping
function mapDataToPreOrdens(data: any[], customMapping?: ImportMapping, importSource: 'csv' | 'json' = 'csv'): PreOrdem[] {
  return data.map((row, index) => {
    // Use custom mapping if provided, otherwise use default field names
    const getField = (standardField: string, customField?: string): any => {
      return customField ? row[customField] : row[standardField];
    };

    const clienteNome = getField('clienteNome', customMapping?.clienteNome);
    const origem = getField('origem', customMapping?.origem);
    const destino = getField('destino', customMapping?.destino);
    const dataHoraInicioStr = getField('dataHoraInicio', customMapping?.dataHoraInicio);

    // Validate required fields
    if (!clienteNome || !origem || !destino || !dataHoraInicioStr) {
      throw new Error(`Linha ${index + 1}: campos obrigatórios faltando (clienteNome, origem, destino, dataHoraInicio)`);
    }

    // Parse dates
    const dataHoraInicio = new Date(dataHoraInicioStr);
    if (isNaN(dataHoraInicio.getTime())) {
      throw new Error(`Linha ${index + 1}: data/hora de início inválida`);
    }

    let dataHoraFim: Date | null = null;
    const dataHoraFimStr = getField('dataHoraFim', customMapping?.dataHoraFim);
    if (dataHoraFimStr) {
      dataHoraFim = new Date(dataHoraFimStr);
      if (isNaN(dataHoraFim.getTime())) {
        dataHoraFim = null;
      }
    }

    // Parse service type
    const tipoServicoStr = getField('tipoServico', customMapping?.tipoServico);
    const tipoServico = normalizeTipoServico(tipoServicoStr);
    
    // Parse package hours
    let pacoteHoras: number | null = null;
    const pacoteHorasStr = getField('pacoteHoras', customMapping?.pacoteHoras);
    if (tipoServico === 'hora' && pacoteHorasStr) {
      pacoteHoras = parseInt(pacoteHorasStr, 10);
      if (isNaN(pacoteHoras)) {
        pacoteHoras = null;
      }
    }

    // Parse vehicle type
    const veiculoTipoStr = getField('veiculoTipo', customMapping?.veiculoTipo);
    const veiculoTipo = normalizeVeiculoTipo(veiculoTipoStr);
    
    // Parse blindado
    const blindadoStr = getField('blindado', customMapping?.blindado);
    const blindado = normalizeBoolean(blindadoStr);
    
    // Parse motorista tipo
    const motoristaTipoStr = getField('motoristaTipo', customMapping?.motoristaTipo);
    const motoristaTipo = normalizeMotorista(motoristaTipoStr);

    // Build contacts array
    const clienteTelefone = getField('clienteTelefone', customMapping?.clienteTelefone);
    const clienteEmail = getField('clienteEmail', customMapping?.clienteEmail);
    const contatos = [];
    if (clienteTelefone) {
      contatos.push({
        tipo: 'telefone' as const,
        valor: clienteTelefone,
        principal: true,
      });
    }
    if (clienteEmail) {
      contatos.push({
        tipo: 'email' as const,
        valor: clienteEmail,
        principal: !clienteTelefone,
      });
    }

    const observacoesStr = getField('observacoes', customMapping?.observacoes);

    return {
      clienteNome: clienteNome.toString().trim(),
      clienteContatos: contatos.length > 0 ? contatos : undefined,
      tipoServico,
      pacoteHoras,
      veiculoTipo,
      blindado,
      motoristaTipo,
      origem: origem.toString().trim(),
      destino: destino.toString().trim(),
      dataHoraInicio,
      dataHoraFim,
      observacoes: observacoesStr ? observacoesStr.toString() : '',
      importSource,
      status: 'pendente' as const,
      createdAt: new Date(),
    };
  });
}

// Save import preset
export async function saveImportPreset(preset: Omit<ImportPreset, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
  const now = new Date();
  const id = await db.import_presets.add({
    ...preset,
    createdAt: now,
    updatedAt: now,
  });
  return id;
}

// Update import preset
export async function updateImportPreset(id: number, preset: Partial<ImportPreset>): Promise<void> {
  await db.import_presets.update(id, {
    ...preset,
    updatedAt: new Date(),
  });
}

// Delete import preset
export async function deleteImportPreset(id: number): Promise<void> {
  await db.import_presets.delete(id);
}

// Get all import presets
export async function getImportPresets(): Promise<ImportPreset[]> {
  return db.import_presets.toArray();
}

// Get import preset by id
export async function getImportPreset(id: number): Promise<ImportPreset | undefined> {
  return db.import_presets.get(id);
}

// Normalize service type
function normalizeTipoServico(value: string): 'transfer' | 'hora' {
  if (!value) return 'transfer';
  const normalized = value.toLowerCase().trim();
  if (normalized.includes('hora') || normalized.includes('hour')) {
    return 'hora';
  }
  return 'transfer';
}

// Normalize vehicle type
function normalizeVeiculoTipo(value: string): string {
  if (!value) return 'sedan';
  const normalized = value.toLowerCase().trim();
  
  const mapping: Record<string, string> = {
    'sedan': 'sedan',
    'suv': 'suv',
    'minivan': 'minivan',
    'van': 'van',
    'micro': 'micro-onibus',
    'micro-onibus': 'micro-onibus',
    'microonibus': 'micro-onibus',
    'onibus': 'onibus',
    'ônibus': 'onibus',
    'bus': 'onibus',
  };

  for (const [key, val] of Object.entries(mapping)) {
    if (normalized.includes(key)) {
      return val;
    }
  }

  return 'sedan'; // Default
}

// Normalize boolean
function normalizeBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.toLowerCase().trim();
    return normalized === 'sim' || normalized === 'yes' || normalized === 'true' || normalized === '1';
  }
  return false;
}

// Normalize motorista type
function normalizeMotorista(value: string): 'bilingue' | 'mono' {
  if (!value) return 'mono';
  const normalized = value.toLowerCase().trim();
  if (normalized.includes('bilingue') || normalized.includes('bilingual')) {
    return 'bilingue';
  }
  return 'mono';
}

// Create default preset
export async function createDefaultPreset(): Promise<number> {
  const defaultPreset: Omit<ImportPreset, 'id' | 'createdAt' | 'updatedAt'> = {
    nome: 'Padrão',
    descricao: 'Preset padrão para importação de formulários',
    mapeamento: {
      clienteNome: 'clienteNome',
      clienteTelefone: 'clienteTelefone',
      clienteEmail: 'clienteEmail',
      tipoServico: 'tipoServico',
      pacoteHoras: 'pacoteHoras',
      veiculoTipo: 'veiculoTipo',
      blindado: 'blindado',
      motoristaTipo: 'motoristaTipo',
      origem: 'origem',
      destino: 'destino',
      dataHoraInicio: 'dataHoraInicio',
      dataHoraFim: 'dataHoraFim',
      observacoes: 'observacoes',
    },
    validacoes: [
      { campo: 'clienteNome', obrigatorio: true, tipo: 'texto' },
      { campo: 'origem', obrigatorio: true, tipo: 'texto' },
      { campo: 'destino', obrigatorio: true, tipo: 'texto' },
      { campo: 'dataHoraInicio', obrigatorio: true, tipo: 'data' },
      { campo: 'pacoteHoras', obrigatorio: false, tipo: 'numero' },
    ],
  };

  return saveImportPreset(defaultPreset);
}

// Export template CSV with custom mapping
export function downloadTemplateCSVWithMapping(mapping?: ImportMapping): void {
  const defaultMapping: ImportMapping = {
    clienteNome: 'clienteNome',
    clienteTelefone: 'clienteTelefone',
    clienteEmail: 'clienteEmail',
    tipoServico: 'tipoServico',
    pacoteHoras: 'pacoteHoras',
    veiculoTipo: 'veiculoTipo',
    blindado: 'blindado',
    motoristaTipo: 'motoristaTipo',
    origem: 'origem',
    destino: 'destino',
    dataHoraInicio: 'dataHoraInicio',
    dataHoraFim: 'dataHoraFim',
    observacoes: 'observacoes',
  };

  const finalMapping = mapping || defaultMapping;

  const template = Object.values(finalMapping).filter(v => v);

  const example = [
    'João Silva',
    '11999999999',
    'joao@example.com',
    'transfer',
    '',
    'sedan',
    'nao',
    'mono',
    'Aeroporto GRU',
    'Hotel Hilton - Av Paulista',
    '2024-02-01 10:00',
    '',
    'Cliente preferencial',
  ];

  const csv = Papa.unparse({
    fields: template,
    data: [example.slice(0, template.length)],
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'template-importacao.csv';
  link.click();
}
