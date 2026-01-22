import React, { useState, useRef } from 'react';
import { Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { db } from '../db';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/forms/Input';

export function Backup() {
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [previewData, setPreviewData] = useState<any>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      const data = {
        version: 1,
        exportDate: new Date().toISOString(),
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
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `executivecar-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'Backup exportado com sucesso!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao exportar backup.' });
      console.error(error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        setPreviewData(data);
        setMessage(null);
      } catch (error) {
        setMessage({ type: 'error', text: 'Arquivo JSON inválido.' });
        setPreviewData(null);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!previewData) return;

    try {
      if (importMode === 'replace') {
        await db.transaction('rw', db.tables, async () => {
          await db.clientes.clear();
          await db.fornecedores.clear();
          await db.tabela_precos.clear();
          await db.ordens_servico.clear();
          await db.compromissos.clear();
          await db.despesas.clear();
          await db.pagamentos_cliente.clear();
          await db.repasses_fornecedor.clear();
          await db.anexos.clear();
        });
      }

      await db.transaction('rw', db.tables, async () => {
        if (previewData.settings) {
          for (const item of previewData.settings) {
            if (importMode === 'replace') {
              await db.settings.put(item);
            }
          }
        }
        if (previewData.clientes) {
          for (const item of previewData.clientes) {
            if (importMode === 'merge') {
              const { id, ...rest } = item;
              await db.clientes.add({ ...rest, createdAt: new Date(rest.createdAt), updatedAt: new Date(rest.updatedAt) });
            } else {
              await db.clientes.put({ ...item, createdAt: new Date(item.createdAt), updatedAt: new Date(item.updatedAt) });
            }
          }
        }
        if (previewData.fornecedores) {
          for (const item of previewData.fornecedores) {
            if (importMode === 'merge') {
              const { id, ...rest } = item;
              await db.fornecedores.add({ ...rest, createdAt: new Date(rest.createdAt), updatedAt: new Date(rest.updatedAt) });
            } else {
              await db.fornecedores.put({ ...item, createdAt: new Date(item.createdAt), updatedAt: new Date(item.updatedAt) });
            }
          }
        }
        if (previewData.tabela_precos) {
          for (const item of previewData.tabela_precos) {
            if (importMode === 'merge') {
              const { id, ...rest } = item;
              await db.tabela_precos.add({ ...rest, createdAt: new Date(rest.createdAt), updatedAt: new Date(rest.updatedAt) });
            } else {
              await db.tabela_precos.put({ ...item, createdAt: new Date(item.createdAt), updatedAt: new Date(item.updatedAt) });
            }
          }
        }
        if (previewData.ordens_servico) {
          for (const item of previewData.ordens_servico) {
            const osData = {
              ...item,
              createdAt: new Date(item.createdAt),
              updatedAt: new Date(item.updatedAt),
              agendamento: {
                ...item.agendamento,
                dataHoraInicio: new Date(item.agendamento.dataHoraInicio),
                dataHoraFim: item.agendamento.dataHoraFim ? new Date(item.agendamento.dataHoraFim) : null,
                dataHoraIda: item.agendamento.dataHoraIda ? new Date(item.agendamento.dataHoraIda) : null,
                dataHoraVolta: item.agendamento.dataHoraVolta ? new Date(item.agendamento.dataHoraVolta) : null,
              },
            };
            if (importMode === 'merge') {
              const { id, ...itemRest } = osData;
              await db.ordens_servico.add(itemRest);
            } else {
              await db.ordens_servico.put(osData);
            }
          }
        }
        if (previewData.compromissos) {
          for (const item of previewData.compromissos) {
            const compData = {
              ...item,
              dataHoraInicio: new Date(item.dataHoraInicio),
              dataHoraFim: new Date(item.dataHoraFim),
              createdAt: new Date(item.createdAt),
              updatedAt: new Date(item.updatedAt),
            };
            if (importMode === 'merge') {
              const { id, ...rest } = compData;
              await db.compromissos.add(rest);
            } else {
              await db.compromissos.put(compData);
            }
          }
        }
        if (previewData.despesas) {
          for (const item of previewData.despesas) {
            const despData = {
              ...item,
              data: new Date(item.data),
              createdAt: new Date(item.createdAt),
              updatedAt: new Date(item.updatedAt),
            };
            if (importMode === 'merge') {
              const { id, ...rest } = despData;
              await db.despesas.add(rest);
            } else {
              await db.despesas.put(despData);
            }
          }
        }
        if (previewData.pagamentos_cliente) {
          for (const item of previewData.pagamentos_cliente) {
            const pagData = {
              ...item,
              dataPagamento: new Date(item.dataPagamento),
              createdAt: new Date(item.createdAt),
              updatedAt: new Date(item.updatedAt),
            };
            if (importMode === 'merge') {
              const { id, ...rest } = pagData;
              await db.pagamentos_cliente.add(rest);
            } else {
              await db.pagamentos_cliente.put(pagData);
            }
          }
        }
        if (previewData.repasses_fornecedor) {
          for (const item of previewData.repasses_fornecedor) {
            const repData = {
              ...item,
              dataRepasse: new Date(item.dataRepasse),
              createdAt: new Date(item.createdAt),
              updatedAt: new Date(item.updatedAt),
            };
            if (importMode === 'merge') {
              const { id, ...rest } = repData;
              await db.repasses_fornecedor.add(rest);
            } else {
              await db.repasses_fornecedor.put(repData);
            }
          }
        }
        if (previewData.anexos) {
          for (const item of previewData.anexos) {
            const anexoData = {
              ...item,
              createdAt: new Date(item.createdAt),
            };
            if (importMode === 'merge') {
              const { id, ...rest } = anexoData;
              await db.anexos.add(rest);
            } else {
              await db.anexos.put(anexoData);
            }
          }
        }
      });

      setMessage({ type: 'success', text: 'Dados importados com sucesso!' });
      setPreviewData(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao importar dados.' });
      console.error(error);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black-900">Backup e Restauração</h1>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-md flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Exportar Dados">
          <p className="text-gray-600 mb-4">
            Faça o download de todos os dados do sistema em formato JSON.
          </p>
          <Button onClick={handleExport}>
            <Download className="h-5 w-5 mr-2" />
            Exportar Backup
          </Button>
        </Card>

        <Card title="Importar Dados">
          <p className="text-gray-600 mb-4">
            Carregue um arquivo de backup para restaurar os dados.
          </p>
          
          <Select
            label="Modo de Importação"
            options={[
              { value: 'merge', label: 'Mesclar (adicionar aos dados existentes)' },
              { value: 'replace', label: 'Substituir (apagar dados existentes)' },
            ]}
            value={importMode}
            onChange={(e) => setImportMode(e.target.value as 'merge' | 'replace')}
          />

          <div className="mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-gold-50 file:text-gold-700
                hover:file:bg-gold-100"
            />
          </div>

          {previewData && (
            <div className="mb-4 p-4 bg-gray-50 rounded-md">
              <h4 className="font-medium mb-2">Prévia dos Dados:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Clientes: {previewData.clientes?.length || 0}</div>
                <div>Fornecedores: {previewData.fornecedores?.length || 0}</div>
                <div>Tabela de Preços: {previewData.tabela_precos?.length || 0}</div>
                <div>Ordens de Serviço: {previewData.ordens_servico?.length || 0}</div>
                <div>Compromissos: {previewData.compromissos?.length || 0}</div>
                <div>Despesas: {previewData.despesas?.length || 0}</div>
              </div>
            </div>
          )}

          <Button
            onClick={handleImport}
            disabled={!previewData}
            variant="secondary"
          >
            <Upload className="h-5 w-5 mr-2" />
            Importar Dados
          </Button>
        </Card>
      </div>

      <Card className="mt-6">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Avisos Importantes</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>
                Modo <strong>Mesclar</strong>: Adiciona novos registros aos dados existentes.
                Útil para importar dados parciais.
              </li>
              <li>
                Modo <strong>Substituir</strong>: Remove TODOS os dados existentes antes de
                importar. Use com cuidado!
              </li>
              <li>Sempre faça um backup antes de importar dados em modo substituir.</li>
              <li>
                Os arquivos de backup contêm dados sensíveis. Armazene-os com segurança.
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
