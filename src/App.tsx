import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Agenda } from './pages/Agenda';
import { OrdensServico } from './pages/OrdensServico';
import { Clientes } from './pages/Clientes';
import { Fornecedores } from './pages/Fornecedores';
import { TabelaPrecos } from './pages/TabelaPrecos';
import { Despesas } from './pages/Despesas';
import { Financeiro } from './pages/Financeiro';
import { Configuracoes } from './pages/Configuracoes';
import { Backup } from './pages/Backup';
import { initializeSettings } from './db';

function App() {
  useEffect(() => {
    // Initialize database with default settings
    initializeSettings().catch(console.error);
  }, []);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/ordens-servico" element={<OrdensServico />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/fornecedores" element={<Fornecedores />} />
          <Route path="/tabela-precos" element={<TabelaPrecos />} />
          <Route path="/despesas" element={<Despesas />} />
          <Route path="/financeiro" element={<Financeiro />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/backup" element={<Backup />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
