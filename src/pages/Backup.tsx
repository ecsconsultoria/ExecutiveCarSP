import React from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Download, Upload } from 'lucide-react';
import { db } from '../db';

export function Backup() {
  const exportData = async () => {
    try {
      const data = {
        settings: await db.settings.toArray(),
        clientes: await db.clientes.toArray(),
        fornecedores: await db.fornecedores.toArray(),
        tabela_precos: await db.tabela_precos.toArray(),
        ordens_servico: await db.ordens_servico.toArray(),
        compromissos: await db.compromissos.toArray(),
        despesas: await db.despesas.toArray(),
        pagamentos_cliente: await db.pagamentos_cliente.toArray(),
        repasses_fornecedor: await db.repasses_fornecedor.toArray(),
        anexos: await db.anexos.toArray(),
        exportDate: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `executive-car-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      alert('Backup exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar backup:', error);
      alert('Erro ao exportar backup. Verifique o console.');
    }
  };

  const importData = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        const confirmReplace = confirm(
          'Deseja SUBSTITUIR todos os dados existentes? Clique em "Cancelar" para mesclar com os dados atuais.'
        );

        if (confirmReplace) {
          // Clear all tables
          await db.transaction('rw', db.tables, async () => {
            for (const table of db.tables) {
              await table.clear();
            }
          });
        }

        // Import data
        await db.transaction('rw', db.tables, async () => {
          if (data.settings) await db.settings.bulkAdd(data.settings);
          if (data.clientes) await db.clientes.bulkAdd(data.clientes);
          if (data.fornecedores) await db.fornecedores.bulkAdd(data.fornecedores);
          if (data.tabela_precos) await db.tabela_precos.bulkAdd(data.tabela_precos);
          if (data.ordens_servico) await db.ordens_servico.bulkAdd(data.ordens_servico);
          if (data.compromissos) await db.compromissos.bulkAdd(data.compromissos);
          if (data.despesas) await db.despesas.bulkAdd(data.despesas);
          if (data.pagamentos_cliente) await db.pagamentos_cliente.bulkAdd(data.pagamentos_cliente);
          if (data.repasses_fornecedor) await db.repasses_fornecedor.bulkAdd(data.repasses_fornecedor);
          if (data.anexos) await db.anexos.bulkAdd(data.anexos);
        });

        alert('Backup importado com sucesso!');
        window.location.reload();
      } catch (error) {
        console.error('Erro ao importar backup:', error);
        alert('Erro ao importar backup. Verifique o console e o arquivo.');
      }
    };

    input.click();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Backup e Importação</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Exportar Dados">
          <p className="text-gray-600 mb-4">
            Exporte todos os dados do sistema para um arquivo JSON. Use este arquivo como backup 
            ou para importar em outro dispositivo.
          </p>
          <Button onClick={exportData} className="w-full">
            <Download size={20} className="mr-2" />
            Exportar Backup
          </Button>
        </Card>

        <Card title="Importar Dados">
          <p className="text-gray-600 mb-4">
            Importe dados de um arquivo de backup JSON. Você pode escolher entre substituir 
            todos os dados existentes ou mesclar com os dados atuais.
          </p>
          <Button onClick={importData} variant="secondary" className="w-full">
            <Upload size={20} className="mr-2" />
            Importar Backup
          </Button>
        </Card>
      </div>

      <Card title="Importante" className="mt-6">
        <div className="space-y-2 text-sm text-gray-600">
          <p>⚠️ <strong>Antes de importar:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Faça um backup dos seus dados atuais</li>
            <li>Verifique se o arquivo de backup é válido</li>
            <li>Escolha se deseja substituir ou mesclar os dados</li>
          </ul>
          <p className="mt-4">💡 <strong>Dica:</strong> Faça backups regulares, especialmente antes de 
          fazer grandes alterações no sistema.</p>
        </div>
      </Card>
    </div>
  );
}
