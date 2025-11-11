<?php
/**
 * Teste Simples - Verifica se PHP está funcionando
 * Acesse: www.seudominio.com/teste.php
 */
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Teste PHP - Executive Car SP</title>
    <style>
        body { font-family: Arial; margin: 40px; background: #f0f0f0; }
        .container { background: white; padding: 30px; border-radius: 5px; max-width: 600px; margin: 0 auto; }
        h1 { color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        .status { padding: 15px; border-radius: 5px; margin: 15px 0; }
        .ok { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
        pre { background: #f4f4f4; padding: 15px; border-left: 4px solid #007bff; overflow-x: auto; }
    </style>
</head>
<body>
<div class="container">
    <h1>✓ PHP Está Funcionando!</h1>
    
    <div class="status ok">
        <strong>PHP Version:</strong> <?php echo phpversion(); ?>
    </div>

    <h2>Informações do Sistema</h2>
    
    <pre><?php
    echo "Document Root: " . $_SERVER['DOCUMENT_ROOT'] . "\n";
    echo "Current Script: " . __FILE__ . "\n";
    echo "Directory: " . __DIR__ . "\n";
    echo "Server: " . $_SERVER['SERVER_SOFTWARE'] . "\n";
    echo "Os: " . php_uname() . "\n";
    ?></pre>

    <h2>Próximos Passos</h2>
    <ol>
        <li>Acesse <a href="/diagnostico.php"><code>/diagnostico.php</code></a> para verificar a estrutura do site</li>
        <li>Acesse <a href="/"><code>/</code></a> (homepage) para testar o site completo</li>
        <li>Se tiver erro 500, verifique o arquivo de log do seu servidor</li>
    </ol>

    <h2>Arquivos Principais</h2>
    <table style="width: 100%; border-collapse: collapse;">
        <tr style="background: #f9f9f9;">
            <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Arquivo</th>
            <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Status</th>
        </tr>
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;"><code>/config/config.php</code></td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                <?php echo file_exists(__DIR__ . '/config/config.php') ? '<span style="color: green;">✓</span>' : '<span style="color: red;">✗</span>'; ?>
            </td>
        </tr>
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;"><code>/includes/header.php</code></td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                <?php echo file_exists(__DIR__ . '/includes/header.php') ? '<span style="color: green;">✓</span>' : '<span style="color: red;">✗</span>'; ?>
            </td>
        </tr>
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;"><code>/includes/menu.php</code></td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                <?php echo file_exists(__DIR__ . '/includes/menu.php') ? '<span style="color: green;">✓</span>' : '<span style="color: red;">✗</span>'; ?>
            </td>
        </tr>
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;"><code>/views/index.php</code></td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                <?php echo file_exists(__DIR__ . '/views/index.php') ? '<span style="color: green;">✓</span>' : '<span style="color: red;">✗</span>'; ?>
            </td>
        </tr>
    </table>
</div>
</body>
</html>
