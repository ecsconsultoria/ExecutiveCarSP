<?php
/**
 * DIAGNÓSTICO - Script para identificar problemas de 500 Error
 * Coloque em: executivecarsp.com/diagnostico.php
 * Acesse: www.seudominio.com/diagnostico.php
 */

// Desativa display_errors por enquanto
ini_set('display_errors', 0);

// Inicia captura de erros
ob_start();
$errors = [];

echo "<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <title>Diagnóstico - Executive Car SP</title>
    <style>
        body { font-family: Arial; margin: 20px; background: #f5f5f5; }
        .container { max-width: 900px; margin: 0 auto; background: white; padding: 20px; border-radius: 5px; }
        h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        h2 { color: #007bff; margin-top: 30px; }
        .status-ok { color: #28a745; font-weight: bold; }
        .status-error { color: #dc3545; font-weight: bold; }
        .status-warning { color: #ffc107; font-weight: bold; }
        pre { background: #f4f4f4; padding: 15px; border-left: 4px solid #007bff; overflow-x: auto; }
        .file-check { margin: 10px 0; padding: 10px; background: #f9f9f9; border-left: 3px solid #ddd; }
        .file-check.ok { border-left-color: #28a745; }
        .file-check.error { border-left-color: #dc3545; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        table th, table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        table th { background: #f9f9f9; font-weight: bold; }
    </style>
</head>
<body>
<div class='container'>
<h1>🔍 Diagnóstico do Site - Executive Car SP</h1>
<p>Executado: " . date('Y-m-d H:i:s') . "</p>";

// ===== 1. VERIFICAÇÃO DE VERSÃO PHP =====
echo "<h2>1. Versão PHP</h2>";
$php_version = phpversion();
echo "<div class='file-check ok'><strong>PHP Version:</strong> " . $php_version . "</div>";
if (version_compare($php_version, '7.2.0', '<')) {
    echo "<div class='file-check error'><span class='status-error'>⚠️ AVISO:</span> PHP 7.2+ recomendado</div>";
}

// ===== 2. VERIFICAÇÃO DE ARQUIVOS =====
echo "<h2>2. Verificação de Arquivos Estruturais</h2>";

$required_files = [
    'config/config.php',
    'includes/security.php',
    'includes/header.php',
    'includes/footer.php',
    'includes/menu.php',
    'controllers/QuotationController.php',
    'views/index.php',
    'views/erro-404.php',
];

$all_files_ok = true;
foreach ($required_files as $file) {
    $full_path = __DIR__ . '/' . $file;
    $exists = file_exists($full_path);
    $class = $exists ? 'ok' : 'error';
    $status = $exists ? '<span class="status-ok">✓ OK</span>' : '<span class="status-error">✗ NÃO ENCONTRADO</span>';
    echo "<div class='file-check $class'><strong>$file:</strong> $status</div>";
    if (!$exists) $all_files_ok = false;
}

// ===== 3. TENTATIVA DE CARREGAR ARQUIVOS =====
echo "<h2>3. Teste de Includes</h2>";

// Test config.php
try {
    ob_start();
    require_once __DIR__ . '/config/config.php';
    ob_clean();
    echo "<div class='file-check ok'><strong>config/config.php:</strong> <span class='status-ok'>✓ Carregado com sucesso</span></div>";
    
    // Se config carregou, verifica constantes
    if (defined('BUSINESS_NAME')) {
        echo "<div class='file-check ok'><strong>Config Constants:</strong> <span class='status-ok'>✓ Constantes disponíveis</span></div>";
    }
} catch (Exception $e) {
    echo "<div class='file-check error'><strong>config/config.php:</strong> <span class='status-error'>✗ ERRO</span><pre>" . htmlspecialchars($e->getMessage()) . "</pre></div>";
    $errors[] = "config.php: " . $e->getMessage();
}

// Test security.php
try {
    ob_start();
    require_once __DIR__ . '/includes/security.php';
    ob_clean();
    echo "<div class='file-check ok'><strong>includes/security.php:</strong> <span class='status-ok'>✓ Carregado com sucesso</span></div>";
} catch (Exception $e) {
    echo "<div class='file-check error'><strong>includes/security.php:</strong> <span class='status-error'>✗ ERRO</span><pre>" . htmlspecialchars($e->getMessage()) . "</pre></div>";
    $errors[] = "security.php: " . $e->getMessage();
}

// Test header.php
try {
    ob_start();
    require_once __DIR__ . '/includes/header.php';
    ob_clean();
    echo "<div class='file-check ok'><strong>includes/header.php:</strong> <span class='status-ok'>✓ Carregado com sucesso</span></div>";
} catch (Exception $e) {
    echo "<div class='file-check error'><strong>includes/header.php:</strong> <span class='status-error'>✗ ERRO</span><pre>" . htmlspecialchars($e->getMessage()) . "</pre></div>";
    $errors[] = "header.php: " . $e->getMessage();
}

// ===== 4. VERIFICAÇÃO DE PERMISSÕES =====
echo "<h2>4. Verificação de Permissões de Pasta</h2>";

$directories = [
    'data' => 'Pasta para dados de quotações',
    'data/quotations' => 'Pasta para quotações',
    'public' => 'Pasta de arquivos públicos',
    'public/images' => 'Pasta de imagens',
    'public/css' => 'Pasta de estilos',
    'public/js' => 'Pasta de scripts',
];

foreach ($directories as $dir => $desc) {
    $full_path = __DIR__ . '/' . $dir;
    if (!file_exists($full_path)) {
        echo "<div class='file-check error'><strong>$dir:</strong> <span class='status-warning'>⚠️ NÃO EXISTE</span> - $desc</div>";
    } else {
        $is_writable = is_writable($full_path);
        $status = $is_writable ? '<span class="status-ok">✓ Escrita habilitada</span>' : '<span class="status-warning">⚠️ Sem permissão de escrita</span>';
        echo "<div class='file-check'><strong>$dir:</strong> $status</div>";
    }
}

// ===== 5. INFORMAÇÕES DE SERVIDOR =====
echo "<h2>5. Informações do Servidor</h2>";

echo "<table>";
echo "<tr><th>Propriedade</th><th>Valor</th></tr>";

$info = [
    'Server Software' => $_SERVER['SERVER_SOFTWARE'] ?? 'N/A',
    'Document Root' => $_SERVER['DOCUMENT_ROOT'] ?? 'N/A',
    'Current Directory' => __DIR__,
    'PHP Extensions Loaded' => count(get_loaded_extensions()) . ' extensões',
    'Max Upload Size' => ini_get('upload_max_filesize'),
    'Memory Limit' => ini_get('memory_limit'),
    'Display Errors' => ini_get('display_errors') ? 'Ativado' : 'Desativado',
];

foreach ($info as $key => $value) {
    echo "<tr><td>$key</td><td>" . htmlspecialchars($value) . "</td></tr>";
}

echo "</table>";

// ===== 6. VERIFICAÇÃO DE EXTENSÕES NECESSÁRIAS =====
echo "<h2>6. Extensões PHP Necessárias</h2>";

$required_extensions = [
    'json' => 'JSON (obrigatório)',
    'mbstring' => 'Multibyte String',
    'gd' => 'GD Library (para imagens)',
    'pdo' => 'PDO (para banco de dados)',
];

foreach ($required_extensions as $ext => $desc) {
    $loaded = extension_loaded($ext);
    $status = $loaded ? '<span class="status-ok">✓ Carregado</span>' : '<span class="status-warning">⚠️ Não carregado</span>';
    echo "<div class='file-check'><strong>$ext:</strong> $status - $desc</div>";
}

// ===== 7. LOG DE ERROS =====
if (!empty($errors)) {
    echo "<h2>7. 🔴 Erros Encontrados</h2>";
    foreach ($errors as $error) {
        echo "<div class='file-check error'><pre>" . htmlspecialchars($error) . "</pre></div>";
    }
} else {
    echo "<h2>7. ✅ Sem Erros Fatais Detectados</h2>";
    echo "<p>Tudo parece estar funcionando corretamente!</p>";
}

// ===== 8. RECOMENDAÇÕES =====
echo "<h2>8. 📋 Recomendações</h2>";
echo "<ul>";

if (!$all_files_ok) {
    echo "<li><span class='status-error'>⚠️ CRÍTICO:</span> Arquivos estruturais faltando. Execute novamente o script de criação de arquivos.</li>";
}

if (!file_exists(__DIR__ . '/data/quotations')) {
    echo "<li>Crie a pasta: <code>data/quotations</code> para armazenar quotações</li>";
}

if (!file_exists(__DIR__ . '/.htaccess')) {
    echo "<li>Considere ativar <code>.htaccess-novo</code> para melhor SEO e segurança</li>";
}

echo "<li>Após corrigir os erros, teste acessando: <a href='/'>www.seudominio.com/</a></li>";
echo "<li>Se erro 500 persiste, verifique: <code>logs/error_log</code> do Apache</li>";
echo "</ul>";

echo "<hr>
<footer style='color: #999; font-size: 12px;'>
    Diagnóstico criado em: " . date('Y-m-d H:i:s') . " | PHP " . phpversion() . "
</footer>
</div>
</body>
</html>";

ob_end_flush();
?>
