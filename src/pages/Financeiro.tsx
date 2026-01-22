import React from 'react';
import { Card } from '../components/common/Card';
import { Wallet } from 'lucide-react';

export function Financeiro() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Financeiro</h1>

      <Card>
        <div className="flex flex-col items-center justify-center py-16">
          <Wallet size={64} className="text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Módulo Financeiro
          </h2>
          <p className="text-gray-500 text-center max-w-md">
            Gestão de pagamentos de clientes e repasses a fornecedores.
            Implementação completa planejada para fase futura.
          </p>
        </div>
      </Card>
    </div>
  );
}
