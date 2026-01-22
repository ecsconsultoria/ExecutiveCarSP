import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Calendar, FileText, Users, Truck, DollarSign, Receipt, Settings, Database, BarChart3 } from 'lucide-react';

// Pages
import { Dashboard } from '../pages/Dashboard';
import { Agenda } from '../pages/Agenda';
import { OSList } from '../pages/OSList';
import { OSDetail } from '../pages/OSDetail';
import { OSWizard } from '../pages/OSWizard';
import { Clientes } from '../pages/Clientes';
import { Fornecedores } from '../pages/Fornecedores';
import { TabelaPrecos } from '../pages/TabelaPrecos';
import { Financeiro } from '../pages/Financeiro';
import { Despesas } from '../pages/Despesas';
import { Relatorios } from '../pages/Relatorios';
import { Configuracoes } from '../pages/Configuracoes';
import { Backup } from '../pages/Backup';

const navigation = [
  { name: 'Dashboard', to: '/', icon: Home },
  { name: 'Agenda', to: '/agenda', icon: Calendar },
  { name: 'Ordens de Serviço', to: '/os', icon: FileText },
  { name: 'Clientes', to: '/clientes', icon: Users },
  { name: 'Fornecedores', to: '/fornecedores', icon: Truck },
  { name: 'Tabela de Preços', to: '/precos', icon: DollarSign },
  { name: 'Despesas', to: '/despesas', icon: Receipt },
  { name: 'Financeiro', to: '/financeiro', icon: DollarSign },
  { name: 'Relatórios', to: '/relatorios', icon: BarChart3 },
  { name: 'Configurações', to: '/configuracoes', icon: Settings },
  { name: 'Backup', to: '/backup', icon: Database },
];

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-gold-500 to-gold-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-white">ExecutiveCarSP</h1>
              <span className="ml-3 text-sm text-white/80">CRM Transporte Executivo</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-black-900 min-h-[calc(100vh-88px)] shadow-lg">
          <nav className="mt-5 px-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to || 
                             (item.to !== '/' && location.pathname.startsWith(item.to));
              
              return (
                <Link
                  key={item.name}
                  to={item.to}
                  className={`group flex items-center px-3 py-3 text-sm font-medium rounded-md mb-1 transition-colors ${
                    isActive
                      ? 'bg-gold-500 text-white'
                      : 'text-gray-300 hover:bg-black-800 hover:text-white'
                  }`}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 ${
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/os" element={<OSList />} />
          <Route path="/os/novo" element={<OSWizard />} />
          <Route path="/os/:id" element={<OSDetail />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/fornecedores" element={<Fornecedores />} />
          <Route path="/precos" element={<TabelaPrecos />} />
          <Route path="/financeiro" element={<Financeiro />} />
          <Route path="/despesas" element={<Despesas />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/backup" element={<Backup />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
