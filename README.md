# ExecutiveCarSP - CRM para Transportes Executivos

Sistema de gestão (CRM) local-first para serviços de transporte executivo. Este é um Progressive Web App (PWA) que funciona offline e armazena todos os dados localmente no navegador usando IndexedDB.

## 🚀 Características Principais

### MVP - Fase 1 (Implementado)

- ✅ **PWA Offline-First**: Funciona offline com Service Worker e cache de assets
- ✅ **Armazenamento Local**: Todos os dados armazenados em IndexedDB via Dexie
- ✅ **Gestão de Clientes**: CRUD completo de clientes (pessoa física/jurídica)
- ✅ **Gestão de Fornecedores**: CRUD de fornecedores com tipos de motorista e veículos
- ✅ **Tabela de Preços Parametrizada**: Preços por tipo de serviço, veículo, motorista e blindagem
- ✅ **Configurações Globais**:
  - Moeda (BRL) e timezone (America/Sao_Paulo)
  - Imposto padrão configurável (10%)
  - Política de cancelamento com janelas de tempo e percentuais
  - Catálogo de veículos customizável (Sedan, SUV, Minivan, Van, Micro Ônibus, Ônibus)
  - Pacotes de hora editáveis (3h, 5h, 8h, 10h, 12h, 15h)
  - URL de formulário de agendamento
- ✅ **Ordens de Serviço**: Estrutura e modelo de dados (wizard em desenvolvimento)
- ✅ **Agenda**: Visualização básica de compromissos
- ✅ **Backup/Importação**: Export/import completo de dados em JSON
- ✅ **Tema Gold/Black/White**: Paleta de cores profissional

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn

## 🛠️ Instalação

```bash
# Clone o repositório
git clone https://github.com/ecsconsultoria/ExecutiveCarSP.git
cd ExecutiveCarSP

# Instale as dependências
npm install
```

## 💻 Desenvolvimento

```bash
# Inicie o servidor de desenvolvimento
npm run dev

# O aplicativo estará disponível em http://localhost:5173
```

O modo de desenvolvimento inclui:
- Hot Module Replacement (HMR)
- Verificação de tipos TypeScript em tempo real
- Auto-reload no navegador

## 🏗️ Build para Produção

```bash
# Compile o projeto
npm run build

# Preview do build de produção
npm run preview
```

O build de produção:
- Minifica e otimiza todos os assets
- Gera o Service Worker para funcionalidade PWA
- Cria arquivos otimizados na pasta `dist/`

## 📦 Deploy

### Hospedagem Estática (Netlify, Vercel, GitHub Pages)

Após o build, faça upload da pasta `dist/` para qualquer serviço de hospedagem estática:

**Netlify:**
```bash
# Instale o Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

**Vercel:**
```bash
# Instale o Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**GitHub Pages:**
```bash
# Adicione ao package.json:
# "homepage": "https://[username].github.io/ExecutiveCarSP"

# Build e deploy
npm run build
# Copie a pasta dist/ para branch gh-pages
```

### Servidor Web Próprio

Configure seu servidor web (Apache, Nginx) para servir a pasta `dist/` e redirecionar todas as rotas para `index.html`:

**Nginx:**
```nginx
server {
    listen 80;
    server_name executivecarsp.com;
    root /var/www/executivecarsp/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Apache (.htaccess já incluído):**
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

## 📱 Funcionalidades PWA

O aplicativo pode ser instalado como um app nativo:

1. **Chrome/Edge**: Clique no ícone de instalação na barra de endereços
2. **Safari (iOS)**: Toque em "Compartilhar" > "Adicionar à Tela Inicial"
3. **Android**: Toque em "Adicionar à tela inicial" quando solicitado

## 💾 Backup e Restauração

### Exportar Dados
1. Acesse a página "Backup" no menu
2. Clique em "Exportar Backup"
3. Salve o arquivo JSON em local seguro

### Importar Dados
1. Acesse a página "Backup" no menu
2. Clique em "Importar Backup"
3. Selecione o arquivo JSON
4. Escolha entre substituir ou mesclar dados

**Importante**: Faça backups regulares! Os dados são armazenados apenas no navegador.

## 🗂️ Estrutura do Projeto

```
ExecutiveCarSP/
├── public/              # Assets estáticos
├── src/
│   ├── components/      # Componentes React reutilizáveis
│   │   ├── common/      # Componentes comuns (Button, Card, Modal, etc.)
│   │   ├── forms/       # Componentes de formulário (Input, Select, etc.)
│   │   └── Layout.tsx   # Layout principal com sidebar
│   ├── db/              # Database (Dexie/IndexedDB)
│   │   ├── index.ts     # Configuração do banco de dados
│   │   └── models.ts    # Tipos e interfaces TypeScript
│   ├── pages/           # Páginas da aplicação
│   │   ├── Dashboard.tsx
│   │   ├── Clientes.tsx
│   │   ├── Fornecedores.tsx
│   │   ├── TabelaPrecos.tsx
│   │   ├── OrdensServico.tsx
│   │   ├── Agenda.tsx
│   │   ├── Financeiro.tsx
│   │   ├── Despesas.tsx
│   │   ├── Configuracoes.tsx
│   │   └── Backup.tsx
│   ├── utils/           # Funções utilitárias
│   │   ├── currency.ts  # Formatação de moeda
│   │   ├── date.ts      # Manipulação de datas
│   │   ├── pricing.ts   # Cálculos de preço
│   │   └── cancelPolicy.ts # Política de cancelamento
│   ├── theme/           # Tema e cores
│   │   └── colors.ts
│   ├── App.tsx          # Componente principal
│   ├── main.tsx         # Entry point
│   └── index.css        # Estilos globais
├── index.html           # HTML base
├── package.json         # Dependências e scripts
├── tsconfig.json        # Configuração TypeScript
├── vite.config.ts       # Configuração Vite
├── tailwind.config.ts   # Configuração Tailwind CSS
└── README.md            # Este arquivo
```

## 🎨 Personalização de Tema

O tema utiliza a paleta Gold/Black/White configurada em `tailwind.config.ts`:

- **Gold (#D4AF37)**: Cor primária para destaques e ações principais
- **Black (#000000)**: Sidebar e elementos de navegação
- **White (#FFFFFF)**: Fundo e conteúdo principal

## 🔐 Segurança e Privacidade

- **Dados Locais**: Todos os dados ficam apenas no navegador do usuário
- **Sem Backend**: Não há servidor remoto ou transmissão de dados
- **Privacidade Total**: Nenhuma informação é compartilhada ou rastreada
- **Backup Manual**: Você controla seus próprios backups

## 🛣️ Roadmap - Próximas Fases

### Fase 2 - Ordens de Serviço Completas
- Wizard completo de criação de OS
- Seleção automática de preços da tabela
- Override manual de preços
- Gestão de roteiros com múltiplos trechos
- Anexos de arquivos

### Fase 3 - Financeiro e Documentos
- Gestão de pagamentos de clientes
- Controle de repasses a fornecedores
- Geração de PDFs (confirmação de OS, recibos)
- Relatórios financeiros

### Fase 4 - Melhorias na Agenda
- Visualização de calendário completa (mês/semana/dia)
- Detecção de conflitos de horários
- Integração com Google Calendar (opcional)

### Fase 5 - Analytics e Relatórios
- Dashboard com gráficos e métricas
- Relatórios de desempenho
- Análise de rentabilidade

## 🐛 Solução de Problemas

### Dados não aparecem após atualização
- Verifique o console do navegador (F12)
- Limpe o cache e recarregue (Ctrl+Shift+R)
- Verifique se IndexedDB está habilitado no navegador

### PWA não instala
- Certifique-se de estar usando HTTPS (ou localhost)
- Verifique se o Service Worker está registrado
- Veja o console do navegador para erros

### Backup/Import não funciona
- Verifique se o arquivo JSON é válido
- Certifique-se de ter permissão de leitura/escrita
- Veja o console do navegador para detalhes do erro

## 📄 Licença

Este projeto é proprietário da ECS Consultoria.

## 👥 Suporte

Para suporte ou questões, entre em contato com a equipe de desenvolvimento.

---

**ExecutiveCarSP** - Sistema de Gestão para Transportes Executivos
Desenvolvido com ❤️ usando React, TypeScript, Tailwind CSS e Dexie
