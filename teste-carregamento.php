<?php
/**
 * Simulador de Carregamento da Homepage
 * Este arquivo testa o carregamento completo da página sem renderizar HTML
 * Acesse: /teste-carregamento.php
 */

error_reporting(E_ALL);
ini_set('display_errors', 0);

// Captura erros
ob_start();
$output = [];
$errors = [];

// Teste 1: Load config
try {
    require_once 'config/config.php';
    $output[] = "✓ config/config.php carregado";
} catch (Exception $e) {
    $errors[] = "✗ config/config.php: " . $e->getMessage();
}

// Teste 2: Load security
try {
    require_once 'includes/security.php';
    $output[] = "✓ includes/security.php carregado";
} catch (Exception $e) {
    $errors[] = "✗ includes/security.php: " . $e->getMessage();
}

// Teste 3: Load QuotationController
try {
    require_once 'controllers/QuotationController.php';
    $output[] = "✓ controllers/QuotationController.php carregado";
} catch (Exception $e) {
    $errors[] = "✗ controllers/QuotationController.php: " . $e->getMessage();
}

// Teste 4: Simula carregamento do header
try {
    ob_start();
    require_once 'includes/header.php';
    ob_clean();
    $output[] = "✓ includes/header.php carregado";
} catch (Exception $e) {
    $errors[] = "✗ includes/header.php: " . $e->getMessage();
}

// Teste 5: Simula carregamento do menu
try {
    ob_start();
    require_once 'includes/menu.php';
    ob_clean();
    $output[] = "✓ includes/menu.php carregado";
} catch (Exception $e) {
    $errors[] = "✗ includes/menu.php: " . $e->getMessage();
}

// Teste 6: Simula carregamento do footer
try {
    ob_start();
    require_once 'includes/footer.php';
    ob_clean();
    $output[] = "✓ includes/footer.php carregado";
} catch (Exception $e) {
    $errors[] = "✗ includes/footer.php: " . $e->getMessage();
}

// Teste 7: Verifica se views existem
$views = ['views/index.php', 'views/por-hora.php', 'views/erro-404.php'];
foreach ($views as $view) {
    if (file_exists($view)) {
        $output[] = "✓ $view existe";
    } else {
        $errors[] = "✗ $view não encontrado";
    }
}

// Teste 8: Verifica constantes críticas
$constants = ['SITE_URL', 'BUSINESS_NAME', 'BUSINESS_PHONE'];
foreach ($constants as $const) {
    if (defined($const)) {
        $output[] = "✓ Constante $const definida: " . constant($const);
    } else {
        $errors[] = "✗ Constante $const não definida";
    }
}

// Teste 9: Verifica funções críticas
$functions = ['getCurrentPage', 'getMetaTags', 'validateEmail', 'generateCSRFToken'];
foreach ($functions as $func) {
    if (function_exists($func)) {
        $output[] = "✓ Função $func disponível";
    } else {
        $errors[] = "✗ Função $func não encontrada";
    }
}

ob_end_clean();

// Renderiza resultado
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Teste de Carregamento - Executive Car SP</title>
    <style>
        body { font-family: 'Courier New', monospace; margin: 20px; background: #1e1e1e; color: #fff; }
        .container { max-width: 900px; margin: 0 auto; background: #2d2d2d; padding: 20px; border-radius: 5px; }
        h1 { color: #4CAF50; text-align: center; }
        .status { padding: 10px; margin: 5px 0; border-radius: 3px; }
        .ok { background: #1b5e20; color: #4CAF50; }
        .error { background: #b71c1c; color: #ff6b6b; }
        pre { background: #1e1e1e; padding: 15px; border-left: 3px solid #4CAF50; overflow-x: auto; }
        .summary { margin-top: 20px; padding: 15px; background: #3a3a3a; border-radius: 5px; }
        .good { color: #4CAF50; }
        .bad { color: #ff6b6b; }
    </style>
</head>
<body>
<div class="container">
    <h1>⚙️ Teste de Carregamento da Homepage</h1>

    <div class="summary">
        <strong>Total de Testes:</strong> <?php echo count($output) + count($errors); ?><br>
        <strong class="good">✓ Sucesso:</strong> <?php echo count($output); ?><br>
        <strong class="bad">✗ Erros:</strong> <?php echo count($errors); ?>
    </div>

    <h2 style="color: #4CAF50; margin-top: 30px;">📋 Resultados dos Testes</h2>

    <?php if (count($output) > 0): ?>
        <h3>✅ Componentes Carregados com Sucesso</h3>
        <?php foreach ($output as $msg): ?>
            <div class="status ok"><?php echo htmlspecialchars($msg); ?></div>
        <?php endforeach; ?>
    <?php endif; ?>

    <?php if (count($errors) > 0): ?>
        <h3 style="color: #ff6b6b; margin-top: 30px;">❌ Erros Encontrados</h3>
        <?php foreach ($errors as $msg): ?>
            <div class="status error"><?php echo htmlspecialchars($msg); ?></div>
        <?php endforeach; ?>
        
        <div style="margin-top: 20px; padding: 15px; background: #2d2d2d; border-left: 3px solid #ff6b6b;">
            <strong>Ação Necessária:</strong><br>
            1. Abra <code>/diagnostico.php</code> para análise detalhada<br>
            2. Consulte <code>TROUBLESHOOTING.md</code> para resolução<br>
            3. Copie a mensagem de erro acima se precisar de ajuda
        </div>
    <?php else: ?>
        <div style="margin-top: 20px; padding: 15px; background: #1b5e20; border-left: 3px solid #4CAF50;">
            <strong>🎉 Tudo Funcionando!</strong><br>
            A homepage deveria carregar sem erros.<br>
            <a href="/" style="color: #4CAF50; text-decoration: underline;">→ Acesse a homepage aqui</a>
        </div>
    <?php endif; ?>

    <h2 style="color: #4CAF50; margin-top: 30px;">ℹ️ Informações do Sistema</h2>
    <pre><?php
    echo "PHP Version: " . phpversion() . "\n";
    echo "Document Root: " . $_SERVER['DOCUMENT_ROOT'] . "\n";
    echo "Current Script: " . __FILE__ . "\n";
    echo "Working Directory: " . __DIR__ . "\n";
    echo "Server: " . $_SERVER['SERVER_SOFTWARE'] . "\n";
    ?></pre>

    <footer style="text-align: center; color: #666; margin-top: 40px; padding-top: 20px; border-top: 1px solid #444;">
        Teste de Carregamento | Executive Car SP v2.0
    </footer>
</div>
</body>
</html>
