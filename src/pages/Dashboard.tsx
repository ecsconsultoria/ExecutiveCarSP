import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Users, Truck, FileText, Calendar } from 'lucide-react';

export function Dashboard() {
  const clientes = useLiveQuery(() => db.clientes.count());
  const fornecedores = useLiveQuery(() => db.fornecedores.count());
  const ordensServico = useLiveQuery(() => db.ordens_servico.count());
  const ordensAtivas = useLiveQuery(() =>
    db.ordens_servico.where('status').anyOf(['Reservado', 'EmAndamento']).count()
  );

  const stats = [
    { name: 'Clientes', value: clientes || 0, icon: Users, color: 'text-blue-600', link: '/clientes' },
    { name: 'Fornecedores', value: fornecedores || 0, icon: Truck, color: 'text-green-600', link: '/fornecedores' },
    { name: 'Ordens de Serviço', value: ordensServico || 0, icon: FileText, color: 'text-gold-600', link: '/os' },
    { name: 'Ordens Ativas', value: ordensAtivas || 0, icon: Calendar, color: 'text-purple-600', link: '/agenda' },
  ];

  return (
    <div className="w-full">
      <h1 className="text-2xl sm:text-3xl font-bold text-black-900 mb-6 sm:mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {stats.map((stat) => (
          <Link key={stat.name} to={stat.link}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{stat.name}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-black-900 mt-2">{stat.value}</p>
                </div>
                <stat.icon className={`h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 ${stat.color}`} />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card title="Ações Rápidas">
          <div className="space-y-2 sm:space-y-3">
            <Link
              to="/os/novo"
              className="block p-3 sm:p-4 bg-gold-50 hover:bg-gold-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-gold-600 mr-2 sm:mr-3 flex-shrink-0" />
                <div>
                  <p className="font-medium text-black-900 text-sm sm:text-base">Nova Ordem de Serviço</p>
                  <p className="text-xs sm:text-sm text-gray-600">Criar nova OS</p>
                </div>
              </div>
            </Link>
            <Link
              to="/clientes"
              className="block p-3 sm:p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
                <div>
                  <p className="font-medium text-black-900 text-sm sm:text-base">Gerenciar Clientes</p>
                  <p className="text-xs sm:text-sm text-gray-600">Ver e editar clientes</p>
                </div>
              </div>
            </Link>
            <Link
              to="/agenda"
              className="block p-3 sm:p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 mr-2 sm:mr-3 flex-shrink-0" />
                <div>
                  <p className="font-medium text-black-900 text-sm sm:text-base">Ver Agenda</p>
                  <p className="text-xs sm:text-sm text-gray-600">Calendário de serviços</p>
                </div>
              </div>
            </Link>
          </div>
        </Card>

        <Card title="Bem-vindo ao ExecutiveCarSP">
          <div className="space-y-3 sm:space-y-4">
            <p className="text-gray-700 text-sm sm:text-base">
              Sistema de gerenciamento para transporte executivo. Gerencie clientes, fornecedores,
              ordens de serviço e muito mais.
            </p>
            <div className="border-t pt-3 sm:pt-4">
              <h3 className="font-semibold text-black-900 mb-2 text-sm sm:text-base">Primeiros Passos:</h3>
              <ol className="list-decimal list-inside space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700">
                <li>Configure as definições em Configurações</li>
                <li>Cadastre seus clientes e fornecedores</li>
                <li>Defina a tabela de preços</li>
                <li>Comece a criar ordens de serviço</li>
              </ol>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}