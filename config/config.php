<?php
/**
 * Configurações Centralizadas - Executive Car SP
 * Versão: 2.0
 * Data: 2025-11-11
 */

// Previne acesso direto
if (!defined('EXEC_FROM_INDEX')) {
    define('EXEC_FROM_INDEX', true);
}

// ============================================
// CONFIGURAÇÕES GERAIS
// ============================================

define('SITE_URL', 'https://www.executivecarsp.com');
define('SITE_PROTOCOL', (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? 'https' : 'http');
define('SITE_DOMAIN', $_SERVER['HTTP_HOST'] ?? 'executivecarsp.com');

// ============================================
// DADOS DA EMPRESA
// ============================================

define('BUSINESS_NAME', 'Executive Car SP');
define('BUSINESS_FULL_NAME', 'Executive Car SP - Aluguel de Carros Executivos com Motorista');
define('BUSINESS_DESCRIPTION', 'Somos uma empresa especializada em aluguel de veículos executivos com motoristas, atendendo empresas, entidades e particulares para transporte em aeroportos, eventos, congressos e viagens.');

// Contato
define('BUSINESS_PHONE', '+55 (11) 2371-1500');
define('BUSINESS_WHATSAPP', '+55 (11) 98917-8312');
define('BUSINESS_EMAIL', 'contact@executivecarsp.com');
define('BUSINESS_WHATSAPP_LINK', 'https://wa.me/5511989178312');

// Endereço
define('BUSINESS_STREET', 'Av. Eng. Luiz Carlos Berrini, 828');
define('BUSINESS_SUITE', 'CJ 32');
define('BUSINESS_CITY', 'São Paulo');
define('BUSINESS_STATE', 'SP');
define('BUSINESS_ZIP', '04571-130');
define('BUSINESS_COUNTRY', 'BR');
define('BUSINESS_LAT', '-23.5917');
define('BUSINESS_LONG', '-46.6845');

// ============================================
// HORÁRIO COMERCIAL
// ============================================

define('BUSINESS_HOURS_START', '09:00');
define('BUSINESS_HOURS_END', '18:00');
define('BUSINESS_HOURS_TEXT', 'Segunda a Sexta - 09:00h às 18:00h');

// ============================================
// META TAGS E SEO
// ============================================

$META_PAGES = [
    'index' => [
        'title' => 'Aluguel de Carros Executivos com Motorista em São Paulo | Executive Car SP',
        'description' => 'Aluguel de sedans convencionais, blindados e vans executivas com motorista profissional. Atendimento 24h para aeroportos, eventos e transporte corporativo em São Paulo.',
        'keywords' => 'aluguel carro motorista são paulo, sedans executivos, vans, carros blindados, transporte corporativo',
        'image' => '/images/og-image-home.jpg',
    ],
    'por-hora' => [
        'title' => 'Aluguel de Carro com Motorista por Hora em São Paulo | Executive Car SP',
        'description' => 'Contrate um carro com motorista profissional por hora. Frota de sedans e vans executivas. Cotação rápida online.',
        'keywords' => 'aluguel carro hora são paulo, carro com motorista, transporte corporativo',
        'image' => '/images/og-image-por-hora.jpg',
    ],
    'por-destino' => [
        'title' => 'Aluguel de Carro com Motorista para Viagens em São Paulo',
        'description' => 'Serviço de aluguel de carro com motorista para qualquer destino. Viagens seguras, confortáveis e pontuais.',
        'keywords' => 'aluguel carro viagem, transfer aeroporto, transporte são paulo',
        'image' => '/images/og-image-por-destino.jpg',
    ],
    'transfer-de-aeroportos' => [
        'title' => 'Transfer de Aeroportos em São Paulo | Executive Car SP',
        'description' => 'Transfer executivo para os aeroportos de São Paulo. Carros com motorista profissional, horário certo, melhor preço.',
        'keywords' => 'transfer aeroporto são paulo, carro motorista congonhas, aeroporto internacional',
        'image' => '/images/og-image-aeroporto.jpg',
    ],
    'chaufeur-particular' => [
        'title' => 'Motorista Particular em São Paulo | Serviço Executivo | Executive Car SP',
        'description' => 'Contrate um motorista particular profissional para sua frota ou eventos. Discrição, pontualidade e segurança garantidas.',
        'keywords' => 'motorista particular são paulo, chaufeur, motorista executivo',
        'image' => '/images/og-image-chaufeur.jpg',
    ],
    'aluguel-de-carro-para-casamento' => [
        'title' => 'Aluguel de Carro para Casamento em São Paulo | Executive Car SP',
        'description' => 'Carro executivo com motorista para seu casamento. Frota impecável, pontualidade garantida, serviço premium.',
        'keywords' => 'carro casamento são paulo, noivos, transporte casamento',
        'image' => '/images/og-image-casamento.jpg',
    ],
    'aluguel-de-carro-para-eventos-e-baladas' => [
        'title' => 'Aluguel de Carro para Eventos e Baladas em São Paulo',
        'description' => 'Transporte seguro e confortável para seus eventos e baladas. Motoristas profissionais, frota luxuosa.',
        'keywords' => 'carro eventos são paulo, transporte balada, motorista noite',
        'image' => '/images/og-image-eventos.jpg',
    ],
    'aluguel-de-carros-para-viagens' => [
        'title' => 'Aluguel de Carros para Viagens em São Paulo | Executive Car SP',
        'description' => 'Carros executivos para longas viagens. Conforto, segurança e motorista profissional a sua disposição.',
        'keywords' => 'aluguel carro viagem, carro para viajar, transporte longa distância',
        'image' => '/images/og-image-viagens.jpg',
    ],
    'city-tour' => [
        'title' => 'City Tour em São Paulo com Motorista Profissional | Executive Car SP',
        'description' => 'Conheça São Paulo em estilo com nossos city tours. Motorista profissional, roteiros personalizados.',
        'keywords' => 'city tour são paulo, passeio são paulo, motorista tour',
        'image' => '/images/og-image-city-tour.jpg',
    ],
    'nossa-frota' => [
        'title' => 'Nossa Frota | Executive Car SP',
        'description' => 'Conheça nossa frota de carros executivos: sedans convencionais, blindados e vans premium.',
        'keywords' => 'carros executivos, sedans, vans, frota de carros',
        'image' => '/images/og-image-frota.jpg',
    ],
    'quem-somos' => [
        'title' => 'Quem Somos | Executive Car SP',
        'description' => 'Somos especialistas em aluguel de carros executivos com motorista desde 2010.',
        'keywords' => 'sobre executive car sp, nossa história, quem somos',
        'image' => '/images/og-image-empresa.jpg',
    ],
    'contato' => [
        'title' => 'Contato | Executive Car SP',
        'description' => 'Fale conosco! Cotação em 15 minutos. Telefone, WhatsApp, email ou formulário online.',
        'keywords' => 'contato executive car sp, fale conosco',
        'image' => '/images/og-image-contato.jpg',
    ],
];

// ============================================
// REDES SOCIAIS
// ============================================

define('SOCIAL_FACEBOOK', 'https://www.facebook.com/ExecutiveCarSP');
define('SOCIAL_INSTAGRAM', 'https://www.instagram.com/executivecarsp');
define('SOCIAL_LINKEDIN', 'https://www.linkedin.com/company/executive-car-sp');

// ============================================
// SEGURANÇA
// ============================================

define('ENABLE_SESSION', true);
define('SESSION_TIMEOUT', 3600); // 1 hora
define('MAX_LOGIN_ATTEMPTS', 5);
define('REQUIRE_HTTPS', true);

// ============================================
// PERFORMANCE
// ============================================

define('CACHE_ENABLED', true);
define('CACHE_TIME', 3600); // 1 hora
define('MINIFY_CSS', true);
define('MINIFY_JS', true);

// ============================================
// AMBIENTE
// ============================================

define('ENVIRONMENT', 'production'); // 'development' ou 'production'
define('DEBUG_MODE', (ENVIRONMENT === 'development'));

if (DEBUG_MODE) {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', 0);
    ini_set('display_startup_errors', 0);
    error_reporting(E_ALL);
    ini_set('log_errors', 1);
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Obtém meta tags para uma página específica
 */
function getMetaTags($page = 'index') {
    global $META_PAGES;
    return $META_PAGES[$page] ?? $META_PAGES['index'];
}

/**
 * Formata endereço completo
 */
function getFullAddress() {
    return BUSINESS_STREET . ', ' . BUSINESS_SUITE . ' - ' . BUSINESS_CITY . ', ' . BUSINESS_STATE;
}

/**
 * Formata endereço para Schema.org
 */
function getAddressSchema() {
    return [
        '@type' => 'PostalAddress',
        'streetAddress' => BUSINESS_STREET,
        'addressLocality' => BUSINESS_CITY,
        'addressRegion' => BUSINESS_STATE,
        'postalCode' => BUSINESS_ZIP,
        'addressCountry' => BUSINESS_COUNTRY
    ];
}

/**
 * Obtém URL atual normalizada
 */
function getCurrentPage() {
    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $uri = str_replace('/index.php', '', $uri);
    $uri = trim($uri, '/');
    return $uri ?: 'index';
}

/**
 * Sanitiza entrada
 */
function sanitize($input) {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

/**
 * Valida email
 */
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Valida telefone brasileiro
 */
function validatePhone($phone) {
    $phone = preg_replace('/\D/', '', $phone);
    return strlen($phone) >= 10 && strlen($phone) <= 11;
}

?>
