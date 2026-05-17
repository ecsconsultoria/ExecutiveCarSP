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
  PreOrdem,
  Operation,
  OperationAssignment,
  OperationEvent,
  FinancialEntry,
  OperationCost,
  SupplierPayment,
  RevenueEntry,
} from './models';

export class ExecutiveCarDB extends Dexie {
  settings!: Table<Settings, number>;
  clientes!: Table<Cliente, number>;
  fornecedores!: Table<Fornecedor, number>;
  tabela_precos!: Table<TabelaPreco, number>;
  ordens_servico!: Table<OrdemServico, number>;
  compromissos!: Table<Compromisso, number>;
  despesas!: Table<Despesa, number>;
  pagamentos_cliente!: Table<PagamentoCliente, number>;
  repasses_fornecedor!: Table<RepasseFornecedor, number>;
  anexos!: Table<Anexo, number>;
  pre_ordens!: Table<PreOrdem, number>;
  operations!: Table<Operation, number>;
  operation_assignments!: Table<OperationAssignment, number>;
  operation_events!: Table<OperationEvent, number>;
  financial_entries!: Table<FinancialEntry, number>;
  operation_costs!: Table<OperationCost, number>;
  supplier_payments!: Table<SupplierPayment, number>;
  revenue_entries!: Table<RevenueEntry, number>;

  constructor() {
    super('ExecutiveCarDB');
    
    // Version 1: Initial schema
    this.version(1).stores({
      settings: '++id',
      clientes: '++id, nome, documento',
      fornecedores: '++id, nome, tipo',
      tabela_precos: '++id, tipoServico, veiculoTipo, motoristaTipo',
      ordens_servico: '++id, clienteId, fornecedorId, status, createdAt',
      compromissos: '++id, ordemServicoId, dataHoraInicio',
      despesas: '++id, ordemServicoId, data',
      pagamentos_cliente: '++id, ordemServicoId, dataPagamento',
      repasses_fornecedor: '++id, ordemServicoId, fornecedorId, dataRepasse',
      anexos: '++id, ordemServicoId',
    });

    // Version 2: Phase 2 enhancements
    this.version(2).stores({
      settings: '++id',
      clientes: '++id, nome, documento',
      fornecedores: '++id, nome, tipo',
      tabela_precos: '++id, tipoServico, veiculoTipo, motoristaTipo',
      ordens_servico: '++id, clienteId, fornecedorId, status, createdAt',
      compromissos: '++id, ordemServicoId, dataHoraInicio',
      despesas: '++id, ordemServicoId, data, categoria',
      pagamentos_cliente: '++id, ordemServicoId, status, dataVencimento, dataPagamento',
      repasses_fornecedor: '++id, ordemServicoId, fornecedorId, status, dataVencimento, dataPagamento',
      anexos: '++id, ordemServicoId, despesaId',
      pre_ordens: '++id, status, createdAt',
    });

    // Version 3: Phase 4 foundation (operational ERP structure)
    this.version(3).stores({
      settings: '++id',
      clientes: '++id, nome, documento',
      fornecedores: '++id, nome, tipo',
      tabela_precos: '++id, tipoServico, veiculoTipo, motoristaTipo',
      ordens_servico: '++id, clienteId, fornecedorId, status, createdAt',
      compromissos: '++id, ordemServicoId, dataHoraInicio',
      despesas: '++id, ordemServicoId, data, categoria',
      pagamentos_cliente: '++id, ordemServicoId, status, dataVencimento, dataPagamento',
      repasses_fornecedor: '++id, ordemServicoId, fornecedorId, status, dataVencimento, dataPagamento',
      anexos: '++id, ordemServicoId, despesaId',
      pre_ordens: '++id, status, createdAt',
      operations: '++id, ordemServicoId, codigo, status, dataExecucao, createdAt',
      operation_assignments: '++id, operationId, assignmentType, referenceId, status',
      operation_events: '++id, operationId, eventType, eventAt',
      financial_entries: '++id, operationId, entryKind, status, dueDate, paidAt',
      operation_costs: '++id, operationId, categoria, data',
      supplier_payments: '++id, operationId, fornecedorId, status, dueDate, paidAt',
      revenue_entries: '++id, operationId, ordemServicoId, status, dueDate, receivedAt',
    });
  }
}

export const db = new ExecutiveCarDB();

// Initialize default settings if not exists
export async function initializeDefaultSettings() {
  const count = await db.settings.count();
  if (count === 0) {
    await db.settings.add({
      id: 1,
      moeda: 'BRL',
      timezone: 'America/Sao_Paulo',
      imposto: 10,
      cancelPolicy: [
        { minHours: 48, maxHours: null, percentage: 0 },
        { minHours: 24, maxHours: 48, percentage: 20 },
        { minHours: 0, maxHours: 24, percentage: 50 },
      ],
      vehiclesCatalog: [
        { id: 'sedan', name: 'Sedan', blindado: false },
        { id: 'suv', name: 'SUV', blindado: false },
        { id: 'minivan', name: 'Minivan', blindado: false },
        { id: 'van', name: 'Van', blindado: false },
        { id: 'micro-onibus', name: 'Micro Ônibus', blindado: false },
        { id: 'onibus', name: 'Ônibus', blindado: false },
      ],
      hourPackages: [3, 5, 8, 10, 12, 15],
      theme: 'gold',
      formUrl: '',
    });
  }
}
