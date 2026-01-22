import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Calendar as CalendarIcon, ExternalLink, AlertTriangle } from 'lucide-react';
import { db } from '../db';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import type { Compromisso } from '../db/models';

export function Agenda() {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');

  const compromissos = useLiveQuery(() => db.compromissos.toArray(), []);
  const ordens = useLiveQuery(() => db.ordens_servico.toArray(), []);
  const clientes = useLiveQuery(() => db.clientes.toArray(), []);
  const settings = useLiveQuery(() => db.settings.get(1));

  const upcomingCompromissos = compromissos
    ?.filter((c) => new Date(c.dataHoraInicio) >= new Date())
    ?.sort((a, b) => a.dataHoraInicio.getTime() - b.dataHoraInicio.getTime())
    ?.slice(0, 20);

  const checkConflicts = (compromisso: Compromisso) => {
    const conflicts = compromissos?.filter((c) => {
      if (c.id === compromisso.id) return false;
      
      const c1Start = new Date(compromisso.dataHoraInicio).getTime();
      const c1End = new Date(compromisso.dataHoraFim).getTime();
      const c2Start = new Date(c.dataHoraInicio).getTime();
      const c2End = new Date(c.dataHoraFim).getTime();
      
      return (
        (c1Start >= c2Start && c1Start < c2End) ||
        (c1End > c2Start && c1End <= c2End) ||
        (c1Start <= c2Start && c1End >= c2End)
      );
    });
    
    return conflicts && conflicts.length > 0;
  };

  const getOrdemServico = (osId: number) => {
    return ordens?.find((os) => os.id === osId);
  };

  const getCliente = (clienteId: number) => {
    return clientes?.find((c) => c.id === clienteId);
  };

  const openFormUrl = () => {
    if (settings?.formUrl) {
      window.open(settings.formUrl, '_blank');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-black-900">Agenda</h1>
        <div className="flex gap-2">
          {settings?.formUrl && (
            <Button onClick={openFormUrl} variant="secondary">
              <ExternalLink className="h-5 w-5 mr-2" />
              Abrir Formulário
            </Button>
          )}
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                viewMode === 'list'
                  ? 'bg-gold-500 text-white border-gold-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Lista
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                viewMode === 'calendar'
                  ? 'bg-gold-500 text-white border-gold-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Calendário
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'calendar' && (
        <Card title="Calendário">
          <div className="flex items-center justify-center p-12 text-gray-500">
            <div className="text-center">
              <CalendarIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p>Visualização de calendário em desenvolvimento</p>
              <p className="text-sm mt-2">Use a visualização em lista por enquanto</p>
            </div>
          </div>
        </Card>
      )}

      {viewMode === 'list' && (
        <Card title="Próximos Compromissos">
          <div className="space-y-4">
            {upcomingCompromissos?.map((compromisso) => {
              const os = getOrdemServico(compromisso.ordemServicoId);
              const cliente = os ? getCliente(os.clienteId) : null;
              const hasConflict = checkConflicts(compromisso);

              return (
                <div
                  key={compromisso.id}
                  className={`border rounded-lg p-4 ${
                    hasConflict ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {compromisso.titulo}
                        </h3>
                        {os && <StatusBadge status={os.status} />}
                        {hasConflict && (
                          <div className="flex items-center text-red-600 text-sm">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Conflito
                          </div>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>
                          <span className="font-medium">Cliente:</span>{' '}
                          {cliente?.nome || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Início:</span>{' '}
                          {new Date(compromisso.dataHoraInicio).toLocaleString('pt-BR')}
                        </div>
                        <div>
                          <span className="font-medium">Fim:</span>{' '}
                          {new Date(compromisso.dataHoraFim).toLocaleString('pt-BR')}
                        </div>
                        {compromisso.descricao && (
                          <div>
                            <span className="font-medium">Descrição:</span>{' '}
                            {compromisso.descricao}
                          </div>
                        )}
                        {os && (
                          <div className="mt-2">
                            <a
                              href={`/os/${os.id}`}
                              className="text-gold-600 hover:text-gold-800 text-sm"
                            >
                              Ver OS #{os.id} →
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {upcomingCompromissos?.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <CalendarIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>Nenhum compromisso agendado</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {upcomingCompromissos && upcomingCompromissos.some(checkConflicts) && (
        <Card className="mt-6 border-red-300 bg-red-50">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">
                Atenção: Conflitos Detectados
              </h3>
              <p className="text-sm text-red-700">
                Existem compromissos com horários sobrepostos. Verifique a agenda e
                ajuste conforme necessário.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
