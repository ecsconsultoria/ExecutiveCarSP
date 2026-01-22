import { Receipt, BarChart3, FileText } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function Despesas() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black-900">Despesas</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Registro de Despesas">
          <div className="flex flex-col items-center justify-center py-8">
            <Receipt className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4 text-center">
              Cadastro e gerenciamento de despesas operacionais
            </p>
            <Button variant="ghost" disabled>
              Em desenvolvimento
            </Button>
          </div>
        </Card>

        <Card title="Relatórios de Despesas">
          <div className="flex flex-col items-center justify-center py-8">
            <BarChart3 className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4 text-center">
              Análise e relatórios de despesas por categoria e período
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
              <li>Cadastro de despesas vinculadas ou não a ordens de serviço</li>
              <li>Categorização de despesas (combustível, manutenção, pedágios, etc.)</li>
              <li>Upload de comprovantes e notas fiscais</li>
              <li>Relatórios de despesas por período, categoria e OS</li>
              <li>Controle de despesas fixas e variáveis</li>
              <li>Integração com centro de custos</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
