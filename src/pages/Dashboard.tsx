import React, { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Card } from '../components/common/Card';
import { FileText, Users, Truck, DollarSign, TrendingUp } from 'lucide-react';

export function Dashboard() {
  const clientes = useLiveQuery(() => db.clientes.count());
  const fornecedores = useLiveQuery(() => db.fornecedores.count());
  const ordensServico = useLiveQuery(() => db.ordens_servico.count());
  const ordensAbertas = useLiveQuery(() => 
    db.ordens_servico.where('status').anyOf(['reservado', 'em_andamento']).count()
  );

  const stats = [
    { 
      label: 'Clientes', 
      value: clientes || 0, 
      icon: Users, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-100' 
    },
    { 
      label: 'Fornecedores', 
      value: fornecedores || 0, 
      icon: Truck, 
      color: 'text-green-600',
      bgColor: 'bg-green-100' 
    },
    { 
      label: 'Ordens de Serviço', 
      value: ordensServico || 0, 
      icon: FileText, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-100' 
    },
    { 
      label: 'Ordens Ativas', 
      value: ordensAbertas || 0, 
      icon: TrendingUp, 
      color: 'text-gold-600',
      bgColor: 'bg-gold-100' 
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={stat.color} size={24} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Bem-vindo ao ExecutiveCarSP CRM">
          <p className="text-gray-600 mb-4">
            Sistema de gestão para transportes executivos. Este é um aplicativo PWA local-first 
            que armazena todos os dados no navegador usando IndexedDB.
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>✓ Gestão de clientes e fornecedores</li>
            <li>✓ Controle de ordens de serviço</li>
            <li>✓ Tabela de preços parametrizada</li>
            <li>✓ Agenda de compromissos</li>
            <li>✓ Controle financeiro</li>
            <li>✓ Backup e importação de dados</li>
          </ul>
        </Card>

        <Card title="Próximos Passos">
          <div className="space-y-3 text-sm text-gray-600">
            <p>1. Configure o sistema em <strong>Configurações</strong></p>
            <p>2. Cadastre seus <strong>Clientes</strong> e <strong>Fornecedores</strong></p>
            <p>3. Defina a <strong>Tabela de Preços</strong></p>
            <p>4. Comece a criar <strong>Ordens de Serviço</strong></p>
            <p>5. Acompanhe na <strong>Agenda</strong></p>
            <p className="mt-4 text-gold-600 font-medium">
              💡 Dica: Faça backups regulares dos seus dados!
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
