<?php
// Teste de diagnóstico - executivecarsp.com/diagnose.php

echo "<h1>Diagnóstico - Executive Car SP v2.0</h1>";

echo "<h2>✅ Arquivos Existem?</h2>";
echo "<ul>";

$files = [
    'config/config.php',
    'includes/header.php',
    'includes/footer.php',
    'includes/security.php',
    'controllers/QuotationController.php',
    'views/index.php',
    'views/por-hora.php',
    'views/erro-404.php',
    'views/mensagem-enviada.php',
];

foreach ($files as $file) {
    $exists = file_exists($file) ? '✅' : '❌';
    echo "<li>$exists $file</li>";
}

echo "</ul>";

echo "<h2>📦 Includes Funcionam?</h2>";
try {
    require_once 'config/config.php';
    echo "✅ config.php carregado<br>";
} catch (Exception $e) {
    echo "❌ config.php erro: " . $e->getMessage() . "<br>";
}

echo "<h2>🔧 Constantes Definidas?</h2>";
echo "BUSINESS_NAME: " . (defined('BUSINESS_NAME') ? BUSINESS_NAME : '❌ NOT DEFINED') . "<br>";
echo "SITE_URL: " . (defined('SITE_URL') ? SITE_URL : '❌ NOT DEFINED') . "<br>";

echo "<h2>🛡️ Security Loaded?</h2>";
try {
    require_once 'includes/security.php';
    echo "✅ security.php carregado<br>";
    echo "✅ Função sanitizeHTML existe: " . (function_exists('sanitizeHTML') ? 'Sim' : 'Não') . "<br>";
} catch (Exception $e) {
    echo "❌ security.php erro: " . $e->getMessage() . "<br>";
}

echo "<h2>📄 Views Existem?</h2>";
if (file_exists('views/index.php')) {
    echo "✅ views/index.php existe<br>";
} else {
    echo "❌ views/index.php NÃO EXISTE - Este é o problema!<br>";
}

echo "<hr>";
echo "<p><strong>SOLUÇÃO:</strong> Verifique se os diretórios /config, /includes, /controllers, /views foram criados corretamente.</p>";
?>
