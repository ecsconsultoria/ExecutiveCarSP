<?php
/**
 * View - Aluguel por Hora
 * Refatorado para usar QuotationController
 */

// Inicializa controller
$controller = new QuotationController('por-hora');

// Processa requisição
$result = $controller->handleRequest();

// Extrai variáveis para uso na view
$errors = $controller->getErrors();
$session_data = $result;

// Se foi submetido com sucesso
if (isFormSubmitted('POST') && $result['valid'] ?? false) {
    header('Location: /mensagem-enviada');
    exit;
}

?>

<!-- BEGIN content -->
<div class="content-area clearfix">
    
    <!-- BEGIN .inner-wrapper -->
    <div class="inner-wrapper">
        
        <!-- Page Title -->
        <div class="page-title" style="background-image: url('/images/banner-por-hora.jpg');">
            <div class="page-title-inner">
                <h1>Aluguel por Hora</h1>
                <p>Contrate um carro com motorista profissional por hora</p>
            </div>
        </div>
        
        <!-- BEGIN main content -->
        <div class="two-third">
            
            <div class="post">
                
                <h2>Calcular Cotação</h2>
                <p>Preencha os dados abaixo para receber uma cotação rápida e sem compromisso.</p>
                
                <?php if (!empty($errors) && isset($errors['csrf'])): ?>
                    <div class="alert alert-danger">
                        <strong>Erro de Segurança:</strong> Tente enviar o formulário novamente.
                    </div>
                <?php endif; ?>
                
                <form method="POST" action="" class="quotation-form">
                    
                    <!-- CSRF Token -->
                    <?php echo csrfTokenField(); ?>
                    
                    <fieldset>
                        <legend>Dados da Cotação</legend>
                        
                        <div class="form-group">
                            <label for="origem">Ponto de Partida *</label>
                            <input 
                                type="text" 
                                id="origem" 
                                name="origem" 
                                value="<?php echo sanitizeAttr($session_data['origin'] ?? ''); ?>" 
                                class="form-control" 
                                required
                                placeholder="Ex: Av. Paulista, 1000"
                            >
                        </div>
                        
                        <div class="form-group">
                            <label for="duracao">Duração da Locação *</label>
                            <select id="duracao" name="duracao" class="form-control" required>
                                <option value="">Selecione a duração</option>
                                <option value="1h" <?php echo ($session_data['duration'] ?? '') == '1h' ? 'selected' : ''; ?>>1 Hora</option>
                                <option value="4h" <?php echo ($session_data['duration'] ?? '') == '4h' ? 'selected' : ''; ?>>4 Horas</option>
                                <option value="8h" <?php echo ($session_data['duration'] ?? '') == '8h' ? 'selected' : ''; ?>>8 Horas</option>
                                <option value="12h" <?php echo ($session_data['duration'] ?? '') == '12h' ? 'selected' : ''; ?>>12 Horas</option>
                                <option value="24h" <?php echo ($session_data['duration'] ?? '') == '24h' ? 'selected' : ''; ?>>24 Horas</option>
                            </select>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group col-md-6">
                                <label for="pickup-date">Data *</label>
                                <input 
                                    type="date" 
                                    id="pickup-date" 
                                    name="pickup-date" 
                                    value="<?php echo sanitizeAttr($session_data['date'] ?? ''); ?>" 
                                    class="form-control" 
                                    required
                                >
                            </div>
                            <div class="form-group col-md-6">
                                <label for="hr">Horário *</label>
                                <input 
                                    type="time" 
                                    id="hr" 
                                    name="hr" 
                                    value="<?php echo sanitizeAttr($session_data['time'] ?? ''); ?>" 
                                    class="form-control" 
                                    required
                                >
                            </div>
                        </div>
                        
                    </fieldset>
                    
                    <fieldset>
                        <legend>Preferências</legend>
                        
                        <div class="form-group">
                            <label for="tipo_veiculo">Tipo de Veículo *</label>
                            <select id="tipo_veiculo" name="tipo_veiculo" class="form-control" required>
                                <option value="">Selecione o tipo de veículo</option>
                                <option value="Convencional">Convencional (Sedan)</option>
                                <option value="Blindado">Blindado (Sedan)</option>
                                <option value="Van">Van Executiva</option>
                            </select>
                            <?php if (isset($errors['tipo_veiculo'])): ?>
                                <small class="form-text text-danger"><?php echo $errors['tipo_veiculo']; ?></small>
                            <?php endif; ?>
                        </div>
                        
                        <div class="form-group">
                            <label for="motorista">Motorista *</label>
                            <select id="motorista" name="motorista" class="form-control" required>
                                <option value="">Selecione o tipo de motorista</option>
                                <option value="Monolingue">Monolíngue (Português)</option>
                                <option value="Bilingue">Bilíngue (Português + Inglês)</option>
                            </select>
                            <?php if (isset($errors['motorista'])): ?>
                                <small class="form-text text-danger"><?php echo $errors['motorista']; ?></small>
                            <?php endif; ?>
                        </div>
                        
                    </fieldset>
                    
                    <fieldset>
                        <legend>Dados Pessoais</legend>
                        
                        <div class="form-row">
                            <div class="form-group col-md-6">
                                <label for="nome">Nome *</label>
                                <input 
                                    type="text" 
                                    id="nome" 
                                    name="nome" 
                                    class="form-control" 
                                    required
                                    placeholder="Seu nome"
                                >
                                <?php if (isset($errors['nome'])): ?>
                                    <small class="form-text text-danger"><?php echo $errors['nome']; ?></small>
                                <?php endif; ?>
                            </div>
                            <div class="form-group col-md-6">
                                <label for="snome">Sobrenome *</label>
                                <input 
                                    type="text" 
                                    id="snome" 
                                    name="snome" 
                                    class="form-control" 
                                    required
                                    placeholder="Seu sobrenome"
                                >
                                <?php if (isset($errors['snome'])): ?>
                                    <small class="form-text text-danger"><?php echo $errors['snome']; ?></small>
                                <?php endif; ?>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="email">Email *</label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                class="form-control" 
                                required
                                placeholder="seu.email@exemplo.com"
                            >
                            <?php if (isset($errors['email'])): ?>
                                <small class="form-text text-danger"><?php echo $errors['email']; ?></small>
                            <?php endif; ?>
                        </div>
                        
                        <div class="form-group">
                            <label for="fone">Telefone / WhatsApp *</label>
                            <input 
                                type="tel" 
                                id="fone" 
                                name="fone" 
                                class="form-control" 
                                required
                                placeholder="(11) 98917-8312"
                            >
                            <?php if (isset($errors['fone'])): ?>
                                <small class="form-text text-danger"><?php echo $errors['fone']; ?></small>
                            <?php endif; ?>
                        </div>
                        
                        <div class="form-group">
                            <label for="message">Mensagem Adicional</label>
                            <textarea 
                                id="message" 
                                name="message" 
                                class="form-control" 
                                rows="4"
                                placeholder="Informações adicionais que possam ser relevantes"
                            ></textarea>
                        </div>
                        
                    </fieldset>
                    
                    <div class="form-group">
                        <button type="submit" class="btn btn-primary btn-lg">
                            <i class="fa fa-check"></i> Solicitar Cotação
                        </button>
                    </div>
                    
                </form>
                
            </div>
            
        </div>
        <!-- END main content -->
        
        <!-- BEGIN sidebar -->
        <div class="one-third last">
            
            <div class="sidebar">
                
                <!-- Contact Widget -->
                <div class="widget">
                    <h3>Precisa de Ajuda?</h3>
                    <div class="widget-content">
                        <p>Entre em contato conosco para saber mais sobre nossos serviços.</p>
                        
                        <div class="contact-quick">
                            <a href="tel:<?php echo str_replace(['(', ')', ' ', '-'], '', BUSINESS_PHONE); ?>" class="contact-button">
                                <i class="fa fa-phone"></i> <?php echo BUSINESS_PHONE; ?>
                            </a>
                            <a href="<?php echo BUSINESS_WHATSAPP_LINK; ?>" target="_blank" rel="noopener noreferrer" class="contact-button whatsapp">
                                <i class="fa fa-whatsapp"></i> WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
                
                <!-- Info Widget -->
                <div class="widget">
                    <h3>Vantagens</h3>
                    <div class="widget-content">
                        <ul class="benefits-list">
                            <li><i class="fa fa-check"></i> Motoristas profissionais e experientes</li>
                            <li><i class="fa fa-check"></i> Frota moderna e bem conservada</li>
                            <li><i class="fa fa-check"></i> Pontualidade garantida</li>
                            <li><i class="fa fa-check"></i> Cotação em 15 minutos</li>
                            <li><i class="fa fa-check"></i> Seguro total incluído</li>
                        </ul>
                    </div>
                </div>
                
            </div>
            
        </div>
        <!-- END sidebar -->
        
    </div>
    <!-- END .inner-wrapper -->
    
</div>
<!-- END content -->
