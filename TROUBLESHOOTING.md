# 🔧 Guia de Troubleshooting - Erro 500

## O que fazer se estiver recebendo Erro 500

### 1️⃣ Teste Imediato
Acesse este arquivo diretamente no seu navegador:
```
https://www.seudominio.com/teste.php
```

Se você vir a página de teste com informações sobre o PHP, então **PHP está funcionando**. O problema é em outro lugar.

---

### 2️⃣ Execute o Diagnóstico Completo
Acesse:
```
https://www.seudominio.com/diagnostico.php
```

Este script verificará:
- ✓ Todos os arquivos estruturais
- ✓ Permissões de pasta
- ✓ Extensões PHP necessárias
- ✓ Carregamento de cada arquivo
- ✓ Constantes definidas

**Anote qualquer erro que aparecer.**

---

### 3️⃣ Verifique o Log de Erros do Apache/Servidor

#### No cPanel/Plesk:
1. Acesse File Manager
2. Procure por: `error_log` ou `logs/` na raiz do domínio
3. Abra e procure por erros recentes

#### No Windows (local):
Se estiver em ambiente de desenvolvimento local (XAMPP, Wamp):
1. Abra `C:\xampp\apache\logs\error.log` (XAMPP)
2. Ou `C:\wamp\logs\apache_error.log` (Wamp)
3. Procure por linhas com "PHP Fatal Error" recentes

#### Via SSH (Linux):
```bash
tail -50 /home/username/public_html/error_log
```

---

### 4️⃣ Problemas Comuns e Soluções

#### 🔴 Problema: "Cannot find file config/config.php"
**Solução:** O caminho relativo está quebrado
- Verifique se `config/config.php` existe
- Verifique se a estrutura é exatamente assim:
  ```
  executivecarsp.com/
  ├── index.php
  ├── config/
  │   └── config.php
  ├── includes/
  │   ├── header.php
  │   ├── menu.php
  │   ├── footer.php
  │   └── security.php
  ├── views/
  │   └── index.php
  └── controllers/
      └── QuotationController.php
  ```

#### 🔴 Problema: "Call to undefined function getCurrentPage()"
**Solução:** O arquivo `config/config.php` não foi carregado
- Verifique se `require_once` em `index.php` aponta corretamente:
  ```php
  require_once 'config/config.php';  // ✓ Correto
  require_once './config/config.php';  // ✗ Errado
  ```

#### 🔴 Problema: "Cannot redeclare BUSINESS_NAME"
**Solução:** Um arquivo está sendo incluído duas vezes
- Verifique se não há `require_once` duplicado em `index.php`
- Verifique se `header.php` não está sendo incluído duas vezes

#### 🔴 Problema: "Session already started" ou "Headers already sent"
**Solução:** Há espaço em branco ou output antes de `session_start()`
- Verifique que o arquivo começe com `<?php` (sem espaço antes)
- Verifique que não haja caracteres antes da tag `<?php`

---

### 5️⃣ Ativar Exibição de Erros (Apenas em Desenvolvimento!)

Se você não conseguir acessar os logs, você pode ativar a exibição de erros **TEMPORARIAMENTE**:

**Edite `index.php` no topo:**
```php
<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// ... resto do código
```

⚠️ **IMPORTANTE:** Remova estas linhas antes de colocar em produção! Expõem informações sensíveis.

---

### 6️⃣ Verifique Permissões de Pasta

Algumas pastas precisam de permissões de escrita:

```bash
chmod 755 /home/username/public_html/executivecarsp.com/
chmod 755 /home/username/public_html/executivecarsp.com/data/
chmod 755 /home/username/public_html/executivecarsp.com/data/quotations/
chmod 755 /home/username/public_html/executivecarsp.com/public/
```

No cPanel, você pode fazer isso pelo File Manager:
1. Clique com botão direito na pasta
2. Selecione "Change Permissions"
3. Defina para `755` (ou `777` se necessário)

---

### 7️⃣ Teste a Estrutura de Arquivos

Execute este teste simples em um novo arquivo `teste-estrutura.php`:

```php
<?php
$files = [
    'config/config.php',
    'includes/security.php',
    'includes/header.php',
    'includes/footer.php',
    'includes/menu.php',
    'controllers/QuotationController.php',
    'views/index.php',
    'views/erro-404.php',
];

echo "<h1>Verificação de Arquivos</h1>";
foreach ($files as $file) {
    $exists = file_exists(__DIR__ . '/' . $file);
    $status = $exists ? '✓ OK' : '✗ FALTANDO';
    echo "<p>$file: $status</p>";
}
?>
```

---

### 8️⃣ Reconstrua o Site do Zero

Se tudo mais falhar, recrie os arquivos:

1. **Faça backup** da versão atual
2. **Reexecute** o script de criação de arquivos (ou entre em contato comigo)
3. **Copie** os arquivos novamente para o servidor

---

### 9️⃣ Precisa de Help Especializado?

Se depois de seguir todos esses passos ainda tiver problemas:

1. **Abra o arquivo de log do Apache** (veja seção 3)
2. **Copie o erro exato** que aparecer
3. **Envie para análise** com:
   - Mensagem de erro completa
   - Output do `/diagnostico.php`
   - Estrutura de arquivos do seu servidor

---

## ✅ Checklist de Resolução

- [ ] Acessei `teste.php` e PHP está funcionando
- [ ] Acessei `diagnostico.php` e revisei os erros
- [ ] Verifiquei o arquivo de log do Apache
- [ ] Confirmi que a estrutura de pastas está correta
- [ ] Verifiquei permissões (755+)
- [ ] Tentei acessar a homepage `/` novamente
- [ ] Homepage carrega sem erro 500

---

**Criado em:** 11 de Dezembro de 2024
**Para:** www.executivecarsp.com
**Versão:** 2.0 Refatorada
