<?php
/**
 * Página de Sucesso - Cotação Enviada
 */

$quotation_data = $_SESSION['quotation_data'] ?? null;
$success = $_SESSION['quotation_success'] ?? false;

// Limpa a sessão após mostrar
if ($success) {
    unset($_SESSION['quotation_success']);
    unset($_SESSION['quotation_data']);
}

?>

<div class="content-area clearfix">
    <div class="inner-wrapper">
        
        <div class="page-title" style="background-color: #e8f5e9;">
            <div class="page-title-inner">
                <h1><i class="fa fa-check-circle" style="color: #4caf50;"></i> Cotação Enviada com Sucesso!</h1>
            </div>
        </div>
        
        <div class="two-third">
            <div class="post">
                
                <h2>Obrigado pela sua solicitação!</h2>
                
                <div class="success-message" style="background-color: #f1f8f6; padding: 20px; border-left: 4px solid #4caf50; margin: 20px 0;">
                    <p><strong>Sua cotação foi recebida com sucesso.</strong></p>
                    <p>Nossa equipe entrará em contato em breve para confirmar e detalhar os valores.</p>
                </div>
                
                <?php if ($quotation_data): ?>
                    <h3>Resumo da Cotação</h3>
                    <table class="table" style="border: 1px solid #ddd;">
                        <tbody>
                            <?php if (!empty($quotation_data['nome'])): ?>
                                <tr>
                                    <td><strong>Nome:</strong></td>
                                    <td><?php echo htmlspecialchars($quotation_data['nome'] . ' ' . $quotation_data['sobrenome']); ?></td>
                                </tr>
                            <?php endif; ?>
                            
                            <?php if (!empty($quotation_data['email'])): ?>
                                <tr>
                                    <td><strong>Email:</strong></td>
                                    <td><?php echo htmlspecialchars($quotation_data['email']); ?></td>
                                </tr>
                            <?php endif; ?>
                            
                            <?php if (!empty($quotation_data['telefone'])): ?>
                                <tr>
                                    <td><strong>Telefone:</strong></td>
                                    <td><?php echo htmlspecialchars($quotation_data['telefone']); ?></td>
                                </tr>
                            <?php endif; ?>
                            
                            <?php if (!empty($quotation_data['tipo_cotacao'])): ?>
                                <tr>
                                    <td><strong>Tipo de Serviço:</strong></td>
                                    <td><?php echo htmlspecialchars(ucfirst(str_replace('-', ' ', $quotation_data['tipo_cotacao']))); ?></td>
                                </tr>
                            <?php endif; ?>
                            
                            <?php if (!empty($quotation_data['origem'])): ?>
                                <tr>
                                    <td><strong>Origem:</strong></td>
                                    <td><?php echo htmlspecialchars($quotation_data['origem']); ?></td>
                                </tr>
                            <?php endif; ?>
                            
                            <?php if (!empty($quotation_data['destino'])): ?>
                                <tr>
                                    <td><strong>Destino:</strong></td>
                                    <td><?php echo htmlspecialchars($quotation_data['destino']); ?></td>
                                </tr>
                            <?php endif; ?>
                            
                            <?php if (!empty($quotation_data['duracao'])): ?>
                                <tr>
                                    <td><strong>Duração:</strong></td>
                                    <td><?php echo htmlspecialchars($quotation_data['duracao']); ?></td>
                                </tr>
                            <?php endif; ?>
                            
                            <?php if (!empty($quotation_data['tipo_veiculo'])): ?>
                                <tr>
                                    <td><strong>Tipo de Veículo:</strong></td>
                                    <td><?php echo htmlspecialchars($quotation_data['tipo_veiculo']); ?></td>
                                </tr>
                            <?php endif; ?>
                            
                            <?php if (!empty($quotation_data['motorista'])): ?>
                                <tr>
                                    <td><strong>Motorista:</strong></td>
                                    <td><?php echo htmlspecialchars($quotation_data['motorista']); ?></td>
                                </tr>
                            <?php endif; ?>
                            
                            <?php if (!empty($quotation_data['timestamp'])): ?>
                                <tr>
                                    <td><strong>Data/Hora:</strong></td>
                                    <td><?php echo htmlspecialchars($quotation_data['timestamp']); ?></td>
                                </tr>
                            <?php endif; ?>
                        </tbody>
                    </table>
                <?php endif; ?>
                
                <h3>Próximos Passos</h3>
                <ol>
                    <li>Receberá um email de confirmação em alguns minutos</li>
                    <li>Nossa equipe analisará sua solicitação</li>
                    <li>Entraremos em contato via <strong>telefone ou WhatsApp</strong> em até 1 hora (horário comercial)</li>
                    <li>Você receberá um orçamento detalhado</li>
                </ol>
                
                <h3>Formas de Contato</h3>
                <p>Se precisar falar conosco antes, use um dos canais abaixo:</p>
                <ul>
                    <li><strong>Telefone:</strong> <a href="tel:<?php echo str_replace(['(', ')', ' ', '-'], '', BUSINESS_PHONE); ?>"><?php echo BUSINESS_PHONE; ?></a></li>
                    <li><strong>WhatsApp:</strong> <a href="<?php echo BUSINESS_WHATSAPP_LINK; ?>" target="_blank" rel="noopener noreferrer"><?php echo BUSINESS_WHATSAPP; ?></a></li>
                    <li><strong>Email:</strong> <a href="mailto:<?php echo BUSINESS_EMAIL; ?>"><?php echo BUSINESS_EMAIL; ?></a></li>
                </ul>
                
            </div>
        </div>
        
        <div class="one-third last">
            <div class="sidebar">
                
                <div class="widget">
                    <h3>Tem dúvidas?</h3>
                    <div class="widget-content">
                        <p>Clique no botão abaixo para conversar direto no WhatsApp:</p>
                        <a href="<?php echo BUSINESS_WHATSAPP_LINK; ?>" target="_blank" rel="noopener noreferrer" class="btn btn-success btn-block">
                            <i class="fa fa-whatsapp"></i> Chat WhatsApp
                        </a>
                    </div>
                </div>
                
                <div class="widget">
                    <h3>Outras Opções</h3>
                    <div class="widget-content">
                        <ul>
                            <li><a href="/por-hora">Ver outros serviços</a></li>
                            <li><a href="/nossa-frota">Conhecer nossa frota</a></li>
                            <li><a href="//">Voltar para Home</a></li>
                        </ul>
                    </div>
                </div>
                
            </div>
        </div>
        
    </div>
</div>
