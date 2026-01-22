// PDF generation utilities using jsPDF
import jsPDF from 'jspdf';
import type { OrdemServico, Cliente, Fornecedor, Settings, PagamentoCliente } from '../db/models';
import { formatCurrency } from './currency';
import { formatDate, formatDateTime } from './date';

export interface OSConfirmationData {
  os: OrdemServico;
  cliente: Cliente;
  fornecedor?: Fornecedor;
  settings: Settings;
}

export interface ReceiptData {
  os: OrdemServico;
  cliente: Cliente;
  pagamento: PagamentoCliente;
  settings: Settings;
}

// Generate OS Confirmation PDF
export function generateOSConfirmationPDF(data: OSConfirmationData): void {
  const { os, cliente, fornecedor, settings } = data;
  const doc = new jsPDF();

  // Header
  doc.setFillColor(212, 175, 55); // Gold
  doc.rect(0, 0, 210, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('ExecutiveCarSP', 105, 15, { align: 'center' });
  doc.setFontSize(12);
  doc.text('Confirmação de Serviço', 105, 23, { align: 'center' });

  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // OS Info
  let y = 40;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`Ordem de Serviço #${os.id}`, 20, y);
  
  y += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Data de Criação: ${formatDate(os.createdAt)}`, 20, y);
  doc.text(`Status: ${os.status}`, 120, y);

  // Cliente Info
  y += 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Cliente', 20, y);
  
  y += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nome: ${cliente.nome}`, 20, y);
  y += 5;
  doc.text(`Documento: ${cliente.documento}`, 20, y);
  
  const principalContact = cliente.contatos.find(c => c.principal);
  if (principalContact) {
    y += 5;
    doc.text(`Contato: ${principalContact.valor} (${principalContact.tipo})`, 20, y);
  }

  // Serviço Info
  y += 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalhes do Serviço', 20, y);
  
  y += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Tipo: ${os.tipoServico === 'transfer' ? 'Transfer' : 'Por Hora'}`, 20, y);
  
  if (os.pacoteHoras) {
    y += 5;
    doc.text(`Pacote: ${os.pacoteHoras} horas`, 20, y);
  }
  
  y += 5;
  const vehicleName = settings.vehiclesCatalog.find(v => v.id === os.veiculoTipo)?.name || os.veiculoTipo;
  doc.text(`Veículo: ${vehicleName}${os.blindado ? ' (Blindado)' : ''}`, 20, y);
  
  y += 5;
  doc.text(`Motorista: ${os.motoristaTipo === 'bilingue' ? 'Bilíngue' : 'Monolíngue'}`, 20, y);

  // Roteiro
  if (os.roteiro.length > 0) {
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Roteiro', 20, y);
    doc.setFont('helvetica', 'normal');
    
    os.roteiro.forEach((trecho, idx) => {
      y += 5;
      doc.text(`${idx + 1}. ${trecho.origem} → ${trecho.destino}`, 25, y);
    });
  }

  // Agendamento
  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Agendamento', 20, y);
  doc.setFont('helvetica', 'normal');
  
  y += 5;
  doc.text(`Início: ${formatDateTime(os.agendamento.dataHoraInicio)}`, 20, y);
  
  if (os.agendamento.dataHoraFim) {
    y += 5;
    doc.text(`Término: ${formatDateTime(os.agendamento.dataHoraFim)}`, 20, y);
  }

  // Pricing
  y += 15;
  doc.setFont('helvetica', 'bold');
  doc.text('Valores', 20, y);
  
  y += 7;
  doc.setFont('helvetica', 'normal');
  
  if (os.pricingBreakdown) {
    doc.text(`Valor Base: ${formatCurrency(os.pricingBreakdown.valorBase)}`, 20, y);
    y += 5;
    
    if (os.pricingBreakdown.ajustes.length > 0) {
      doc.text('Ajustes:', 20, y);
      os.pricingBreakdown.ajustes.forEach(ajuste => {
        y += 5;
        const ajusteValor = ajuste.tipo === 'percentual' 
          ? `${ajuste.valor}%` 
          : formatCurrency(ajuste.valor);
        doc.text(`  - ${ajuste.descricao}: ${ajusteValor}`, 25, y);
      });
      y += 5;
      doc.text(`Subtotal: ${formatCurrency(os.pricingBreakdown.subtotal)}`, 20, y);
    }
    
    y += 5;
    doc.text(`Imposto (${settings.imposto}%): ${formatCurrency(os.pricingBreakdown.imposto)}`, 20, y);
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: ${formatCurrency(os.pricingBreakdown.total)}`, 20, y);
  } else {
    doc.text(`Valor Total: ${formatCurrency(os.precoClienteTotal)}`, 20, y);
    y += 5;
    doc.text(`Imposto Aplicado: ${formatCurrency(os.impostosAplicados)}`, 20, y);
  }

  // Cancellation Policy
  if (os.status !== 'Cancelado' && settings.cancelPolicy.length > 0) {
    y += 15;
    doc.setFont('helvetica', 'bold');
    doc.text('Política de Cancelamento', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    
    settings.cancelPolicy.forEach(policy => {
      y += 5;
      const hoursText = policy.maxHours 
        ? `${policy.minHours}-${policy.maxHours}h` 
        : `>${policy.minHours}h`;
      doc.text(`${hoursText} antes: ${policy.percentage}% de taxa`, 20, y);
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
    doc.text('Observações', 20, y);
    doc.setFont('helvetica', 'normal');
    y += 5;
    const splitNotes = doc.splitTextToSize(os.notas, 170);
    doc.text(splitNotes, 20, y);
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('ExecutiveCarSP - Transporte Executivo de Qualidade', 105, 285, { align: 'center' });

  // Download
  doc.save(`OS-${os.id}-Confirmacao.pdf`);
}

// Generate Receipt PDF
export function generateReceiptPDF(data: ReceiptData): void {
  const { os, cliente, pagamento, settings } = data;
  const doc = new jsPDF();

  // Header
  doc.setFillColor(212, 175, 55); // Gold
  doc.rect(0, 0, 210, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('ExecutiveCarSP', 105, 15, { align: 'center' });
  doc.setFontSize(12);
  doc.text('Recibo de Pagamento', 105, 23, { align: 'center' });

  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Receipt Info
  let y = 40;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`Recibo #${pagamento.id}`, 20, y);
  
  y += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Data de Emissão: ${formatDate(new Date())}`, 20, y);

  // Cliente Info
  y += 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Recebemos de:', 20, y);
  
  y += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(cliente.nome, 20, y);
  y += 5;
  doc.text(`CPF/CNPJ: ${cliente.documento}`, 20, y);

  // Valor
  y += 15;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Valor:', 20, y);
  doc.setFontSize(18);
  doc.text(formatCurrency(pagamento.valor), 50, y);

  // Pagamento Info
  y += 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalhes do Pagamento', 20, y);
  
  y += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  if (pagamento.formaPagamento) {
    doc.text(`Forma de Pagamento: ${pagamento.formaPagamento}`, 20, y);
    y += 5;
  }
  
  if (pagamento.dataPagamento) {
    doc.text(`Data do Pagamento: ${formatDate(pagamento.dataPagamento)}`, 20, y);
    y += 5;
  }
  
  doc.text(`Status: ${pagamento.status}`, 20, y);

  // OS Reference
  y += 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Referente ao Serviço', 20, y);
  
  y += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Ordem de Serviço: #${os.id}`, 20, y);
  y += 5;
  doc.text(`Tipo: ${os.tipoServico === 'transfer' ? 'Transfer' : 'Por Hora'}`, 20, y);
  y += 5;
  doc.text(`Data do Serviço: ${formatDate(os.agendamento.dataHoraInicio)}`, 20, y);

  // Observações
  if (pagamento.observacoes) {
    y += 15;
    doc.setFont('helvetica', 'bold');
    doc.text('Observações', 20, y);
    doc.setFont('helvetica', 'normal');
    y += 5;
    const splitObs = doc.splitTextToSize(pagamento.observacoes, 170);
    doc.text(splitObs, 20, y);
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('ExecutiveCarSP - Transporte Executivo de Qualidade', 105, 285, { align: 'center' });

  // Download
  doc.save(`Recibo-${pagamento.id}-OS-${os.id}.pdf`);
}
