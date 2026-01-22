import type { OrdemServico } from '../../db/models';

interface StatusBadgeProps {
  status: OrdemServico['status'];
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    Reservado: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Reservado' },
    EmAndamento: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Em Andamento' },
    Concluido: { bg: 'bg-green-100', text: 'text-green-800', label: 'Concluído' },
    Cancelado: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelado' },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}
