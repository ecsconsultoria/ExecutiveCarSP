// Database models and TypeScript interfaces

export interface Settings {
  id: number;
  moeda: string;
  timezone: string;
  imposto: number; // Default 10%
  cancelPolicy: CancelPolicyWindow[];
  vehiclesCatalog: VehicleType[];
  hourPackages: number[];
  theme: string;
  formUrl: string;
}

export interface CancelPolicyWindow {
  minHours: number;
  maxHours: number | null;
  percentage: number;
}

export interface VehicleType {
  id: string;
  name: string;
  blindado: boolean;
}

export interface Cliente {
  id?: number;
  nome: string;
  documento: string; // CPF or CNPJ
  contatos: Contato[];
  endereco: Endereco;
  observacoes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Contato {
  tipo: 'telefone' | 'email' | 'whatsapp';
  valor: string;
  principal: boolean;
}

export interface Endereco {
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface Fornecedor {
  id?: number;
  nome: string;
  tipo: 'empresa' | 'autonomo';
  contatos: Contato[];
  motoristaTipo: 'bilingue' | 'mono';
  veiculosOfertados: string[]; // Vehicle type IDs
  observacoes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TabelaPreco {
  id?: number;
  tipoServico: 'transfer' | 'hora';
  pacoteHoras: number | null; // Null for transfer
  veiculoTipo: string;
  blindado: boolean;
  motoristaTipo: 'bilingue' | 'mono';
  valorClienteBase: number;
  valorFornecedorBase: number;
  ajustes: Ajuste[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Ajuste {
  tipo: 'percentual' | 'fixo';
  valor: number;
  descricao: string;
}

export interface OrdemServico {
  id?: number;
  clienteId: number;
  tipoServico: 'transfer' | 'hora';
  pacoteHoras: number | null;
  veiculoTipo: string;
  blindado: boolean;
  motoristaTipo: 'bilingue' | 'mono';
  terceirizacao: 'nenhum' | 'motorista' | 'motorista_carro';
  fornecedorId: number | null;
  roteiro: Trecho[];
  agendamento: Agendamento;
  status: 'Reservado' | 'EmAndamento' | 'Concluido' | 'Cancelado';
  motivoCancelamento: string | null;
  taxaCancelamento: number | null;
  precoClienteTotal: number;
  precoFornecedor: number;
  impostosAplicados: number;
  pricingBreakdown?: PricingBreakdown; // Phase 2: Detailed pricing calculation
  notas: string;
  anexos: number[]; // Anexo IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface PricingBreakdown {
  valorBase: number;
  ajustes: Ajuste[];
  subtotal: number;
  imposto: number;
  total: number;
}

export interface Trecho {
  origem: string;
  destino: string;
  distancia: number | null;
  duracao: number | null;
}

export interface Agendamento {
  tipo: 'transfer' | 'hora';
  dataHoraInicio: Date;
  dataHoraFim: Date | null;
  dataHoraIda: Date | null;
  dataHoraVolta: Date | null;
}

export interface Compromisso {
  id?: number;
  ordemServicoId: number;
  dataHoraInicio: Date;
  dataHoraFim: Date;
  titulo: string;
  descricao: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Despesa {
  id?: number;
  ordemServicoId: number | null;
  descricao: string;
  categoria: 'combustivel' | 'pedagio' | 'alimentacao' | 'outros' | 'impostos';
  valor: number;
  data: Date;
  notas?: string;
  anexoId?: number; // Reference to uploaded receipt
  createdAt: Date;
  updatedAt: Date;
}

export interface PagamentoCliente {
  id?: number;
  ordemServicoId: number;
  valor: number;
  dataVencimento: Date;
  dataPagamento: Date | null;
  status: 'AReceber' | 'Pago' | 'Vencido' | 'Cancelado';
  formaPagamento: 'PIX' | 'Cartao' | 'Boleto' | 'Transferencia' | null;
  observacoes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RepasseFornecedor {
  id?: number;
  ordemServicoId: number;
  fornecedorId: number;
  valor: number;
  dataVencimento: Date;
  dataPagamento: Date | null;
  status: 'AFaturar' | 'Faturado' | 'Pago';
  formaPagamento: 'PIX' | 'Cartao' | 'Boleto' | 'Transferencia' | null;
  observacoes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Anexo {
  id?: number;
  ordemServicoId: number | null;
  despesaId?: number | null;
  nome: string;
  tipo: string;
  tamanho: number;
  url: string; // Base64 or blob URL
  createdAt: Date;
}

// Phase 2: Pre-OS for form importer
export interface PreOrdem {
  id?: number;
  clienteNome: string;
  clienteContatos?: Contato[];
  tipoServico: 'transfer' | 'hora';
  pacoteHoras: number | null;
  veiculoTipo: string;
  blindado: boolean;
  motoristaTipo: 'bilingue' | 'mono';
  origem: string;
  destino: string;
  dataHoraInicio: Date;
  dataHoraFim?: Date | null;
  observacoes: string;
  importSource: 'csv' | 'json' | 'sheets';
  status: 'pendente' | 'convertido' | 'rejeitado';
  createdAt: Date;
  convertedOSId?: number | null;
}
