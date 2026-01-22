import type { CancelPolicyWindow } from '../db/models';
import { getHoursDifference } from './date';

export function calcularTaxaCancelamento(
  policy: CancelPolicyWindow[],
  dataAgendamento: Date,
  dataCancelamento: Date,
  valorTotal: number
): { percentual: number; valor: number; janela: string } {
  const horasDiferenca = getHoursDifference(dataAgendamento, dataCancelamento);
  
  // Sort policy windows by horasAntes descending
  const sortedPolicy = [...policy].sort((a, b) => b.horasAntes - a.horasAntes);
  
  // Find the applicable window
  for (const window of sortedPolicy) {
    if (horasDiferenca >= window.horasAntes) {
      const valor = (valorTotal * window.percentual) / 100;
      return {
        percentual: window.percentual,
        valor,
        janela: window.descricao,
      };
    }
  }
  
  // Default to the last (most restrictive) window
  const defaultWindow = sortedPolicy[sortedPolicy.length - 1] || { percentual: 100, descricao: 'Imediato' };
  const valor = (valorTotal * defaultWindow.percentual) / 100;
  
  return {
    percentual: defaultWindow.percentual,
    valor,
    janela: defaultWindow.descricao,
  };
}
