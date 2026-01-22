import { DollarSign, TrendingUp, FileText } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function Financeiro() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black-900">Financeiro</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="Pagamentos de Clientes">
          <div className="flex flex-col items-center justify-center py-8">
            <DollarSign className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4 text-center">
              Gerenciamento de pagamentos recebidos de clientes
            </p>
            <Button variant="ghost" disabled>
              Em desenvolvimento
            </Button>
          </div>
        </Card>

        <Card title="Repasses a Fornecedores">
          <div className="flex flex-col items-center justify-center py-8">
            <TrendingUp className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4 text-center">
              Controle de repasses realizados para fornecedores
            </p>
            <Button variant="ghost" disabled>
              Em desenvolvimento
            </Button>
          </div>
        </Card>

        <Card title="Relatórios Financeiros">
          <div className="flex flex-col items-center justify-center py-8">
            <FileText className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4 text-center">
              Relatórios e análises financeiras do período
            </p>
            <Button variant="ghost" disabled>
              Em desenvolvimento
            </Button>
          </div>
        </Card>
      </div>

      <Card className="mt-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-2">
          <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Funcionalidades Planejadas</h3>
            <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
              <li>Registro e controle de pagamentos recebidos de clientes</li>
              <li>Gestão de repasses realizados para fornecedores terceirizados</li>
              <li>Conciliação bancária e fluxo de caixa</li>
              <li>Relatórios de receitas, despesas e lucros</li>
              <li>Gráficos e dashboards financeiros</li>
              <li>Exportação de dados para contabilidade</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
