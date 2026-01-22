import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  Users, 
  Truck, 
  DollarSign, 
  Receipt, 
  Wallet,
  Settings,
  Database
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/agenda', icon: Calendar, label: 'Agenda' },
  { path: '/ordens-servico', icon: FileText, label: 'Ordens de Serviço' },
  { path: '/clientes', icon: Users, label: 'Clientes' },
  { path: '/fornecedores', icon: Truck, label: 'Fornecedores' },
  { path: '/tabela-precos', icon: DollarSign, label: 'Tabela de Preços' },
  { path: '/despesas', icon: Receipt, label: 'Despesas' },
  { path: '/financeiro', icon: Wallet, label: 'Financeiro' },
  { path: '/configuracoes', icon: Settings, label: 'Configurações' },
  { path: '/backup', icon: Database, label: 'Backup' },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-64 bg-black text-white shadow-lg">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-gold-500">ExecutiveCarSP</h1>
          <p className="text-sm text-gray-400 mt-1">CRM Transportes</p>
        </div>
        <nav className="p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-gold-500 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
