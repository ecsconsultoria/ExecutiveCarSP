<?php
/**
 * Footer - Rodapé centralizado
 */
?>

	<!-- BEGIN footer -->
	<footer class="footer">
		
		<!-- BEGIN .footer-inner -->
		<div class="footer-inner clearfix">
			
			<!-- BEGIN .one-half - Sobre -->
			<div class="one-half">
				
				<h5><?php echo BUSINESS_NAME; ?></h5>
				<div class="title-block6"></div>
				
				<img src="/images/logo-footer.png" alt="<?php echo BUSINESS_NAME; ?>"/>
				
				<p><?php echo BUSINESS_DESCRIPTION; ?></p>
				
				<!-- Social Links -->
				<div class="social-links" style="margin-top: 20px;">
					<a href="<?php echo SOCIAL_FACEBOOK; ?>" target="_blank" rel="noopener noreferrer" title="Facebook">
						<i class="fa fa-facebook"></i>
					</a>
					<a href="<?php echo SOCIAL_INSTAGRAM; ?>" target="_blank" rel="noopener noreferrer" title="Instagram">
						<i class="fa fa-instagram"></i>
					</a>
					<a href="<?php echo SOCIAL_LINKEDIN; ?>" target="_blank" rel="noopener noreferrer" title="LinkedIn">
						<i class="fa fa-linkedin"></i>
					</a>
					<a href="<?php echo BUSINESS_WHATSAPP_LINK; ?>" target="_blank" rel="noopener noreferrer" title="WhatsApp">
						<i class="fa fa-whatsapp"></i>
					</a>
				</div>
				
			</div>
			
			<!-- BEGIN .one-fourth - Links Úteis -->
			<div class="one-fourth">
				
				<h5>Links Úteis</h5>
				<div class="title-block6"></div>
				
				<ul class="footer-links">
					<li><a href="/">Home</a></li>
					<li><a href="/por-hora">Aluguel por Hora</a></li>
					<li><a href="/por-destino">Aluguel por Destino</a></li>
					<li><a href="/nossa-frota">Nossa Frota</a></li>
					<li><a href="/quem-somos">Quem Somos</a></li>
					<li><a href="/contato">Contato</a></li>
				</ul>
				
			</div>
			
			<!-- BEGIN .one-fourth - Contato -->
			<div class="one-fourth">
				
				<h5>Contato</h5>
				<div class="title-block6"></div>
				
				<ul class="contact-widget">
					<li class="cw-address">
						<i class="fa fa-map-marker"></i>
						<?php echo getFullAddress(); ?>
					</li>
					<li class="cw-phone">
						<i class="fa fa-phone"></i>
						<a href="tel:<?php echo str_replace(['(', ')', ' ', '-'], '', BUSINESS_PHONE); ?>">
							<?php echo BUSINESS_PHONE; ?>
						</a>
					</li>
					<li class="cw-whatsapp">
						<i class="fa fa-whatsapp"></i>
						<a href="<?php echo BUSINESS_WHATSAPP_LINK; ?>" target="_blank" rel="noopener noreferrer">
							<?php echo BUSINESS_WHATSAPP; ?>
						</a>
					</li>
					<li class="cw-email">
						<i class="fa fa-envelope"></i>
						<a href="mailto:<?php echo BUSINESS_EMAIL; ?>">
							<?php echo BUSINESS_EMAIL; ?>
						</a>
					</li>
					<li class="cw-hours">
						<i class="fa fa-clock-o"></i>
						<?php echo BUSINESS_HOURS_TEXT; ?>
					</li>
				</ul>
				
			</div>
			
		</div>
		<!-- END .footer-inner -->
		
		<!-- BEGIN .footer-bottom -->
		<div class="footer-bottom">
			<div class="footer-bottom-inner clearfix">
				
				<div class="footer-left">
					<p>&copy; <?php echo date('Y'); ?> <?php echo BUSINESS_NAME; ?>. Todos os direitos reservados.</p>
				</div>
				
				<div class="footer-right">
					<ul class="footer-bottom-links">
						<li><a href="/politica-privacidade">Política de Privacidade</a></li>
						<li><a href="/termos-servico">Termos de Serviço</a></li>
						<li><a href="/sitemap.xml" rel="sitemap">Sitemap</a></li>
					</ul>
				</div>
				
			</div>
		</div>
		<!-- END .footer-bottom -->
		
	</footer>
	<!-- END footer -->

	<!-- Google Translate (otimizado) -->
	<div id="google_translate_element" style="display: none;"></div>
	<script type="text/javascript">
	function googleTranslateElementInit() {
		new google.translate.TranslateElement(
			{
				pageLanguage: 'pt',
				includedLanguages: 'en,es,pt',
				layout: google.translate.TranslateElement.InlineLayout.HORIZONTAL
			},
			'google_translate_element'
		);
	}
	</script>
	<script type="text/javascript" src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" async defer></script>

	<!-- Scripts -->
	<script src="/js/jquery.min.js"></script>
	<script src="/js/bootstrap.min.js"></script>
	<script src="/js/main.js"></script>

</body>
</html>
