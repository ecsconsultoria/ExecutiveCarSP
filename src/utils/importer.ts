// CSV/JSON import utilities
import Papa from 'papaparse';
import type { PreOrdem } from '../db/models';

export interface ImportMapping {
  clienteNome: string;
  clienteTelefone?: string;
  clienteEmail?: string;
  tipoServico: string;
  pacoteHoras?: string;
  veiculoTipo: string;
  blindado?: string;
  motoristaTipo: string;
  origem: string;
  destino: string;
  dataHoraInicio: string;
  dataHoraFim?: string;
  observacoes?: string;
}

export interface ImportResult {
  success: boolean;
  data?: PreOrdem[];
  errors?: string[];
}

// Parse CSV file
export async function parseCSV(file: File): Promise<ImportResult> {
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
          const preOrdens = mapDataToPreOrdens(results.data as any[]);
          resolve({
            success: true,
            data: preOrdens,
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

// Parse JSON file
export async function parseJSON(file: File): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
        const preOrdens = mapDataToPreOrdens(dataArray);
        
        resolve({
          success: true,
          data: preOrdens,
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

// Map imported data to PreOrdem format
function mapDataToPreOrdens(data: any[]): PreOrdem[] {
  return data.map((row, index) => {
    // Validate required fields
    if (!row.clienteNome || !row.origem || !row.destino || !row.dataHoraInicio) {
      throw new Error(`Linha ${index + 1}: campos obrigatórios faltando (clienteNome, origem, destino, dataHoraInicio)`);
    }

    // Parse dates
    const dataHoraInicio = new Date(row.dataHoraInicio);
    if (isNaN(dataHoraInicio.getTime())) {
      throw new Error(`Linha ${index + 1}: data/hora de início inválida`);
    }

    let dataHoraFim: Date | null = null;
    if (row.dataHoraFim) {
      dataHoraFim = new Date(row.dataHoraFim);
      if (isNaN(dataHoraFim.getTime())) {
        dataHoraFim = null;
      }
    }

    // Parse service type
    const tipoServico = normalizeTipoServico(row.tipoServico);
    
    // Parse package hours
    let pacoteHoras: number | null = null;
    if (tipoServico === 'hora' && row.pacoteHoras) {
      pacoteHoras = parseInt(row.pacoteHoras, 10);
      if (isNaN(pacoteHoras)) {
        pacoteHoras = null;
      }
    }

    // Parse vehicle type
    const veiculoTipo = normalizeVeiculoTipo(row.veiculoTipo);
    
    // Parse blindado
    const blindado = normalizeBoolean(row.blindado);
    
    // Parse motorista tipo
    const motoristaTipo = normalizeMotorista(row.motoristaTipo);

    // Build contacts array
    const contatos = [];
    if (row.clienteTelefone) {
      contatos.push({
        tipo: 'telefone' as const,
        valor: row.clienteTelefone,
        principal: true,
      });
    }
    if (row.clienteEmail) {
      contatos.push({
        tipo: 'email' as const,
        valor: row.clienteEmail,
        principal: !row.clienteTelefone,
      });
    }

    return {
      clienteNome: row.clienteNome.trim(),
      clienteContatos: contatos.length > 0 ? contatos : undefined,
      tipoServico,
      pacoteHoras,
      veiculoTipo,
      blindado,
      motoristaTipo,
      origem: row.origem.trim(),
      destino: row.destino.trim(),
      dataHoraInicio,
      dataHoraFim,
      observacoes: row.observacoes || '',
      importSource: 'csv' as const,
      status: 'pendente' as const,
      createdAt: new Date(),
    };
  });
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

// Export template CSV
export function downloadTemplateCSV(): void {
  const template = [
    'clienteNome',
    'clienteTelefone',
    'clienteEmail',
    'tipoServico',
    'pacoteHoras',
    'veiculoTipo',
    'blindado',
    'motoristaTipo',
    'origem',
    'destino',
    'dataHoraInicio',
    'dataHoraFim',
    'observacoes',
  ];

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
    data: [example],
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'template-importacao.csv';
  link.click();
}
