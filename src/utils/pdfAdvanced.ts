// Phase 3: Advanced PDF generation with logo, sequential numbering, and multi-language support
import jsPDF from 'jspdf';
import type { OrdemServico, Cliente, Fornecedor, Settings, PagamentoCliente, RepasseFornecedor } from '../db/models';
import { formatCurrency } from './currency';
import { formatDate, formatDateTime } from './date';
import { db } from '../db';

// Multi-language support
const translations = {
  'pt-BR': {
    confirmationTitle: 'Confirmação de Serviço',
    receiptTitle: 'Recibo de Pagamento',
    extractTitle: 'Extrato Financeiro',
    orderNumber: 'Ordem de Serviço #',
    receiptNumber: 'Recibo #',
    creationDate: 'Data de Criação',
    status: 'Status',
    client: 'Cliente',
    name: 'Nome',
    document: 'Documento',
    contact: 'Contato',
    serviceDetails: 'Detalhes do Serviço',
    type: 'Tipo',
    transfer: 'Transfer',
    hourly: 'Por Hora',
    package: 'Pacote',
    hours: 'horas',
    vehicle: 'Veículo',
    armored: 'Blindado',
    driver: 'Motorista',
    bilingual: 'Bilíngue',
    monolingual: 'Monolíngue',
    route: 'Roteiro',
    schedule: 'Agendamento',
    start: 'Início',
    end: 'Término',
    values: 'Valores',
    baseValue: 'Valor Base',
    adjustments: 'Ajustes',
    subtotal: 'Subtotal',
    tax: 'Imposto',
    total: 'Total',
    totalValue: 'Valor Total',
    appliedTax: 'Imposto Aplicado',
    cancellationPolicy: 'Política de Cancelamento',
    before: 'antes',
    fee: 'de taxa',
    notes: 'Observações',
    footer: 'ExecutiveCarSP - Transporte Executivo de Qualidade',
    receivedFrom: 'Recebemos de',
    value: 'Valor',
    paymentDetails: 'Detalhes do Pagamento',
    paymentMethod: 'Forma de Pagamento',
    paymentDate: 'Data do Pagamento',
    referringTo: 'Referente ao Serviço',
    serviceDate: 'Data do Serviço',
    installment: 'Parcela',
    of: 'de',
    dueDate: 'Vencimento',
    interest: 'Juros',
    discount: 'Desconto',
  },
  'en': {
    confirmationTitle: 'Service Confirmation',
    receiptTitle: 'Payment Receipt',
    extractTitle: 'Financial Statement',
    orderNumber: 'Service Order #',
    receiptNumber: 'Receipt #',
    creationDate: 'Creation Date',
    status: 'Status',
    client: 'Client',
    name: 'Name',
    document: 'ID/Tax ID',
    contact: 'Contact',
    serviceDetails: 'Service Details',
    type: 'Type',
    transfer: 'Transfer',
    hourly: 'Hourly',
    package: 'Package',
    hours: 'hours',
    vehicle: 'Vehicle',
    armored: 'Armored',
    driver: 'Driver',
    bilingual: 'Bilingual',
    monolingual: 'Monolingual',
    route: 'Route',
    schedule: 'Schedule',
    start: 'Start',
    end: 'End',
    values: 'Values',
    baseValue: 'Base Value',
    adjustments: 'Adjustments',
    subtotal: 'Subtotal',
    tax: 'Tax',
    total: 'Total',
    totalValue: 'Total Value',
    appliedTax: 'Applied Tax',
    cancellationPolicy: 'Cancellation Policy',
    before: 'before',
    fee: 'fee',
    notes: 'Notes',
    footer: 'ExecutiveCarSP - Executive Transportation Quality',
    receivedFrom: 'Received from',
    value: 'Value',
    paymentDetails: 'Payment Details',
    paymentMethod: 'Payment Method',
    paymentDate: 'Payment Date',
    referringTo: 'Referring to Service',
    serviceDate: 'Service Date',
    installment: 'Installment',
    of: 'of',
    dueDate: 'Due Date',
    interest: 'Interest',
    discount: 'Discount',
  },
  'es': {
    confirmationTitle: 'Confirmación de Servicio',
    receiptTitle: 'Recibo de Pago',
    extractTitle: 'Estado Financiero',
    orderNumber: 'Orden de Servicio #',
    receiptNumber: 'Recibo #',
    creationDate: 'Fecha de Creación',
    status: 'Estado',
    client: 'Cliente',
    name: 'Nombre',
    document: 'Documento',
    contact: 'Contacto',
    serviceDetails: 'Detalles del Servicio',
    type: 'Tipo',
    transfer: 'Transfer',
    hourly: 'Por Hora',
    package: 'Paquete',
    hours: 'horas',
    vehicle: 'Vehículo',
    armored: 'Blindado',
    driver: 'Conductor',
    bilingual: 'Bilingüe',
    monolingual: 'Monolingüe',
    route: 'Ruta',
    schedule: 'Programación',
    start: 'Inicio',
    end: 'Fin',
    values: 'Valores',
    baseValue: 'Valor Base',
    adjustments: 'Ajustes',
    subtotal: 'Subtotal',
    tax: 'Impuesto',
    total: 'Total',
    totalValue: 'Valor Total',
    appliedTax: 'Impuesto Aplicado',
    cancellationPolicy: 'Política de Cancelación',
    before: 'antes',
    fee: 'de tarifa',
    notes: 'Observaciones',
    footer: 'ExecutiveCarSP - Transporte Ejecutivo de Calidad',
    receivedFrom: 'Recibimos de',
    value: 'Valor',
    paymentDetails: 'Detalles del Pago',
    paymentMethod: 'Forma de Pago',
    paymentDate: 'Fecha de Pago',
    referringTo: 'Referente al Servicio',
    serviceDate: 'Fecha del Servicio',
    installment: 'Cuota',
    of: 'de',
    dueDate: 'Vencimiento',
    interest: 'Interés',
    discount: 'Descuento',
  },
};

export interface AdvancedPDFData {
  os: OrdemServico;
  cliente: Cliente;
  fornecedor?: Fornecedor;
  pagamento?: PagamentoCliente;
  repasse?: RepasseFornecedor;
  settings: Settings;
  sequentialNumber?: number;
}

// Get next sequential number and update settings
async function getNextSequentialNumber(): Promise<number> {
  const settings = await db.settings.get(1);
  if (!settings) return 1;
  
  const currentNumber = settings.pdfNextSequentialNumber || 1;
  await db.settings.update(1, { pdfNextSequentialNumber: currentNumber + 1 });
  
  return currentNumber;
}

// Add logo to PDF if available
function addLogoIfAvailable(doc: jsPDF, settings: Settings, x: number, y: number, width: number, height: number): void {
  if (settings.pdfLogo) {
    try {
      doc.addImage(settings.pdfLogo, 'PNG', x, y, width, height);
    } catch (error) {
      console.warn('Could not add logo to PDF:', error);
    }
  }
}

// Generate header with logo and sequential number
function generatePDFHeader(
  doc: jsPDF,
  settings: Settings,
  title: string,
  sequentialNumber: number
): number {
  // Header background
  doc.setFillColor(212, 175, 55); // Gold
  doc.rect(0, 0, 210, 35, 'F');
  
  // Add logo if available
  if (settings.pdfLogo) {
    addLogoIfAvailable(doc, settings, 15, 8, 25, 20);
  }
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  const titleX = settings.pdfLogo ? 50 : 105;
  const titleAlign = settings.pdfLogo ? 'left' : 'center';
  doc.text('ExecutiveCarSP', titleX, 15, { align: titleAlign as any });
  
  doc.setFontSize(12);
  doc.text(title, titleX, 23, { align: titleAlign as any });
  
  // Sequential number
  doc.setFontSize(10);
  doc.text(`#${sequentialNumber.toString().padStart(6, '0')}`, 190, 20, { align: 'right' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  return 45; // Return Y position after header
}

// Generate footer
function generatePDFFooter(doc: jsPDF, settings: Settings, pageNumber: number = 1): void {
  const lang = settings.pdfLanguage || 'pt-BR';
  const t = translations[lang];
  
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(t.footer, 105, 285, { align: 'center' });
  doc.text(`Pág. ${pageNumber}`, 190, 285, { align: 'right' });
}

// Generate OS Confirmation PDF with advanced features
export async function generateAdvancedOSConfirmationPDF(data: AdvancedPDFData): Promise<void> {
  const { os, cliente, settings } = data;
  const lang = settings.pdfLanguage || 'pt-BR';
  const t = translations[lang];
  
  const doc = new jsPDF();
  const sequentialNumber = data.sequentialNumber || await getNextSequentialNumber();
  
  // Header
  let y = generatePDFHeader(doc, settings, t.confirmationTitle, sequentialNumber);
  
  // OS Info
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`${t.orderNumber}${os.id}`, 20, y);
  
  y += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${t.creationDate}: ${formatDate(os.createdAt)}`, 20, y);
  doc.text(`${t.status}: ${os.status}`, 120, y);

  // Cliente Info
  y += 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(t.client, 20, y);
  
  y += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${t.name}: ${cliente.nome}`, 20, y);
  y += 5;
  doc.text(`${t.document}: ${cliente.documento}`, 20, y);
  
  const principalContact = cliente.contatos.find(c => c.principal);
  if (principalContact) {
    y += 5;
    doc.text(`${t.contact}: ${principalContact.valor} (${principalContact.tipo})`, 20, y);
  }

  // Serviço Info
  y += 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(t.serviceDetails, 20, y);
  
  y += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${t.type}: ${os.tipoServico === 'transfer' ? t.transfer : t.hourly}`, 20, y);
  
  if (os.pacoteHoras) {
    y += 5;
    doc.text(`${t.package}: ${os.pacoteHoras} ${t.hours}`, 20, y);
  }
  
  y += 5;
  const vehicleName = settings.vehiclesCatalog.find(v => v.id === os.veiculoTipo)?.name || os.veiculoTipo;
  doc.text(`${t.vehicle}: ${vehicleName}${os.blindado ? ` (${t.armored})` : ''}`, 20, y);
  
  y += 5;
  doc.text(`${t.driver}: ${os.motoristaTipo === 'bilingue' ? t.bilingual : t.monolingual}`, 20, y);

  // Roteiro
  if (os.roteiro.length > 0) {
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text(t.route, 20, y);
    doc.setFont('helvetica', 'normal');
    
    os.roteiro.forEach((trecho, idx) => {
      y += 5;
      doc.text(`${idx + 1}. ${trecho.origem} → ${trecho.destino}`, 25, y);
    });
  }

  // Agendamento
  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.text(t.schedule, 20, y);
  doc.setFont('helvetica', 'normal');
  
  y += 5;
  doc.text(`${t.start}: ${formatDateTime(os.agendamento.dataHoraInicio)}`, 20, y);
  
  if (os.agendamento.dataHoraFim) {
    y += 5;
    doc.text(`${t.end}: ${formatDateTime(os.agendamento.dataHoraFim)}`, 20, y);
  }

  // Pricing
  y += 15;
  doc.setFont('helvetica', 'bold');
  doc.text(t.values, 20, y);
  
  y += 7;
  doc.setFont('helvetica', 'normal');
  
  if (os.pricingBreakdown) {
    doc.text(`${t.baseValue}: ${formatCurrency(os.pricingBreakdown.valorBase)}`, 20, y);
    y += 5;
    
    if (os.pricingBreakdown.ajustes.length > 0) {
      doc.text(`${t.adjustments}:`, 20, y);
      os.pricingBreakdown.ajustes.forEach(ajuste => {
        y += 5;
        const ajusteValor = ajuste.tipo === 'percentual' 
          ? `${ajuste.valor}%` 
          : formatCurrency(ajuste.valor);
        doc.text(`  - ${ajuste.descricao}: ${ajusteValor}`, 25, y);
      });
      y += 5;
      doc.text(`${t.subtotal}: ${formatCurrency(os.pricingBreakdown.subtotal)}`, 20, y);
    }
    
    y += 5;
    doc.text(`${t.tax} (${settings.imposto}%): ${formatCurrency(os.pricingBreakdown.imposto)}`, 20, y);
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text(`${t.total}: ${formatCurrency(os.pricingBreakdown.total)}`, 20, y);
  } else {
    doc.text(`${t.totalValue}: ${formatCurrency(os.precoClienteTotal)}`, 20, y);
    y += 5;
    doc.text(`${t.appliedTax}: ${formatCurrency(os.impostosAplicados)}`, 20, y);
  }

  // Cancellation Policy
  if (os.status !== 'Cancelado' && settings.cancelPolicy.length > 0) {
    y += 15;
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.text(t.cancellationPolicy, 20, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    
    settings.cancelPolicy.forEach(policy => {
      y += 5;
      const hoursText = policy.maxHours 
        ? `${policy.minHours}-${policy.maxHours}h` 
        : `>${policy.minHours}h`;
      doc.text(`${hoursText} ${t.before}: ${policy.percentage}% ${t.fee}`, 20, y);
    });
    doc.setFontSize(10);
  }

  // Notes
  if (os.notas) {
    y += 15;
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.text(t.notes, 20, y);
    doc.setFont('helvetica', 'normal');
    y += 5;
    const splitNotes = doc.splitTextToSize(os.notas, 170);
    doc.text(splitNotes, 20, y);
  }

  // Footer
  generatePDFFooter(doc, settings);

  // Download
  doc.save(`OS-${os.id}-Confirmacao-${sequentialNumber}.pdf`);
}

// Generate Receipt PDF with advanced features
export async function generateAdvancedReceiptPDF(data: AdvancedPDFData): Promise<void> {
  const { os, cliente, pagamento, settings } = data;
  if (!pagamento) return;
  
  const lang = settings.pdfLanguage || 'pt-BR';
  const t = translations[lang];
  
  const doc = new jsPDF();
  const sequentialNumber = data.sequentialNumber || await getNextSequentialNumber();
  
  // Header
  let y = generatePDFHeader(doc, settings, t.receiptTitle, sequentialNumber);
  
  // Receipt Info
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`${t.receiptNumber}${pagamento.id}`, 20, y);
  
  y += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${t.creationDate}: ${formatDate(new Date())}`, 20, y);

  // Cliente Info
  y += 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`${t.receivedFrom}:`, 20, y);
  
  y += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(cliente.nome, 20, y);
  y += 5;
  doc.text(`${t.document}: ${cliente.documento}`, 20, y);

  // Valor
  y += 15;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`${t.value}:`, 20, y);
  doc.setFontSize(18);
  doc.text(formatCurrency(pagamento.valor), 50, y);

  // Installments if any
  if (pagamento.parcelas && pagamento.parcelas.length > 0) {
    y += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`${t.installment}s:`, 20, y);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    pagamento.parcelas.forEach((parcela, idx) => {
      y += 7;
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      
      const parcelaText = `${idx + 1}/${pagamento.parcelas!.length}`;
      const valorText = formatCurrency(parcela.valor);
      const vencimentoText = formatDate(parcela.dataVencimento);
      
      doc.text(`${t.installment} ${parcelaText}: ${valorText} - ${t.dueDate}: ${vencimentoText}`, 25, y);
      
      if (parcela.juros && parcela.juros > 0) {
        y += 5;
        doc.text(`  ${t.interest}: ${formatCurrency(parcela.juros)}`, 30, y);
      }
      
      if (parcela.desconto && parcela.desconto > 0) {
        y += 5;
        doc.text(`  ${t.discount}: ${formatCurrency(parcela.desconto)}`, 30, y);
      }
    });
  }

  // Pagamento Info
  y += 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(t.paymentDetails, 20, y);
  
  y += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  if (pagamento.formaPagamento) {
    doc.text(`${t.paymentMethod}: ${pagamento.formaPagamento}`, 20, y);
    y += 5;
  }
  
  if (pagamento.dataPagamento) {
    doc.text(`${t.paymentDate}: ${formatDate(pagamento.dataPagamento)}`, 20, y);
    y += 5;
  }
  
  doc.text(`${t.status}: ${pagamento.status}`, 20, y);

  // OS Reference
  y += 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(t.referringTo, 20, y);
  
  y += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${t.orderNumber}${os.id}`, 20, y);
  y += 5;
  doc.text(`${t.type}: ${os.tipoServico === 'transfer' ? t.transfer : t.hourly}`, 20, y);
  y += 5;
  doc.text(`${t.serviceDate}: ${formatDate(os.agendamento.dataHoraInicio)}`, 20, y);

  // Observações
  if (pagamento.observacoes) {
    y += 15;
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.text(t.notes, 20, y);
    doc.setFont('helvetica', 'normal');
    y += 5;
    const splitObs = doc.splitTextToSize(pagamento.observacoes, 170);
    doc.text(splitObs, 20, y);
  }

  // Footer
  generatePDFFooter(doc, settings);

  // Download
  doc.save(`Recibo-${pagamento.id}-OS-${os.id}-${sequentialNumber}.pdf`);
}

// Generate Financial Extract PDF
export async function generateFinancialExtractPDF(
  payments: PagamentoCliente[],
  transfers: RepasseFornecedor[],
  settings: Settings,
  filterDescription: string
): Promise<void> {
  const lang = settings.pdfLanguage || 'pt-BR';
  const t = translations[lang];
  
  const doc = new jsPDF();
  const sequentialNumber = await getNextSequentialNumber();
  
  // Header
  let y = generatePDFHeader(doc, settings, t.extractTitle, sequentialNumber);
  
  // Filter description
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(filterDescription, 20, y);
  y += 10;
  
  // Payments section
  if (payments.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Recebimentos', 20, y);
    y += 7;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    let totalReceived = 0;
    payments.forEach(p => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      const statusIcon = p.status === 'Pago' ? '✓' : '○';
      const text = `${statusIcon} OS #${p.ordemServicoId} - ${formatDate(p.dataVencimento)} - ${formatCurrency(p.valor)}`;
      doc.text(text, 25, y);
      y += 5;
      
      if (p.status === 'Pago' && p.dataPagamento) {
        totalReceived += p.valor;
      }
    });
    
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Recebido: ${formatCurrency(totalReceived)}`, 25, y);
    y += 10;
  }
  
  // Transfers section
  if (transfers.length > 0) {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Repasses', 20, y);
    y += 7;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    let totalPaid = 0;
    transfers.forEach(r => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      const statusIcon = r.status === 'Pago' ? '✓' : '○';
      const text = `${statusIcon} OS #${r.ordemServicoId} - ${formatDate(r.dataVencimento)} - ${formatCurrency(r.valor)}`;
      doc.text(text, 25, y);
      y += 5;
      
      if (r.status === 'Pago' && r.dataPagamento) {
        totalPaid += r.valor;
      }
    });
    
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Pago: ${formatCurrency(totalPaid)}`, 25, y);
  }
  
  // Footer
  generatePDFFooter(doc, settings);
  
  // Download
  doc.save(`Extrato-${sequentialNumber}.pdf`);
}
