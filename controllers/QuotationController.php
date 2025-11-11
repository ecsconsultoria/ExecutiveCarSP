<?php
/**
 * QuotationController
 * Controlador para gerenciar cotações (por hora, por destino, etc)
 * Unifica a lógica duplicada dos arquivos por-hora.php e por-destino.php
 */

class QuotationController {
    
    private $type; // 'por-hora' ou 'por-destino'
    private $data = [];
    private $errors = [];
    private $session_keys = [];
    
    public function __construct($type = 'por-hora') {
        $this->type = $type;
        $this->initSessionKeys();
    }
    
    /**
     * Inicializa chaves de sessão conforme o tipo
     */
    private function initSessionKeys() {
        if ($this->type === 'por-hora') {
            $this->session_keys = [
                'origin' => 'origem',
                'duration' => 'duracao',
                'time' => 'hr',
                'date' => 'pickup-date'
            ];
        } elseif ($this->type === 'por-destino') {
            $this->session_keys = [
                'origin' => 'origem2',
                'destination' => 'destino',
                'time' => 'hr2',
                'date' => 'pickup-date2',
                'return_time' => 'hr_retorno',
                'return_date' => 'pickup-date_retorno'
            ];
        }
    }
    
    /**
     * Processa requisição de cotação
     */
    public function handleRequest() {
        // Valida dados de sessão iniciais
        if (!$this->validateSessionData()) {
            return $this->getError();
        }
        
        // Se é POST, processa formulário
        if (isFormSubmitted('POST')) {
            return $this->processForm();
        }
        
        // GET - carrega dados da sessão para o formulário
        return $this->loadSessionData();
    }
    
    /**
     * Valida dados iniciais da sessão
     */
    private function validateSessionData() {
        $origin_key = $this->session_keys['origin'];
        
        // Ambos tipos precisam de origem
        if (empty($_SESSION[$origin_key])) {
            return false;
        }
        
        // Por-destino precisa de destino também
        if ($this->type === 'por-destino' && empty($_SESSION[$this->session_keys['destination']])) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Retorna mensagem de erro (sessão inválida)
     */
    private function getError() {
        http_response_code(302);
        header('Location: /recalcular');
        exit;
    }
    
    /**
     * Carrega dados da sessão para usar no formulário
     */
    private function loadSessionData() {
        $result = [];
        
        foreach ($this->session_keys as $key => $session_key) {
            if (isset($_SESSION[$session_key])) {
                $result[$key] = $_SESSION[$session_key];
            }
        }
        
        return $result;
    }
    
    /**
     * Processa envio de formulário
     */
    private function processForm() {
        // Valida CSRF token
        if (!validateCSRFToken($_POST['csrf_token'] ?? '')) {
            $this->errors['csrf'] = 'Segurança: Token inválido';
            return ['valid' => false, 'errors' => $this->errors];
        }
        
        // Rate limiting - máximo 3 envios por minuto
        if (!checkRateLimit('quotation_form', 3, 60)) {
            $this->errors['rate_limit'] = 'Muitos envios. Aguarde 1 minuto e tente novamente.';
            return ['valid' => false, 'errors' => $this->errors];
        }
        
        // Define regras de validação
        $rules = $this->getValidationRules();
        
        // Valida
        $this->errors = validateForm($rules, $_POST);
        
        if (!empty($this->errors)) {
            return ['valid' => false, 'errors' => $this->errors];
        }
        
        // Extrai dados válidos
        $this->extractFormData();
        
        // Processa dados (salva, envia email, etc)
        $this->processData();
        
        return ['valid' => true, 'data' => $this->data];
    }
    
    /**
     * Define regras de validação conforme o tipo
     */
    private function getValidationRules() {
        $common_rules = [
            'nome' => 'required|min:3|max:100',
            'snome' => 'required|min:3|max:100',
            'email' => 'required|email',
            'fone' => 'required|phone',
            'tipo_veiculo' => 'required',
            'motorista' => 'required',
        ];
        
        if ($this->type === 'por-destino') {
            $common_rules['regresso'] = 'required';
        }
        
        return $common_rules;
    }
    
    /**
     * Extrai dados do formulário
     */
    private function extractFormData() {
        $this->data = [
            'nome' => sanitizeHTML($_POST['nome'] ?? ''),
            'sobrenome' => sanitizeHTML($_POST['snome'] ?? ''),
            'email' => sanitizeHTML($_POST['email'] ?? ''),
            'telefone' => sanitizeHTML($_POST['fone'] ?? ''),
            'tipo_veiculo' => sanitizeHTML($_POST['tipo_veiculo'] ?? ''),
            'motorista' => sanitizeHTML($_POST['motorista'] ?? ''),
            'mensagem' => sanitizeHTML($_POST['message'] ?? ''),
            'timestamp' => date('Y-m-d H:i:s'),
            'tipo_cotacao' => $this->type,
        ];
        
        // Adiciona dados específicos do tipo
        if ($this->type === 'por-hora') {
            $this->data['origem'] = $_SESSION[$this->session_keys['origin']] ?? '';
            $this->data['duracao'] = $_SESSION[$this->session_keys['duration']] ?? '';
            $this->data['horario'] = $_SESSION[$this->session_keys['time']] ?? '';
            $this->data['data'] = $_SESSION[$this->session_keys['date']] ?? '';
        } elseif ($this->type === 'por-destino') {
            $this->data['origem'] = $_SESSION[$this->session_keys['origin']] ?? '';
            $this->data['destino'] = $_SESSION[$this->session_keys['destination']] ?? '';
            $this->data['horario'] = $_SESSION[$this->session_keys['time']] ?? '';
            $this->data['data'] = $_SESSION[$this->session_keys['date']] ?? '';
            $this->data['tem_retorno'] = !empty($_POST['regresso']);
            
            if ($this->data['tem_retorno']) {
                $this->data['horario_retorno'] = $_POST['hora_retorno'] ?? '';
                $this->data['data_retorno'] = $_POST['pickup-date_retorno'] ?? '';
            }
        }
    }
    
    /**
     * Processa dados (salva em arquivo, BD, ou envia email)
     */
    private function processData() {
        // Opção 1: Salva em arquivo JSON
        $this->saveToJSON();
        
        // Opção 2: Envia email (descomente quando configurar)
        // $this->sendEmail();
        
        // Armazena em sessão para a página de confirmação
        $_SESSION['quotation_data'] = $this->data;
        $_SESSION['quotation_success'] = true;
    }
    
    /**
     * Salva cotação em arquivo JSON
     */
    private function saveToJSON() {
        $dir = __DIR__ . '/../data/quotations';
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        
        $filename = $dir . '/' . date('Y-m-d') . '_quotations.json';
        $quotations = [];
        
        if (file_exists($filename)) {
            $content = file_get_contents($filename);
            $quotations = json_decode($content, true) ?? [];
        }
        
        $quotations[] = $this->data;
        
        file_put_contents($filename, json_encode($quotations, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }
    
    /**
     * Envia email da cotação
     */
    private function sendEmail() {
        $to = BUSINESS_EMAIL;
        $subject = 'Nova Cotação - ' . ucfirst(str_replace('-', ' ', $this->type)) . ' - ' . $this->data['nome'];
        
        $body = $this->getEmailBody();
        
        $headers = [
            'MIME-Version: 1.0',
            'Content-type: text/html; charset=UTF-8',
            'From: noreply@' . SITE_DOMAIN,
            'Reply-To: ' . $this->data['email']
        ];
        
        mail($to, $subject, $body, implode("\r\n", $headers));
        
        // Envia confirmação para cliente
        $this->sendClientConfirmation();
    }
    
    /**
     * Monta corpo do email
     */
    private function getEmailBody() {
        ob_start();
        ?>
        <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <h2>Nova Cotação Recebida</h2>
            <hr>
            
            <h3>Informações do Cliente</h3>
            <p><strong>Nome:</strong> <?php echo htmlspecialchars($this->data['nome'] . ' ' . $this->data['sobrenome']); ?></p>
            <p><strong>Email:</strong> <?php echo htmlspecialchars($this->data['email']); ?></p>
            <p><strong>Telefone:</strong> <?php echo htmlspecialchars($this->data['telefone']); ?></p>
            
            <h3>Detalhes da Cotação</h3>
            <p><strong>Tipo:</strong> <?php echo ucfirst(str_replace('-', ' ', $this->data['tipo_cotacao'])); ?></p>
            <p><strong>Data/Hora:</strong> <?php echo htmlspecialchars($this->data['timestamp']); ?></p>
            
            <?php if ($this->type === 'por-hora') { ?>
                <p><strong>Origem:</strong> <?php echo htmlspecialchars($this->data['origem']); ?></p>
                <p><strong>Duração:</strong> <?php echo htmlspecialchars($this->data['duracao']); ?></p>
                <p><strong>Horário:</strong> <?php echo htmlspecialchars($this->data['horario']); ?></p>
            <?php } elseif ($this->type === 'por-destino') { ?>
                <p><strong>Origem:</strong> <?php echo htmlspecialchars($this->data['origem']); ?></p>
                <p><strong>Destino:</strong> <?php echo htmlspecialchars($this->data['destino']); ?></p>
                <p><strong>Data/Hora:</strong> <?php echo htmlspecialchars($this->data['data'] . ' ' . $this->data['horario']); ?></p>
                <?php if ($this->data['tem_retorno']) { ?>
                    <p><strong>Retorno:</strong> <?php echo htmlspecialchars($this->data['data_retorno'] . ' ' . $this->data['horario_retorno']); ?></p>
                <?php } ?>
            <?php } ?>
            
            <p><strong>Tipo de Veículo:</strong> <?php echo htmlspecialchars($this->data['tipo_veiculo']); ?></p>
            <p><strong>Motorista:</strong> <?php echo htmlspecialchars($this->data['motorista']); ?></p>
            
            <?php if (!empty($this->data['mensagem'])) { ?>
                <h3>Mensagem</h3>
                <p><?php echo nl2br(htmlspecialchars($this->data['mensagem'])); ?></p>
            <?php } ?>
            
        </body>
        </html>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Envia email de confirmação para o cliente
     */
    private function sendClientConfirmation() {
        $to = $this->data['email'];
        $subject = 'Cotação Recebida - ' . BUSINESS_NAME;
        
        $body = <<<HTML
        <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <h2>Obrigado pela sua cotação!</h2>
            <p>Olá {$this->data['nome']},</p>
            <p>Recebemos sua solicitação de cotação e entraremos em contato em breve.</p>
            <p>Nossa equipe está pronta para atendê-lo!</p>
            <hr>
            <p><strong>Contato:</strong></p>
            <p>Telefone: <a href="tel:" . BUSINESS_PHONE . "\">" . BUSINESS_PHONE . "</a></p>
            <p>WhatsApp: <a href=\"" . BUSINESS_WHATSAPP_LINK . "\">" . BUSINESS_WHATSAPP . "</a></p>
            <p>Email: <a href=\"mailto:" . BUSINESS_EMAIL . "\">" . BUSINESS_EMAIL . "</a></p>
        </body>
        </html>
        HTML;
        
        $headers = [
            'MIME-Version: 1.0',
            'Content-type: text/html; charset=UTF-8',
            'From: ' . BUSINESS_NAME . ' <noreply@' . SITE_DOMAIN . '>',
        ];
        
        mail($to, $subject, $body, implode("\r\n", $headers));
    }
    
    /**
     * Getter para dados da cotação
     */
    public function getData() {
        return $this->data;
    }
    
    /**
     * Getter para erros
     */
    public function getErrors() {
        return $this->errors;
    }
    
    /**
     * Verifica se há erros
     */
    public function hasErrors() {
        return !empty($this->errors);
    }
}

?>
