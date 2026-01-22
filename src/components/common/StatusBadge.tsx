import type { StatusOS } from '../../db/models';

interface StatusBadgeProps {
  status: StatusOS;
}

const statusConfig = {
  reservado: { label: 'Reservado', className: 'bg-blue-100 text-blue-800' },
  em_andamento: { label: 'Em Andamento', className: 'bg-yellow-100 text-yellow-800' },
  concluido: { label: 'Concluído', className: 'bg-green-100 text-green-800' },
  cancelado: { label: 'Cancelado', className: 'bg-red-100 text-red-800' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
