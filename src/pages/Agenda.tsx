import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Calendar as CalendarIcon, ExternalLink, AlertTriangle, Clock, Car, User } from 'lucide-react';
import { db } from '../db';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import type { Compromisso, OrdemServico } from '../db/models';

export function Agenda() {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');

  const compromissos = useLiveQuery(() => db.compromissos.toArray(), []);
  const ordens = useLiveQuery(() => db.ordens_servico.toArray(), []);
  const clientes = useLiveQuery(() => db.clientes.toArray(), []);
  const fornecedores = useLiveQuery(() => db.fornecedores.toArray(), []);
  const settings = useLiveQuery(() => db.settings.get(1));

  const upcomingCompromissos = compromissos
    ?.filter((c) => new Date(c.dataHoraInicio) >= new Date())
    ?.sort((a, b) => a.dataHoraInicio.getTime() - b.dataHoraInicio.getTime())
    ?.slice(0, 20);

  const calculateDuration = (start: Date, end: Date): string => {
    const diffMs = new Date(end).getTime() - new Date(start).getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours === 0) {
      return `${minutes}min`;
    } else if (minutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${minutes}min`;
  };

  interface ConflictInfo {
    hasConflict: boolean;
    vehicleConflict: boolean;
    motoristaConflict: boolean;
    conflictingOSNumbers: number[];
  }

  const checkConflicts = (compromisso: Compromisso): ConflictInfo => {
    const result: ConflictInfo = {
      hasConflict: false,
      vehicleConflict: false,
      motoristaConflict: false,
      conflictingOSNumbers: [],
    };

    const currentOS = getOrdemServico(compromisso.ordemServicoId);
    if (!currentOS) return result;

    const conflicts = compromissos?.filter((c) => {
      if (c.id === compromisso.id) return false;
      
      const c1Start = new Date(compromisso.dataHoraInicio).getTime();
      const c1End = new Date(compromisso.dataHoraFim).getTime();
      const c2Start = new Date(c.dataHoraInicio).getTime();
      const c2End = new Date(c.dataHoraFim).getTime();
      
      const hasTimeOverlap = (
        (c1Start >= c2Start && c1Start < c2End) ||
        (c1End > c2Start && c1End <= c2End) ||
        (c1Start <= c2Start && c1End >= c2End)
      );

      if (!hasTimeOverlap) return false;

      const otherOS = getOrdemServico(c.ordemServicoId);
      if (!otherOS) return false;

      const sameVehicle = currentOS.veiculoTipo === otherOS.veiculoTipo && 
                          currentOS.blindado === otherOS.blindado;
      const sameMotorista = currentOS.motoristaTipo === otherOS.motoristaTipo &&
                            currentOS.terceirizacao === otherOS.terceirizacao &&
                            currentOS.fornecedorId === otherOS.fornecedorId;

      if (sameVehicle) {
        result.vehicleConflict = true;
      }
      if (sameMotorista) {
        result.motoristaConflict = true;
      }

      return sameVehicle || sameMotorista;
    });

    if (conflicts && conflicts.length > 0) {
      result.hasConflict = true;
      result.conflictingOSNumbers = conflicts
        .map((c) => c.ordemServicoId)
        .filter((id): id is number => id !== undefined);
    }
    
    return result;
  };

  const getOrdemServico = (osId: number) => {
    return ordens?.find((os) => os.id === osId);
  };

  const getCliente = (clienteId: number) => {
    return clientes?.find((c) => c.id === clienteId);
  };

  const getFornecedor = (fornecedorId: number | null) => {
    if (!fornecedorId) return null;
    return fornecedores?.find((f) => f.id === fornecedorId);
  };

  const getVehicleName = (os: OrdemServico) => {
    const vehicleType = settings?.vehiclesCatalog.find((v) => v.id === os.veiculoTipo);
    const blindadoText = os.blindado ? ' (Blindado)' : '';
    return vehicleType ? `${vehicleType.name}${blindadoText}` : 'N/A';
  };

  const getMotoristaType = (os: OrdemServico) => {
    return os.motoristaTipo === 'bilingue' ? 'Bilíngue' : 'Monolíngue';
  };

  const openFormUrl = () => {
    if (settings?.formUrl) {
      window.open(settings.formUrl, '_blank');
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-black-900">Agenda</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {settings?.formUrl && (
            <Button onClick={openFormUrl} variant="secondary" className="w-full sm:w-auto">
              <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Abrir Formulário
            </Button>
          )}
          <div className="flex rounded-md shadow-sm" role="group" aria-label="View mode">
            <button
              onClick={() => setViewMode('list')}
              role="button"
              aria-pressed={viewMode === 'list'}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-l-md border ${
                viewMode === 'list'
                  ? 'bg-gold-500 text-white border-gold-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Lista
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              role="button"
              aria-pressed={viewMode === 'calendar'}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-r-md border-t border-r border-b ${
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
          <div className="space-y-3 sm:space-y-4">
            {upcomingCompromissos?.map((compromisso) => {
              const os = getOrdemServico(compromisso.ordemServicoId);
              const cliente = os ? getCliente(os.clienteId) : null;
              const fornecedor = os ? getFornecedor(os.fornecedorId) : null;
              const conflictInfo = checkConflicts(compromisso);
              const duration = calculateDuration(compromisso.dataHoraInicio, compromisso.dataHoraFim);

              return (
                <div
                  key={compromisso.id}
                  className={`border rounded-lg p-3 sm:p-4 ${
                    conflictInfo.hasConflict ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                          {compromisso.titulo}
                        </h3>
                        {os && <StatusBadge status={os.status} />}
                        
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Clock className="h-3 w-3 mr-1" />
                          {duration}
                        </span>

                        {conflictInfo.hasConflict && (
                          <div className="flex items-center text-red-600 text-sm font-medium">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Conflito de Recursos
                          </div>
                        )}
                      </div>
                      
                      <div className="text-xs sm:text-sm text-gray-600 space-y-1">
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

                        {os && (
                          <div className="mt-2 sm:mt-3 flex flex-wrap gap-1 sm:gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Car className="h-3 w-3 mr-1" />
                              {getVehicleName(os)}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              <User className="h-3 w-3 mr-1" />
                              Motorista {getMotoristaType(os)}
                            </span>
                            {fornecedor && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                Terceirizado: {fornecedor.nome}
                              </span>
                            )}
                          </div>
                        )}

                        {conflictInfo.hasConflict && (
                          <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-800">
                            <div className="font-semibold mb-1">Conflito detectado:</div>
                            <ul className="list-disc list-inside space-y-0.5">
                              {conflictInfo.vehicleConflict && (
                                <li>Mesmo veículo em uso</li>
                              )}
                              {conflictInfo.motoristaConflict && (
                                <li>Mesmo motorista alocado</li>
                              )}
                            </ul>
                            <div className="mt-1">
                              <span className="font-semibold">OS em conflito:</span> #{conflictInfo.conflictingOSNumbers.join(', #')}
                            </div>
                          </div>
                        )}

                        {compromisso.descricao && (
                          <div className="mt-2">
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

      {upcomingCompromissos && upcomingCompromissos.some((c) => checkConflicts(c).hasConflict) && (
        <Card className="mt-6 border-red-300 bg-red-50">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">
                Atenção: Conflitos de Recursos Detectados
              </h3>
              <p className="text-sm text-red-700">
                Existem compromissos com recursos conflitantes (veículo ou motorista alocados simultaneamente).
                Verifique a agenda e ajuste os recursos ou horários conforme necessário.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
