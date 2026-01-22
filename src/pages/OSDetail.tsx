import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { db } from '../db';
import type { OrdemServico } from '../db/models';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { TextArea } from '../components/forms/Input';

export function OSDetail() {
  const { id } = useParams<{ id: string }>();
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<OrdemServico['status']>('Reservado');
  const [motivoCancelamento, setMotivoCancelamento] = useState('');

  const os = useLiveQuery(() => db.ordens_servico.get(Number(id)), [id]);
  const cliente = useLiveQuery(
    () => (os ? db.clientes.get(os.clienteId) : undefined),
    [os]
  );
  const fornecedor = useLiveQuery(
    () => (os?.fornecedorId ? db.fornecedores.get(os.fornecedorId) : undefined),
    [os]
  );
  const settings = useLiveQuery(() => db.settings.get(1));

  if (!os) {
    return (
      <div className="p-6">
        <Card>
          <p className="text-center text-gray-500">Ordem de serviço não encontrada.</p>
        </Card>
      </div>
    );
  }

  const handleStatusChange = async () => {
    if (!os.id) return;

    const updates: Partial<OrdemServico> = {
      status: newStatus,
      updatedAt: new Date(),
    };

    if (newStatus === 'Cancelado') {
      const horasAntecedencia =
        (os.agendamento.dataHoraInicio.getTime() - Date.now()) / (1000 * 60 * 60);
      
      let taxaPercentual = 0;
      for (const policy of settings?.cancelPolicy || []) {
        if (
          horasAntecedencia >= policy.minHours &&
          (!policy.maxHours || horasAntecedencia < policy.maxHours)
        ) {
          taxaPercentual = policy.percentage;
          break;
        }
      }

      updates.motivoCancelamento = motivoCancelamento;
      updates.taxaCancelamento = (os.precoClienteTotal * taxaPercentual) / 100;
    }

    await db.ordens_servico.update(os.id, updates);
    setShowStatusModal(false);
  };

  const canChangeTo = (status: OrdemServico['status']) => {
    const currentStatus = os.status;
    
    if (currentStatus === 'Cancelado' || currentStatus === 'Concluido') return false;
    
    if (status === 'EmAndamento') return currentStatus === 'Reservado';
    if (status === 'Concluido') return currentStatus === 'EmAndamento';
    if (status === 'Cancelado') return true;
    
    return false;
  };

  const getVehicleName = (vehicleId: string) => {
    return settings?.vehiclesCatalog.find((v) => v.id === vehicleId)?.name || vehicleId;
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <Link to="/os">
          <Button variant="ghost">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-black-900">
          Ordem de Serviço #{os.id}
        </h1>
        <div className="ml-auto">
          <StatusBadge status={os.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Informações do Cliente">
          <div className="space-y-2">
            <div>
              <span className="font-medium">Nome:</span> {cliente?.nome || 'Carregando...'}
            </div>
            <div>
              <span className="font-medium">Documento:</span>{' '}
              {cliente?.documento || '-'}
            </div>
            {cliente?.contatos.find((c) => c.principal) && (
              <div>
                <span className="font-medium">Contato:</span>{' '}
                {cliente.contatos.find((c) => c.principal)?.valor || '-'}
              </div>
            )}
          </div>
        </Card>

        <Card title="Detalhes do Serviço">
          <div className="space-y-2">
            <div>
              <span className="font-medium">Tipo:</span>{' '}
              {os.tipoServico === 'transfer' ? 'Transfer' : `${os.pacoteHoras} horas`}
            </div>
            <div>
              <span className="font-medium">Veículo:</span> {getVehicleName(os.veiculoTipo)}
              {os.blindado && ' (Blindado)'}
            </div>
            <div>
              <span className="font-medium">Motorista:</span>{' '}
              {os.motoristaTipo === 'bilingue' ? 'Bilíngue' : 'Monolíngue'}
            </div>
            <div>
              <span className="font-medium">Terceirização:</span>{' '}
              {os.terceirizacao === 'nenhum'
                ? 'Nenhuma'
                : os.terceirizacao === 'motorista'
                ? 'Motorista'
                : 'Motorista + Carro'}
            </div>
          </div>
        </Card>

        <Card title="Agendamento">
          <div className="space-y-2">
            <div>
              <span className="font-medium">Data/Hora Início:</span>{' '}
              {new Date(os.agendamento.dataHoraInicio).toLocaleString('pt-BR')}
            </div>
            {os.agendamento.dataHoraFim && (
              <div>
                <span className="font-medium">Data/Hora Fim:</span>{' '}
                {new Date(os.agendamento.dataHoraFim).toLocaleString('pt-BR')}
              </div>
            )}
            {os.agendamento.dataHoraIda && (
              <div>
                <span className="font-medium">Ida:</span>{' '}
                {new Date(os.agendamento.dataHoraIda).toLocaleString('pt-BR')}
              </div>
            )}
            {os.agendamento.dataHoraVolta && (
              <div>
                <span className="font-medium">Volta:</span>{' '}
                {new Date(os.agendamento.dataHoraVolta).toLocaleString('pt-BR')}
              </div>
            )}
          </div>
        </Card>

        <Card title="Roteiro">
          {os.roteiro.map((trecho, index) => (
            <div key={index} className="mb-2 pb-2 border-b last:border-0">
              <div className="font-medium">Trecho {index + 1}</div>
              <div className="text-sm text-gray-600">
                De: {trecho.origem}
                <br />
                Para: {trecho.destino}
                {trecho.distancia && <br />}
                {trecho.distancia && `Distância: ${trecho.distancia} km`}
              </div>
            </div>
          ))}
          {os.roteiro.length === 0 && (
            <p className="text-gray-500">Nenhum trecho cadastrado</p>
          )}
        </Card>

        <Card title="Valores">
          <div className="space-y-2">
            <div>
              <span className="font-medium">Valor Cliente:</span> R${' '}
              {os.precoClienteTotal.toFixed(2)}
            </div>
            <div>
              <span className="font-medium">Valor Fornecedor:</span> R${' '}
              {os.precoFornecedor.toFixed(2)}
            </div>
            <div>
              <span className="font-medium">Impostos:</span>{' '}
              {os.impostosAplicados.toFixed(2)}%
            </div>
            {os.taxaCancelamento && (
              <div className="text-red-600">
                <span className="font-medium">Taxa de Cancelamento:</span> R${' '}
                {os.taxaCancelamento.toFixed(2)}
              </div>
            )}
          </div>
        </Card>

        {fornecedor && (
          <Card title="Fornecedor">
            <div className="space-y-2">
              <div>
                <span className="font-medium">Nome:</span> {fornecedor.nome}
              </div>
              <div>
                <span className="font-medium">Tipo:</span>{' '}
                {fornecedor.tipo === 'empresa' ? 'Empresa' : 'Autônomo'}
              </div>
            </div>
          </Card>
        )}

        {os.notas && (
          <Card title="Notas" className="md:col-span-2">
            <p className="whitespace-pre-wrap">{os.notas}</p>
          </Card>
        )}

        {os.motivoCancelamento && (
          <Card title="Motivo do Cancelamento" className="md:col-span-2">
            <p className="whitespace-pre-wrap text-red-600">{os.motivoCancelamento}</p>
          </Card>
        )}
      </div>

      <div className="mt-6 flex gap-4">
        {canChangeTo('EmAndamento') && (
          <Button
            onClick={() => {
              setNewStatus('EmAndamento');
              setShowStatusModal(true);
            }}
          >
            Iniciar Serviço
          </Button>
        )}
        {canChangeTo('Concluido') && (
          <Button
            onClick={() => {
              setNewStatus('Concluido');
              setShowStatusModal(true);
            }}
          >
            Concluir Serviço
          </Button>
        )}
        {canChangeTo('Cancelado') && (
          <Button
            variant="danger"
            onClick={() => {
              setNewStatus('Cancelado');
              setShowStatusModal(true);
            }}
          >
            Cancelar Serviço
          </Button>
        )}
      </div>

      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title={`Alterar Status para ${newStatus}`}
      >
        <div className="space-y-4">
          {newStatus === 'Cancelado' && (
            <>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                <h4 className="font-medium text-yellow-800 mb-2">
                  Política de Cancelamento
                </h4>
                {settings?.cancelPolicy.map((policy, index) => (
                  <div key={index} className="text-sm text-yellow-700">
                    {policy.minHours}h{policy.maxHours ? ` - ${policy.maxHours}h` : '+'}:{' '}
                    {policy.percentage}% de taxa
                  </div>
                ))}
              </div>
              <TextArea
                label="Motivo do Cancelamento"
                value={motivoCancelamento}
                onChange={(e) => setMotivoCancelamento(e.target.value)}
                rows={4}
                required
              />
            </>
          )}
          <p>Tem certeza que deseja alterar o status para {newStatus}?</p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowStatusModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleStatusChange}>Confirmar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
