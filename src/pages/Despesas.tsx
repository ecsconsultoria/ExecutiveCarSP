import { Card } from '../components/common/Card';
import { Receipt } from 'lucide-react';

export function Despesas() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Despesas</h1>

      <Card>
        <div className="flex flex-col items-center justify-center py-16">
          <Receipt size={64} className="text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Controle de Despesas
          </h2>
          <p className="text-gray-500 text-center max-w-md">
            Gestão de despesas operacionais e custos diversos.
            Implementação completa planejada para fase futura.
          </p>
        </div>
      </Card>
    </div>
  );
}
