Changelog

2026-01-22 — Phase 2: Finance, Despesas, PDFs, Reports, Form Importer
- Financeiro: PagamentoCliente (AReceber, Pago, Vencido, Cancelado) e RepasseFornecedor (AFaturar, Faturado, Pago) com CRUD completo, datas e valores, vinculados à OS.
- Despesas: CRUD completo com categorias (combustível, pedágio, alimentação, impostos, outros), anexo e vínculo com OS.
- OS: validação de fluxo (Reservado → EmAndamento → Concluído | Cancelado), cálculo de taxa de cancelamento via política, pricing breakdown (base + ajustes + imposto) armazenado e exibido.
- PDFs: geração de Confirmação de OS e Recibo (jsPDF/PDF-LIB) a partir do detalhe da OS.
- Importador de Formulário: CSV/JSON com mapeamento de colunas para Pré-OS e conversão para OS.
- Relatórios: receita, despesas, repasses, imposto e margem por período/cliente/veículo/tipo_serviço; exportação CSV.
- Agenda: duração, informações de recurso (motorista/veículo) e conflitos aprimorados.
- README atualizado com instruções da Fase 2.

2026-01-22 — Phase 1: Initialize PWA CRM
- Stack: React + Vite + TypeScript + Tailwind; Dexie (IndexedDB), Workbox, manifest.json.
- Páginas: Dashboard, Agenda, OS (lista/detalhe/wizard), Clientes, Fornecedores, Tabela de Preços, Financeiro (placeholder), Despesas (placeholder), Configurações, Backup.
- Configurações: imposto 10% (padrão), política de cancelamento, catálogo de veículos, pacotes por hora, URL de formulário externo.
- PWA offline-first: cache de shell/estáticos; exportação/importação JSON.
- Tema: dourado/preto/branco.