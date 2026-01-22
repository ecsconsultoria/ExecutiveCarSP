# ExecutiveCarSP - PWA CRM

Sistema de gerenciamento (CRM) local-first para transporte executivo, desenvolvido como Progressive Web App (PWA).

## 📋 Descrição

ExecutiveCarSP é um sistema completo de gerenciamento para empresas de transporte executivo, permitindo:

- Gestão de clientes e fornecedores
- Controle de ordens de serviço (OS)
- Tabela de preços parametrizada
- Agenda integrada com calendário
- Política de cancelamento configurável
- Backup e importação de dados
- Funcionamento 100% offline (dados armazenados localmente)

## 🛠️ Tecnologias

- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS
- **Dexie.js** - Wrapper para IndexedDB
- **React Router** - Roteamento
- **Day.js** - Manipulação de datas
- **Lucide React** - Ícones
- **Workbox** - Service Worker para PWA

## 🎨 Design

**Paleta de cores:**
- Dourado (#D4AF37) - Cor primária
- Preto (#000000) - Cor secundária
- Branco (#FFFFFF) - Cor de destaque

## 📦 Instalação

### Requisitos

- Node.js LTS (v18 ou superior)
- npm ou pnpm

### Passos

```bash
# Clone o repositório
git clone https://github.com/ecsconsultoria/ExecutiveCarSP.git
cd ExecutiveCarSP

# Instale as dependências
npm install
# ou
pnpm install

# Inicie o servidor de desenvolvimento
npm run dev
# ou
pnpm dev
```

O aplicativo estará disponível em `http://localhost:3000`

## 🚀 Scripts

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Preview do build de produção
- `npm run lint` - Executa linter

## 📖 Como Usar

### 1. Configurações Iniciais

Acesse **Configurações** para definir:

- **Imposto**: Taxa padrão de 10% (editável)
- **Política de Cancelamento**: Janelas de tempo e percentuais
  - Exemplo: >48h = 0%, 24-48h = 20%, <24h = 50%
- **Catálogo de Veículos**: Tipos disponíveis (Sedan, SUV, Minivan, Van, Micro Ônibus, Ônibus)
  - Adicione ou remova tipos conforme necessário
  - Configure opção "blindado" para cada tipo
- **Pacotes de Horas**: Defina pacotes (3h, 5h, 8h, 10h, 12h, 15h)
- **URL do Formulário**: Link para formulário de agendamento externo

### 2. Cadastrar Clientes

Em **Clientes**, cadastre:
- Nome/Razão Social
- CPF/CNPJ
- Contatos (telefone, email, WhatsApp)
- Endereço completo
- Observações

### 3. Cadastrar Fornecedores

Em **Fornecedores**, cadastre:
- Nome
- Tipo (Empresa ou Autônomo)
- Tipo de motorista (Bilíngue ou Monolíngue)
- Veículos oferecidos
- Contatos
- Observações

### 4. Definir Tabela de Preços

Em **Tabela de Preços**, configure:
- Tipo de serviço (Transfer ou Por Hora)
- Pacote de horas (se aplicável)
- Tipo de veículo
- Blindado (Sim/Não)
- Tipo de motorista
- Valor base para cliente
- Valor base para fornecedor
- Ajustes (percentual ou fixo)

### 5. Criar Ordem de Serviço

Em **Ordens de Serviço** > **Nova OS**:

**Passo 1 - Cliente & Serviço:**
- Selecione o cliente
- Escolha o tipo de serviço (Transfer ou Por Hora)
- Defina veículo, blindagem e tipo de motorista
- Configure terceirização (se necessário)

**Passo 2 - Roteiro & Agenda:**
- Adicione trechos (origem → destino)
- Defina data/hora de início
- Para serviço por hora, defina também hora de término

**Passo 3 - Preço & Confirmação:**
- Sistema busca preço na tabela automaticamente
- Ou use "preço manual" se não encontrar combinação
- Imposto (10%) é aplicado automaticamente
- Adicione notas extras

### 6. Usar a Agenda

Em **Agenda**:
- Visualize compromissos vinculados às OS
- Detecte conflitos de agenda
- Acesse formulário de agendamento (botão "Abrir Formulário")

### 7. Fluxo de Status da OS

- **Reservado** → **Em Andamento** → **Concluído**
- Ou **Reservado** → **Cancelado**

Ao cancelar, o sistema calcula taxa baseada na política configurada.

### 8. Backup e Importação

Em **Backup**:

**Exportar:**
- Clique em "Exportar Todos os Dados"
- Arquivo JSON será baixado com todos os dados

**Importar:**
- Selecione arquivo JSON
- Escolha modo: Substituir ou Mesclar
- Preview dos dados antes de confirmar

## 💾 Armazenamento de Dados

Todos os dados são armazenados **localmente** no navegador usando IndexedDB:

- ✅ **Vantagens**: 
  - Funciona 100% offline
  - Rápido e responsivo
  - Sem custos de servidor
  - Privacidade total dos dados

- ⚠️ **Importante**: 
  - Dados ficam no navegador
  - Limpar cache do navegador apaga os dados
  - Use a função de Backup regularmente
  - Para usar em múltiplos dispositivos, exporte/importe dados

## 📊 Estrutura de Dados

O banco de dados possui as seguintes coleções:

- `settings` - Configurações globais
- `clientes` - Cadastro de clientes
- `fornecedores` - Cadastro de fornecedores
- `tabela_precos` - Tabela de preços
- `ordens_servico` - Ordens de serviço
- `compromissos` - Agenda/compromissos
- `despesas` - Despesas (placeholder)
- `pagamentos_cliente` - Pagamentos recebidos (placeholder)
- `repasses_fornecedor` - Repasses a fornecedores (placeholder)
- `anexos` - Metadados de anexos (placeholder)

## 🔄 PWA - Progressive Web App

O sistema funciona como PWA:

- ✅ Instalável no dispositivo
- ✅ Funciona offline
- ✅ Cache de assets estáticos
- ✅ Atualizações automáticas

Para instalar no dispositivo:
1. Acesse o app via navegador
2. Procure opção "Adicionar à tela inicial" ou "Instalar app"
3. Confirme a instalação

## 🚧 Funcionalidades Futuras (Próximas Fases)

- [ ] Geração de PDFs para confirmação de OS
- [ ] Módulo financeiro completo (pagamentos e repasses)
- [ ] Importação de dados via Google Sheets
- [ ] Relatórios e dashboards avançados
- [ ] Notificações push
- [ ] Multi-usuário com sincronização

## 🔒 Segurança e Privacidade

- Dados armazenados localmente (IndexedDB)
- Sem envio de dados para servidores externos
- Use em rede segura (HTTPS) para PWA funcionar plenamente
- Faça backups regulares dos dados

## 📱 Compatibilidade

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+
- ✅ Dispositivos móveis (iOS/Android)

## 🤝 Suporte

Para dúvidas ou suporte, entre em contato com a equipe de desenvolvimento.

## 📄 Licença

Este projeto é proprietário da ECS Consultoria.

---

**ExecutiveCarSP** - Gestão profissional para transporte executivo 🚗✨
