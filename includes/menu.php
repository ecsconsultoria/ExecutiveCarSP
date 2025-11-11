<?php
/**
 * Menu - Navegação Principal
 * Cópia/adaptação do menu.php antigo para o novo sistema
 */
?>

<div class="header-area-1">

    <!-- BEGIN .top-bar-wrapper -->
    <div class="top-bar-wrapper">
        
        <!-- BEGIN .top-bar -->
        <div class="top-bar clearfix">
            
            <!-- BEGIN .top-bar-left -->
            <div class="top-bar-left">
                
                <!-- Google Translate -->
                <div style="margin-left:0px; margin-top:-10px;"> 
                    <div id="google_translate_element"></div>
                </div>
                
                <script type="text/javascript">
                function googleTranslateElementInit() {
                    new google.translate.TranslateElement({
                        pageLanguage: 'pt', 
                        includedLanguages: 'en,es', 
                        layout: google.translate.TranslateElement.InlineLayout.HORIZONTAL
                    }, 'google_translate_element');
                }
                </script>
                <script type="text/javascript" src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
                
            </div>
            <!-- END .top-bar-left -->
            
            <!-- BEGIN .top-bar-right -->
            <div class="top-bar-right">
                <ul>
                    <li>Reservas: <strong><i class="fa fa-phone"></i> <?php echo BUSINESS_PHONE; ?></strong></li>
                    <li>WhatsApp: <strong><i class="fa fa-whatsapp"></i> <?php echo BUSINESS_WHATSAPP; ?></strong></li>
                    <li><i class="fa fa-envelope"></i> <a href="mailto:<?php echo BUSINESS_EMAIL; ?>"><?php echo BUSINESS_EMAIL; ?></a></li>
                </ul>
            </div>
            <!-- END .top-bar-right -->
            
        </div>
        <!-- END .top-bar -->
        
    </div>
    <!-- END .top-bar-wrapper -->

    <!-- BEGIN .header-content -->
    <div class="header-content">
        
        <!-- BEGIN .logo -->
        <div class="logo">
            <a href="/"><img src="/public/images/logo.png" width="300" height="85" alt="<?php echo BUSINESS_NAME; ?>"/></a>
        </div>
        <!-- END .logo -->

        <!-- BEGIN .header-icons-wrapper -->
        <div class="header-icons-wrapper clearfix">

            <a href="/contato" class="topright-button"><span>Cotação em 15 Minutos</span></a>

            <!-- BEGIN .header-icons-inner -->
            <div class="header-icons-inner clearfix">
                <!-- Pode adicionar ícones adicionais aqui -->
            </div>
            <!-- END .header-icons-inner -->

        </div>
        <!-- END .header-icons-wrapper -->

    </div>
    <!-- END .header-content -->

    <!-- Navegação Principal -->
    <nav class="main-navigation">
        <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/por-hora">Por Hora</a></li>
            <li><a href="/por-destino">Por Destino</a></li>
            <li><a href="/nossa-frota">Nossa Frota</a></li>
            <li><a href="/quem-somos">Quem Somos</a></li>
            <li><a href="/contato">Contato</a></li>
        </ul>
    </nav>

</div>
