import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Calendar, FileText, Users, Truck, DollarSign, Receipt, Settings, Database, BarChart3, ClipboardList, Menu, X } from 'lucide-react';

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
import { PreOrdens } from '../pages/PreOrdens';

const navigation = [
  { name: 'Dashboard', to: '/', icon: Home },
  { name: 'Agenda', to: '/agenda', icon: Calendar },
  { name: 'Ordens de Serviço', to: '/os', icon: FileText },
  { name: 'Pré-Ordens', to: '/pre-ordens', icon: ClipboardList },
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-gold-500 to-gold-600 shadow-lg sticky top-0 z-50">
        <div className="max-w-full mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 hover:bg-gold-400 rounded-lg transition-colors"
                aria-label="Menu"
              >
                {sidebarOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">ExecutiveCarSP</h1>
            </div>
            <span className="hidden sm:inline text-xs sm:text-sm text-white/80 text-right">CRM Transporte Executivo</span>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-0">
        {/* Sidebar - Mobile Drawer / Desktop Sidebar */}
        <aside className={`fixed md:relative w-64 bg-black-900 min-h-[calc(100vh-80px)] shadow-lg transform transition-transform duration-300 ease-in-out z-40 md:translate-x-0 md:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}> 
          <nav className="mt-5 px-2 space-y-1 overflow-y-auto max-h-[calc(100vh-120px)]">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to || 
                             (item.to !== '/' && location.pathname.startsWith(item.to));
              
              return (
                <Link
                  key={item.name}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center px-3 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-gold-500 text-white'
                      : 'text-gray-300 hover:bg-black-800 hover:text-white'
                  }`}
                >
                  <Icon className={`mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                  }`}/>
                  <span className="hidden sm:inline">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
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
          <Route path="/pre-ordens" element={<PreOrdens />} />
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