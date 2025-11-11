<?php
/**
 * View - Homepage (Index)
 * Página principal com apresentação da empresa
 */
?>

<!-- BEGIN content -->
<div class="content-area clearfix">
    
    <!-- Hero Banner Section -->
    <div class="hero-banner" style="background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/public/images/hero-banner.jpg'); background-size: cover; background-position: center; min-height: 500px; display: flex; align-items: center; justify-content: center; color: white; text-align: center;">
        <div class="hero-content">
            <h1 style="font-size: 3em; margin: 0; font-weight: 700;">Aluguel de Carros Executivos com Motorista</h1>
            <p style="font-size: 1.3em; margin: 15px 0; font-weight: 300;">Serviço premium para sua comodidade em São Paulo</p>
            <div class="hero-buttons" style="margin-top: 30px;">
                <a href="/por-hora" class="btn btn-primary btn-lg" style="margin: 10px;">
                    <i class="fa fa-clock-o"></i> Aluguel por Hora
                </a>
                <a href="/por-destino" class="btn btn-secondary btn-lg" style="margin: 10px;">
                    <i class="fa fa-map-marker"></i> Aluguel por Destino
                </a>
            </div>
        </div>
    </div>
    
    <!-- BEGIN .inner-wrapper -->
    <div class="inner-wrapper">
        
        <!-- Cotação Rápida Section -->
        <div class="quick-quote-section" style="background: #f5f5f5; padding: 40px; border-radius: 8px; margin: 40px 0; text-align: center;">
            <h2>Cotação em 15 Minutos</h2>
            <p style="font-size: 1.1em; margin-bottom: 25px;">Preencha abaixo e receba uma cotação rápida e sem compromisso</p>
            
            <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                <a href="/por-hora" class="btn btn-outline-primary btn-lg">
                    <i class="fa fa-hourglass"></i> Por Hora
                </a>
                <a href="/por-destino" class="btn btn-outline-primary btn-lg">
                    <i class="fa fa-location-arrow"></i> Por Destino
                </a>
                <a href="tel:<?php echo str_replace(['(', ')', ' ', '-'], '', BUSINESS_PHONE); ?>" class="btn btn-success btn-lg">
                    <i class="fa fa-phone"></i> Ligar Agora
                </a>
                <a href="<?php echo BUSINESS_WHATSAPP_LINK; ?>" target="_blank" rel="noopener noreferrer" class="btn btn-success btn-lg">
                    <i class="fa fa-whatsapp"></i> WhatsApp
                </a>
            </div>
        </div>
        
        <!-- Serviços Section -->
        <div class="services-section" style="margin: 60px 0;">
            <h2 style="text-align: center; margin-bottom: 40px;">Nossos Serviços</h2>
            
            <div class="row">
                <!-- Serviço 1 -->
                <div class="col-md-6" style="margin-bottom: 30px;">
                    <div class="service-card" style="border: 1px solid #ddd; padding: 25px; border-radius: 8px; transition: all 0.3s;">
                        <i class="fa fa-clock-o" style="font-size: 2.5em; color: #007bff; margin-bottom: 15px;"></i>
                        <h3>Aluguel por Hora</h3>
                        <p>Contrate um carro com motorista por período de horas. Ideal para reuniões, passeios ou qualquer compromisso.</p>
                        <ul style="text-align: left;">
                            <li>✓ Duração de 1 a 24 horas</li>
                            <li>✓ Motorista profissional incluso</li>
                            <li>✓ Frota moderna e limpa</li>
                            <li>✓ Seguro total incluído</li>
                        </ul>
                        <a href="/por-hora" class="btn btn-primary" style="margin-top: 15px;">Solicitar Cotação</a>
                    </div>
                </div>
                
                <!-- Serviço 2 -->
                <div class="col-md-6" style="margin-bottom: 30px;">
                    <div class="service-card" style="border: 1px solid #ddd; padding: 25px; border-radius: 8px; transition: all 0.3s;">
                        <i class="fa fa-map-marker" style="font-size: 2.5em; color: #28a745; margin-bottom: 15px;"></i>
                        <h3>Aluguel por Destino</h3>
                        <p>Viagem marcada para um destino específico? Conte com nosso motorista profissional e experiente.</p>
                        <ul style="text-align: left;">
                            <li>✓ Qualquer destino em SP</li>
                            <li>✓ Motorista dedicado</li>
                            <li>✓ Viagens confortáveis</li>
                            <li>✓ Pontualidade garantida</li>
                        </ul>
                        <a href="/por-destino" class="btn btn-success" style="margin-top: 15px;">Solicitar Cotação</a>
                    </div>
                </div>
                
                <!-- Serviço 3 -->
                <div class="col-md-6" style="margin-bottom: 30px;">
                    <div class="service-card" style="border: 1px solid #ddd; padding: 25px; border-radius: 8px; transition: all 0.3s;">
                        <i class="fa fa-plane" style="font-size: 2.5em; color: #17a2b8; margin-bottom: 15px;"></i>
                        <h3>Transfer de Aeroportos</h3>
                        <p>Transporte seguro e confortável entre sua casa/hotel e os aeroportos de São Paulo.</p>
                        <ul style="text-align: left;">
                            <li>✓ Aeroportos: CGH, GIG, VCP</li>
                            <li>✓ Motorista experiente</li>
                            <li>✓ Saídas pontuais</li>
                            <li>✓ Acompanhamento em tempo real</li>
                        </ul>
                        <a href="/transfer-de-aeroportos" class="btn btn-info" style="margin-top: 15px;">Conhecer</a>
                    </div>
                </div>
                
                <!-- Serviço 4 -->
                <div class="col-md-6" style="margin-bottom: 30px;">
                    <div class="service-card" style="border: 1px solid #ddd; padding: 25px; border-radius: 8px; transition: all 0.3s;">
                        <i class="fa fa-heart" style="font-size: 2.5em; color: #ffc107; margin-bottom: 15px;"></i>
                        <h3>Eventos Especiais</h3>
                        <p>Casamentos, formaturas, eventos corporativos - tenha transporte de classe para seus momentos especiais.</p>
                        <ul style="text-align: left;">
                            <li>✓ Motoristas profissionais</li>
                            <li>✓ Frota luxuosa</li>
                            <li>✓ Coordenação de rotas</li>
                            <li>✓ Discrição e pontualidade</li>
                        </ul>
                        <a href="/aluguel-de-carro-para-casamento" class="btn btn-warning" style="margin-top: 15px;">Solicitar</a>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Diferenciais Section -->
        <div class="diferenciais-section" style="background: #f9f9f9; padding: 40px; border-radius: 8px; margin: 60px 0;">
            <h2 style="text-align: center; margin-bottom: 40px;">Por que escolher a <?php echo BUSINESS_NAME; ?>?</h2>
            
            <div class="row">
                <div class="col-md-4" style="text-align: center; margin-bottom: 30px;">
                    <i class="fa fa-star" style="font-size: 2.5em; color: #ffc107; margin-bottom: 15px;"></i>
                    <h4>Motoristas Profissionais</h4>
                    <p>Motoristas experientes, educados e com excelente histórico de segurança.</p>
                </div>
                <div class="col-md-4" style="text-align: center; margin-bottom: 30px;">
                    <i class="fa fa-car" style="font-size: 2.5em; color: #007bff; margin-bottom: 15px;"></i>
                    <h4>Frota Moderna</h4>
                    <p>Carros novos, bem mantidos e equipados com as melhores tecnologias.</p>
                </div>
                <div class="col-md-4" style="text-align: center; margin-bottom: 30px;">
                    <i class="fa fa-shield" style="font-size: 2.5em; color: #28a745; margin-bottom: 15px;"></i>
                    <h4>Seguro Total</h4>
                    <p>Todos os carros possuem seguro comprehensive incluído na cotação.</p>
                </div>
                <div class="col-md-4" style="text-align: center; margin-bottom: 30px;">
                    <i class="fa fa-clock-o" style="font-size: 2.5em; color: #dc3545; margin-bottom: 15px;"></i>
                    <h4>Pontualidade</h4>
                    <p>Cumprimos horários. Se não chegarmos na hora, você não paga.</p>
                </div>
                <div class="col-md-4" style="text-align: center; margin-bottom: 30px;">
                    <i class="fa fa-phone" style="font-size: 2.5em; color: #17a2b8; margin-bottom: 15px;"></i>
                    <h4>Atendimento 24/7</h4>
                    <p>Cotação em 15 minutos. Suporte permanente via telefone ou WhatsApp.</p>
                </div>
                <div class="col-md-4" style="text-align: center; margin-bottom: 30px;">
                    <i class="fa fa-dollar" style="font-size: 2.5em; color: #6f42c1; margin-bottom: 15px;"></i>
                    <h4>Melhor Preço</h4>
                    <p>Valores competitivos com a melhor relação custo-benefício do mercado.</p>
                </div>
            </div>
        </div>
        
        <!-- Depoimentos/Testimonials Section -->
        <div class="testimonials-section" style="margin: 60px 0;">
            <h2 style="text-align: center; margin-bottom: 40px;">O que nossos clientes dizem</h2>
            
            <div class="row">
                <div class="col-md-6" style="margin-bottom: 30px;">
                    <div class="testimonial-card" style="border-left: 4px solid #ffc107; padding: 20px; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <div class="stars" style="margin-bottom: 10px; color: #ffc107;">
                            ★★★★★
                        </div>
                        <p style="font-style: italic;">
                            "Excelente serviço! Motorista muito profissional, carro limpo e confortável. Recomendo para todos!"
                        </p>
                        <p style="margin: 0; font-weight: bold;">
                            - Maria Silva
                        </p>
                        <small>Cliente desde 2023</small>
                    </div>
                </div>
                
                <div class="col-md-6" style="margin-bottom: 30px;">
                    <div class="testimonial-card" style="border-left: 4px solid #ffc107; padding: 20px; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <div class="stars" style="margin-bottom: 10px; color: #ffc107;">
                            ★★★★★
                        </div>
                        <p style="font-style: italic;">
                            "Pontual, discreto e confiável. Já usei dezenas de vezes para meus compromissos."
                        </p>
                        <p style="margin: 0; font-weight: bold;">
                            - Carlos Empresa
                        </p>
                        <small>Cliente empresarial</small>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- CTA Final Section -->
        <div class="final-cta" style="background: linear-gradient(135deg, #007bff, #0056b3); color: white; padding: 60px; border-radius: 8px; text-align: center; margin: 60px 0;">
            <h2 style="margin: 0 0 15px 0;">Pronto para sua cotação?</h2>
            <p style="font-size: 1.1em; margin-bottom: 30px;">Entre em contato agora e receba um orçamento em 15 minutos!</p>
            
            <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                <a href="/por-hora" class="btn btn-light btn-lg">
                    <i class="fa fa-hourglass"></i> Por Hora
                </a>
                <a href="/por-destino" class="btn btn-light btn-lg">
                    <i class="fa fa-location-arrow"></i> Por Destino
                </a>
                <a href="tel:<?php echo str_replace(['(', ')', ' ', '-'], '', BUSINESS_PHONE); ?>" class="btn btn-warning btn-lg">
                    <i class="fa fa-phone"></i> <?php echo BUSINESS_PHONE; ?>
                </a>
                <a href="<?php echo BUSINESS_WHATSAPP_LINK; ?>" target="_blank" rel="noopener noreferrer" class="btn btn-success btn-lg">
                    <i class="fa fa-whatsapp"></i> WhatsApp
                </a>
            </div>
        </div>
        
        <!-- FAQ Section (Schema.org FAQPage) -->
        <div class="faq-section" style="margin: 60px 0;">
            <h2 style="text-align: center; margin-bottom: 40px;">Perguntas Frequentes</h2>
            
            <div class="accordion" style="background: white; border: 1px solid #ddd; border-radius: 8px;">
                
                <div class="accordion-item" style="border-bottom: 1px solid #ddd;">
                    <button class="accordion-header" style="width: 100%; text-align: left; padding: 15px; background: #f9f9f9; border: none; cursor: pointer; font-weight: bold;">
                        <span style="margin-right: 10px;">+</span> Qual é o preço mínimo?
                    </button>
                    <div class="accordion-content" style="padding: 15px; display: none;">
                        Os preços variam conforme o serviço e duração. Solicite uma cotação para receber valores exatos.
                    </div>
                </div>
                
                <div class="accordion-item" style="border-bottom: 1px solid #ddd;">
                    <button class="accordion-header" style="width: 100%; text-align: left; padding: 15px; background: #f9f9f9; border: none; cursor: pointer; font-weight: bold;">
                        <span style="margin-right: 10px;">+</span> Como solicitar uma cotação?
                    </button>
                    <div class="accordion-content" style="padding: 15px; display: none;">
                        Preencha nosso formulário online, ligue ou envie uma mensagem via WhatsApp. Responderemos em até 15 minutos.
                    </div>
                </div>
                
                <div class="accordion-item">
                    <button class="accordion-header" style="width: 100%; text-align: left; padding: 15px; background: #f9f9f9; border: none; cursor: pointer; font-weight: bold;">
                        <span style="margin-right: 10px;">+</span> Os motoristas falam inglês?
                    </button>
                    <div class="accordion-content" style="padding: 15px; display: none;">
                        Oferecemos motoristas bilíngues. Indique sua preferência ao solicitar a cotação.
                    </div>
                </div>
                
            </div>
        </div>
        
    </div>
    <!-- END .inner-wrapper -->
    
</div>
<!-- END content -->

<!-- Schema.org - FAQ -->
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "Qual é o preço mínimo?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Os preços variam conforme o serviço e duração. Solicite uma cotação para receber valores exatos."
            }
        },
        {
            "@type": "Question",
            "name": "Como solicitar uma cotação?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Preencha nosso formulário online, ligue ou envie uma mensagem via WhatsApp. Responderemos em até 15 minutos."
            }
        }
    ]
}
</script>

<style>
    .accordion-header:hover {
        background-color: #f0f0f0 !important;
    }
    
    .accordion-header.active {
        background-color: #e9ecef !important;
    }
    
    .service-card:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateY(-5px);
    }
</style>

<script>
    // Accordion toggle
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            this.classList.toggle('active');
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
        });
    });
</script>
