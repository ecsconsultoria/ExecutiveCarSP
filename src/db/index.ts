import Dexie, { Table } from 'dexie';
import type {
  Settings,
  Cliente,
  Fornecedor,
  TabelaPreco,
  OrdemServico,
  Compromisso,
  Despesa,
  PagamentoCliente,
  RepasseFornecedor,
  Anexo,
} from './models';

export class ExecutiveCarDB extends Dexie {
  settings!: Table<Settings>;
  clientes!: Table<Cliente>;
  fornecedores!: Table<Fornecedor>;
  tabela_precos!: Table<TabelaPreco>;
  ordens_servico!: Table<OrdemServico>;
  compromissos!: Table<Compromisso>;
  despesas!: Table<Despesa>;
  pagamentos_cliente!: Table<PagamentoCliente>;
  repasses_fornecedor!: Table<RepasseFornecedor>;
  anexos!: Table<Anexo>;

  constructor() {
    super('ExecutiveCarDB');
    this.version(1).stores({
      settings: '++id',
      clientes: '++id, nome, documento, tipo',
      fornecedores: '++id, nome, tipo',
      tabela_precos: '++id, tipoServico, veiculoTipo, blindado, motoristaTipo, ativo',
      ordens_servico: '++id, numero, clienteId, status, fornecedorId, tipoServico',
      compromissos: '++id, ordemServicoId, dataHoraInicio, tipo',
      despesas: '++id, ordemServicoId, data, categoria',
      pagamentos_cliente: '++id, ordemServicoId, status, dataPagamento',
      repasses_fornecedor: '++id, ordemServicoId, fornecedorId, status',
      anexos: '++id, ordemServicoId',
    });
  }
}

export const db = new ExecutiveCarDB();

// Initialize default settings if not exists
export async function initializeSettings() {
  const count = await db.settings.count();
  if (count === 0) {
    await db.settings.add({
      moeda: 'BRL',
      timezone: 'America/Sao_Paulo',
      imposto: 10,
      cancelPolicy: [
        { horasAntes: 48, percentual: 0, descricao: '>48h' },
        { horasAntes: 24, percentual: 20, descricao: '24-48h' },
        { horasAntes: 0, percentual: 50, descricao: '<24h' },
      ],
      veiculosCatalogo: [
        { id: 'sedan', nome: 'Sedan', blindadoDisponivel: true, ativo: true },
        { id: 'suv', nome: 'SUV', blindadoDisponivel: true, ativo: true },
        { id: 'minivan', nome: 'Minivan', blindadoDisponivel: false, ativo: true },
        { id: 'van', nome: 'Van', blindadoDisponivel: false, ativo: true },
        { id: 'micro-onibus', nome: 'Micro Ônibus', blindadoDisponivel: false, ativo: true },
        { id: 'onibus', nome: 'Ônibus', blindadoDisponivel: false, ativo: true },
      ],
      pacotesHora: [3, 5, 8, 10, 12, 15],
      agendamentoFormUrl: '',
      theme: 'gold',
    });
  }
}
