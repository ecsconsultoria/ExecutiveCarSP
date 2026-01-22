// TypeScript interfaces and types for the CRM system

export interface Settings {
  id?: number;
  moeda: string; // 'BRL'
  timezone: string; // 'America/Sao_Paulo'
  imposto: number; // Default 10 (percentage)
  cancelPolicy: CancelPolicyWindow[];
  veiculosCatalogo: VeiculoTipo[];
  pacotesHora: number[]; // [3, 5, 8, 10, 12, 15]
  agendamentoFormUrl: string;
  theme: 'gold' | 'dark' | 'light';
}

export interface CancelPolicyWindow {
  horasAntes: number; // e.g., 48, 24
  percentual: number; // 0-100
  descricao: string; // e.g., ">48h", "24-48h", "<24h"
}

export interface VeiculoTipo {
  id: string;
  nome: string; // Sedan, SUV, Minivan, Van, Micro Ônibus, Ônibus
  blindadoDisponivel: boolean;
  ativo: boolean;
}

export interface Cliente {
  id?: number;
  tipo: 'pessoa_fisica' | 'pessoa_juridica';
  nome: string; // Nome ou Razão Social
  documento: string; // CPF ou CNPJ
  contatos: Contato[];
  endereco?: Endereco;
  observacoes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Contato {
  tipo: 'telefone' | 'email' | 'whatsapp';
  valor: string;
  principal?: boolean;
}

export interface Endereco {
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}

export interface Fornecedor {
  id?: number;
  nome: string;
  tipo: 'empresa' | 'autonomo';
  contatos: Contato[];
  motoristaTipo: 'bilingue' | 'monolingue';
  veiculosOfertados: string[]; // Array of VeiculoTipo IDs
  observacoes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TabelaPreco {
  id?: number;
  tipoServico: 'transfer' | 'hora';
  pacoteHoras?: number; // Required if tipoServico === 'hora'
  veiculoTipo: string; // VeiculoTipo ID
  blindado: boolean;
  motoristaTipo: 'bilingue' | 'monolingue';
  valorClienteBase: number;
  valorFornecedorBase: number;
  ajustes?: Ajuste[];
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ajuste {
  tipo: 'percentual' | 'fixo';
  descricao: string;
  valor: number; // Percentage or fixed value
}

export type StatusOS = 'reservado' | 'em_andamento' | 'concluido' | 'cancelado';

export interface OrdemServico {
  id?: number;
  numero: string; // Auto-generated OS number
  clienteId: number;
  tipoServico: 'transfer' | 'hora';
  pacoteHoras?: number;
  veiculoTipo: string;
  blindado: boolean;
  motoristaTipo: 'bilingue' | 'monolingue';
  terceirizacao: 'nenhum' | 'motorista' | 'motorista_carro';
  fornecedorId?: number;
  roteiro: Trecho[];
  agendamento: Agendamento;
  status: StatusOS;
  motivoCancelamento?: string;
  taxaCancelamento?: number;
  precoClienteTotal: number;
  precoFornecedor: number;
  impostosAplicados: number;
  usouTabelaPreco: boolean;
  tabelaPrecoId?: number;
  notas?: string;
  anexos?: number[]; // Array of Anexo IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface Trecho {
  ordem: number;
  origem: string;
  destino: string;
  distanciaKm?: number;
  observacoes?: string;
}

export interface Agendamento {
  tipo: 'transfer' | 'periodo'; // transfer = ida/volta, periodo = inicio/fim
  dataHoraInicio: Date;
  dataHoraFim?: Date;
  dataHoraIda?: Date;
  dataHoraVolta?: Date;
}

export interface Compromisso {
  id?: number;
  ordemServicoId: number;
  titulo: string;
  dataHoraInicio: Date;
  dataHoraFim: Date;
  tipo: 'servico' | 'bloqueio';
  createdAt: Date;
}

export interface Despesa {
  id?: number;
  descricao: string;
  categoria: string;
  valor: number;
  data: Date;
  ordemServicoId?: number;
  observacoes?: string;
  createdAt: Date;
}

export interface PagamentoCliente {
  id?: number;
  ordemServicoId: number;
  valor: number;
  dataPagamento: Date;
  formaPagamento: string;
  status: 'pendente' | 'recebido' | 'cancelado';
  observacoes?: string;
  createdAt: Date;
}

export interface RepasseFornecedor {
  id?: number;
  ordemServicoId: number;
  fornecedorId: number;
  valor: number;
  dataRepasse?: Date;
  status: 'pendente' | 'pago';
  observacoes?: string;
  createdAt: Date;
}

export interface Anexo {
  id?: number;
  ordemServicoId?: number;
  nome: string;
  tipo: string; // MIME type
  tamanho: number; // bytes
  url: string; // Data URL or blob URL
  createdAt: Date;
}
