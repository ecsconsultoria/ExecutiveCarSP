<?php
/**
 * Segurança e Validação
 * Funções para proteção contra XSS, CSRF, SQL Injection, etc.
 */

// Iniciar sessão segura
if (defined('ENABLE_SESSION') && ENABLE_SESSION && session_status() === PHP_SESSION_NONE) {
    session_start();
    
    // Configurações de segurança da sessão
    ini_set('session.use_only_cookies', 1);
    ini_set('session.cookie_httponly', 1);
    if (defined('REQUIRE_HTTPS') && REQUIRE_HTTPS) {
        ini_set('session.cookie_secure', 1);
    }
}

/**
 * CSRF Protection - Gera token
 */
function generateCSRFToken() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

/**
 * CSRF Protection - Valida token
 */
function validateCSRFToken($token) {
    return !empty($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * CSRF Token Field para formulários
 */
function csrfTokenField() {
    return '<input type="hidden" name="csrf_token" value="' . generateCSRFToken() . '">';
}

/**
 * Sanitiza string para HTML
 */
function sanitizeHTML($input) {
    if (is_array($input)) {
        foreach ($input as $key => $value) {
            $input[$key] = sanitizeHTML($value);
        }
        return $input;
    }
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

/**
 * Sanitiza para uso em atributo HTML
 */
function sanitizeAttr($input) {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

/**
 * Sanitiza entrada de formulário POST/GET
 */
function getInput($key, $default = '', $sanitize = true) {
    $value = $_REQUEST[$key] ?? $default;
    
    if ($sanitize && !empty($value)) {
        $value = sanitizeHTML($value);
    }
    
    return $value;
}

/**
 * Valida dados de um formulário
 * 
 * Uso:
 * $errors = validateForm([
 *     'nome' => 'required|min:3|max:100',
 *     'email' => 'required|email',
 *     'telefone' => 'required|phone',
 * ], $_POST);
 */
function validateForm($rules, $data) {
    $errors = [];
    
    foreach ($rules as $field => $rule_string) {
        $rules_array = array_map('trim', explode('|', $rule_string));
        $value = $data[$field] ?? '';
        
        foreach ($rules_array as $rule) {
            // Parse rule com parâmetros: rule:param1,param2
            $rule_parts = explode(':', $rule);
            $rule_name = $rule_parts[0];
            $rule_params = isset($rule_parts[1]) ? array_map('trim', explode(',', $rule_parts[1])) : [];
            
            switch ($rule_name) {
                case 'required':
                    if (empty($value)) {
                        $errors[$field] = ucfirst($field) . ' é obrigatório';
                    }
                    break;
                    
                case 'email':
                    if (!empty($value) && !validateEmail($value)) {
                        $errors[$field] = 'Email inválido';
                    }
                    break;
                    
                case 'phone':
                    if (!empty($value) && !validatePhone($value)) {
                        $errors[$field] = 'Telefone inválido';
                    }
                    break;
                    
                case 'min':
                    if (!empty($value) && strlen($value) < (int)$rule_params[0]) {
                        $errors[$field] = ucfirst($field) . ' deve ter no mínimo ' . $rule_params[0] . ' caracteres';
                    }
                    break;
                    
                case 'max':
                    if (!empty($value) && strlen($value) > (int)$rule_params[0]) {
                        $errors[$field] = ucfirst($field) . ' deve ter no máximo ' . $rule_params[0] . ' caracteres';
                    }
                    break;
                    
                case 'numeric':
                    if (!empty($value) && !is_numeric($value)) {
                        $errors[$field] = ucfirst($field) . ' deve ser um número';
                    }
                    break;
                    
                case 'url':
                    if (!empty($value) && !filter_var($value, FILTER_VALIDATE_URL)) {
                        $errors[$field] = 'URL inválida';
                    }
                    break;
                    
                case 'date':
                    if (!empty($value) && !validateDate($value, 'Y-m-d')) {
                        $errors[$field] = 'Data inválida (use formato YYYY-MM-DD)';
                    }
                    break;
            }
        }
    }
    
    return $errors;
}

/**
 * Valida se uma string é uma data válida
 */
function validateDate($date, $format = 'Y-m-d') {
    $d = DateTime::createFromFormat($format, $date);
    return $d && $d->format($format) === $date;
}

/**
 * Rate limiting simples (anti-spam)
 * 
 * Uso:
 * if (!checkRateLimit('form_submission', 5, 60)) {
 *     die('Muitos envios. Tente novamente em 1 minuto.');
 * }
 */
function checkRateLimit($key, $max_attempts = 5, $time_window = 60) {
    $session_key = 'rate_limit_' . $key;
    
    if (!isset($_SESSION[$session_key])) {
        $_SESSION[$session_key] = [
            'attempts' => 0,
            'first_attempt' => time()
        ];
    }
    
    $attempt_data = $_SESSION[$session_key];
    $time_elapsed = time() - $attempt_data['first_attempt'];
    
    // Reset se passou o time_window
    if ($time_elapsed > $time_window) {
        $_SESSION[$session_key] = [
            'attempts' => 1,
            'first_attempt' => time()
        ];
        return true;
    }
    
    // Incrementa tentativa
    $_SESSION[$session_key]['attempts']++;
    
    return $_SESSION[$session_key]['attempts'] <= $max_attempts;
}

/**
 * Verifica se é uma requisição AJAX
 */
function isAjax() {
    return !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && 
           strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
}

/**
 * Retorna JSON com validação de headers
 */
function returnJSON($data, $status_code = 200) {
    http_response_code($status_code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit;
}

/**
 * Log de erro/evento
 */
function logError($message, $type = 'error') {
    $log_dir = __DIR__ . '/../logs';
    if (!is_dir($log_dir)) {
        mkdir($log_dir, 0755, true);
    }
    
    $log_file = $log_dir . '/' . date('Y-m-d') . '.log';
    $log_message = '[' . date('Y-m-d H:i:s') . '] [' . strtoupper($type) . '] ' . $message . PHP_EOL;
    
    file_put_contents($log_file, $log_message, FILE_APPEND);
}

/**
 * Redireciona com segurança
 */
function redirect($url, $permanent = false) {
    // Valida se URL é interna ou externa segura
    if (strpos($url, 'javascript:') === 0 || strpos($url, 'data:') === 0) {
        $url = SITE_URL;
    }
    
    header('Location: ' . $url, true, $permanent ? 301 : 302);
    exit;
}

/**
 * Verifica se formulário foi submetido via POST
 */
function isFormSubmitted($method = 'POST') {
    return $_SERVER['REQUEST_METHOD'] === $method;
}

?>
