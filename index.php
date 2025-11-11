<?php
/**
 * Executive Car SP - Index/Router Principal
 * Versão: 2.0 (Refatorado)
 * Data: 2025-11-11
 * 
 * Sistema de roteamento simples para renderizar as páginas corretas
 */

// Marcador para includes de segurança
define('EXEC_FROM_INDEX', true);

// Carrega configuração
require_once 'config/config.php';

// Carrega funções de segurança
require_once 'includes/security.php';

// Carrega controllers
require_once 'controllers/QuotationController.php';

// Obtém a página solicitada
$page = isset($_GET['page']) ? trim($_GET['page'], '/') : 'index';

// Sanitiza o nome da página (apenas a-z, 0-9, hífen)
$page = preg_replace('/[^a-zA-Z0-9\-]/', '', $page);

// Se vazio, usa index
if (empty($page)) {
    $page = 'index';
}

// Define mapeamento de rotas
$routes = [
    // Páginas principais
    'index' => 'views/index.php',
    '' => 'views/index.php',
    
    // Cotações
    'por-hora' => 'views/por-hora.php',
    'por-destino' => 'views/por-destino.php',
    'recalcular' => 'views/recalcular.php',
    
    // Serviços específicos
    'transfer-de-aeroportos' => 'views/transfer-de-aeroportos.php',
    'chaufeur-particular' => 'views/chaufeur-particular.php',
    'aluguel-de-carro-para-casamento' => 'views/aluguel-de-carro-para-casamento.php',
    'aluguel-de-carro-para-eventos-e-baladas' => 'views/aluguel-de-carro-para-eventos-e-baladas.php',
    'aluguel-de-carros-para-viagens' => 'views/aluguel-de-carros-para-viagens.php',
    'city-tour' => 'views/city-tour.php',
    
    // Páginas informativos
    'nossa-frota' => 'views/nossa-frota.php',
    'quem-somos' => 'views/quem-somos.php',
    'contato' => 'views/contato.php',
    'politica-privacidade' => 'views/politica-privacidade.php',
    'termos-servico' => 'views/termos-servico.php',
];

// Carrega header HTML (com meta tags)
include 'includes/header.php';

// Carrega menu
include 'includes/menu.php';

// Renderiza a página ou 404
if (array_key_exists($page, $routes)) {
    $view_file = $routes[$page];
    
    if (file_exists($view_file)) {
        include $view_file;
    } else {
        http_response_code(404);
        include 'views/erro-404.php';
    }
} else {
    http_response_code(404);
    include 'views/erro-404.php';
}

// Carrega footer
include 'includes/footer.php';

?>
