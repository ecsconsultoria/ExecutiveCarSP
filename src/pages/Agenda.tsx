import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ExternalLink, Calendar as CalendarIcon } from 'lucide-react';
import { formatDateTime } from '../utils/date';

export function Agenda() {
  const settings = useLiveQuery(() => db.settings.toCollection().first());
  const compromissos = useLiveQuery(() => 
    db.compromissos.orderBy('dataHoraInicio').reverse().limit(20).toArray()
  ) || [];

  const openFormulario = () => {
    if (settings?.agendamentoFormUrl) {
      window.open(settings.agendamentoFormUrl, '_blank');
    } else {
      alert('Configure a URL do formulário de agendamento nas Configurações');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Agenda</h1>
        <Button onClick={openFormulario}>
          <ExternalLink size={20} className="mr-2" />
          Abrir Formulário de Agendamento
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View - Placeholder */}
        <div className="lg:col-span-2">
          <Card title="Calendário">
            <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <CalendarIcon size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">Visualização de Calendário</p>
                <p className="text-sm mt-2">Implementação completa em fase futura</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Upcoming Events */}
        <div>
          <Card title="Próximos Compromissos">
            <div className="space-y-3">
              {compromissos.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhum compromisso agendado
                </p>
              ) : (
                compromissos.map((compromisso) => (
                  <div
                    key={compromisso.id}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <h4 className="font-medium text-gray-900">{compromisso.titulo}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDateTime(compromisso.dataHoraInicio)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
