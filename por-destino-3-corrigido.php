<?php
// Inicia o buffer de saída para evitar problemas com headers
ob_start();

// Inicia a sessão
session_start();

// Definir campos obrigatórios e opcionais
$required = [
    'origem2', 'destino', 'hr2', 'min2', 'pickup-date2',
    'nome', 'fone', 'email'
];

$optional = [
    'snome', 'veiculo', 'comentarios',
    'hr_retorno', 'min_retorno', 'pickup-date_retorno'
];

// Tentativa de preencher a sessão a partir de dados enviados (POST/REQUEST)
$candidates = array_merge($required, $optional);
foreach ($candidates as $key) {
    if ((empty($_SESSION[$key]) || !isset($_SESSION[$key])) && isset($_REQUEST[$key])) {
        // copia do request para sessão (sanitize mínima)
        $_SESSION[$key] = is_string($_REQUEST[$key]) ? trim($_REQUEST[$key]) : $_REQUEST[$key];
    }
}

// Verifica obrigatórios e relata quais estão faltando
$missing = [];
foreach ($required as $s) {
    if (!isset($_SESSION[$s]) || (is_string($_SESSION[$s]) && trim($_SESSION[$s]) === '')) {
        $missing[] = $s;
    }
}

if (!empty($missing)) {
    // Mensagem mais informativa para facilitar correção
    $readable = implode(', ', $missing);
    // Em ambiente de produção, considere redirecionar com mensagem de erro em vez de die()
    die('Erro: campos obrigatórios ausentes na sessão: ' . $readable);
}

// Captura dados da sessão com sanitização (campos opcionais recebem padrão vazio)
$sess_origem = htmlspecialchars($_SESSION['origem2']);
$sess_destino = htmlspecialchars($_SESSION['destino']);
$sess_hr = htmlspecialchars($_SESSION['hr2']);
$sess_min = htmlspecialchars($_SESSION['min2']);
$sess_data = htmlspecialchars($_SESSION['pickup-date2']);

$sess_nome = htmlspecialchars($_SESSION['nome']);
$sess_snome = isset($_SESSION['snome']) ? htmlspecialchars($_SESSION['snome']) : '';
$sess_fone = htmlspecialchars($_SESSION['fone']);
$sess_email = filter_var($_SESSION['email'], FILTER_SANITIZE_EMAIL);
$sess_veiculo = isset($_SESSION['veiculo']) ? htmlspecialchars($_SESSION['veiculo']) : '';
$sess_comentarios = isset($_SESSION['comentarios']) ? htmlspecialchars($_SESSION['comentarios']) : '';

// Campos de retorno são opcionais
$sess_hr_retorno = isset($_SESSION['hr_retorno']) ? htmlspecialchars($_SESSION['hr_retorno']) : '';
$sess_min_retorno = isset($_SESSION['min_retorno']) ? htmlspecialchars($_SESSION['min_retorno']) : '';
$sess_data_retorno = isset($_SESSION['pickup-date_retorno']) ? htmlspecialchars($_SESSION['pickup-date_retorno']) : '';

// Configurações do email
$destinatario = "thiagomancini@mancinidesign.com.br";

// Corpo da mensagem
$msg = "
<html>
<head>
    <title>Nova Reserva por Destino</title>
</head>
<body>
    <h2>Detalhes da Reserva</h2>
    <p><strong>Nome:</strong> {$sess_nome} {$sess_snome}</p>
    <p><strong>Telefone:</strong> {$sess_fone}</p>
    <p><strong>Email:</strong> {$sess_email}</p>
    <p><strong>Veículo:</strong> {$sess_veiculo}</p>
    <p><strong>Origem:</strong> {$sess_origem}</p>
    <p><strong>Destino:</strong> {$sess_destino}</p>
    <p><strong>Data/Hora:</strong> {$sess_data} {$sess_hr}:{$sess_min}</p>
    <p><strong>Retorno:</strong> {$sess_data_retorno} {$sess_hr_retorno}:{$sess_min_retorno}</p>
    <p><strong>Comentários:</strong> {$sess_comentarios}</p>
</body>
</html>";

// Configuração do PHPMailer
require("phpmailer/class.phpmailer.php");

try {
    $mail = new PHPMailer(true); // true habilita exceções
    $mail->SetLanguage("br");
    $mail->IsSMTP();
    $mail->IsHTML(true);
    $mail->CharSet = 'UTF-8';
    
    // Configurações SMTP
    $mail->Host = "mail.executivecarsp.com";
    $mail->SMTPAuth = true;
    $mail->SMTPSecure = "tls"; // ou 'ssl'
    $mail->Port = 587; // ou 465 para SSL
    
    // Credenciais (recomenda-se mover para arquivo .env)
    $mail->Username = "contact@executivecarsp.com";
    $mail->Password = "@Executive010610";
    
    // Remetente e destinatário
    $mail->From = $sess_email;
    $mail->FromName = $sess_nome . ' ' . $sess_snome;
    $mail->AddAddress($destinatario);
    
    // Conteúdo
    $mail->Subject = "Nova Reserva por Destino";
    $mail->Body = $msg;
    
    // Envia o email
    if($mail->Send()) {
        // Limpa o buffer antes do redirecionamento
        ob_end_clean();
        header('Location: mensagem-enviada');
        exit();
    } else {
        throw new Exception("Erro ao enviar email: " . $mail->ErrorInfo);
    }
} catch (Exception $e) {
    error_log("Erro no envio de email: " . $e->getMessage());
    die("Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.");
}
?>