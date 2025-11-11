<?php 

 if(isset($_POST['submitted']))
	{
//Recebendo os dados do formulrio.



$nome = $_POST["nome"];
$tel = $_POST["fone"];
$email = $_POST["email"];
$assunto = $_POST["assunto"];
$comments = $_POST["comentarios"];

$comments  = utf8_decode($comments );
$assunto = utf8_decode($assunto);


  ////////////////////////////////////////////////////////////////////////
		
		$check= '/^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,3})$/';
        $email = trim($_POST['email']);

        if (preg_match($check,$email))
        {
        
		
		}
		
		else
        {
             $ph= 'Insira um email válido!';
        
		}
		
		
		///////////////////////////////////////////Password check



  ///email
 if(empty($ph ))
	{





// Definindo os cabeçalhos do e-mail
$headers = "Content-type:text/html; charset=iso-8859-1";
 
// Vamos definir agora o destinatário do email, ou seja, VOCÊ ou SEU CLIENTE
 
$para = "contact@executivecarsp.com";
 
// Definindo o aspecto da mensagem

$mensagem = "<strong>Assunto:";
$mensagem .= "Mensagem - P&aacute;gina CONTATO DO SITE</strong><br /><br />";
//$mensagem .= "Mensagem - P&aacute;gina Contato - EXECUTIVE CAR SP</strong><br /><br />";
$mensagem .= "<strong>De:</strong>";
$mensagem .= $nome.
"<br />";
$mensagem .= "<strong>Email:</strong>";
$mensagem .= $email.
"<br />";
$mensagem .= "<strong>Telefone:</strong>";
$mensagem .= $tel.
"<br />";
$mensagem .= "<strong>Assunto:</strong>";
$mensagem .= $assunto.
"<br />";

"<br />";
$mensagem .= "<strong>Mensagem:</strong>";
$mensagem .= $comments;


 
// Enviando a mensagem para o destinatário
 
$envia = mail($para,"Formulario de Contato",$mensagem,$headers);

 
// Envia um e-mail para o remetente, agradecendo a visita no site, e dizendo que em breve o e-mail será respondido.
 
$mensagem2 = "<p>Prezado(a) <strong>" . $nome . "</strong>.<br /> 
Seu email foi recebido com sucesso, em breve retornaremos seu contato.<br /><br />
Atenciosamente<br /><br />
______________________________<br />
Depto. Comercial <br />
Executive Car SP<br />
www.executivecarsp.com<br />
</p>";
$mensagem2 .= "<p>Observa&ccedil;&atilde;o - N&atilde;o &eacute; necess&aacute;rio responder esta mensagem.</p>";
 
$envia = mail($email,"CONTATO - Transporte Executivo - Sua mensagem foi recebida!",$mensagem2,$headers);
header ("location:mensagem-enviada.php");






   }///email
  
  

}

?>
<!DOCTYPE html>
<!--[if lt IE 7]> <html dir="ltr" lang="pt-BR" class="ie6"> <![endif]-->
<!--[if IE 7]>    <html dir="ltr" lang="pt-BR" class="ie7"> <![endif]-->
<!--[if IE 8]>    <html dir="ltr" lang="pt-BR" class="ie8"> <![endif]-->
<!--[if gt IE 8]><!--> <html dir="ltr" lang="pt-BR"> <!--<![endif]-->

<!-- BEGIN head -->


<script src="https://www.google.com/recaptcha/api.js" async defer></script>


<meta http-equiv="content-type" content="text/html;charset=UTF-8" />
<head>

	<!--Meta Tags-->
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    
     <!-- =========metas============-->
     <?php 

$file2 = file_get_contents('metas.php');

$file2 = substr($file2, 3, strlen($file2));

echo $file2;

?>
<!-- =========metas============-->

<!-- Title -->
	<title>Executive Car SP | Fale Conosco</title>
    
	
	<!-- JavaScript (must go in header) -->
	

    <script src="https://cdnjs.com/libraries/jquery.mask"></script>
    
    <script src="//cdnjs.cloudflare.com/ajax/libs/jquery.maskedinput/1.4.1/jquery.maskedinput.min.js"></script>

	<script type="text/javascript" src="js/fontawesome-markers.min.js"></script>
	
	<!-- Stylesheets -->
	<link rel="stylesheet" href="css/style.css" type="text/css"  media="all" />
		
	<link rel="stylesheet" href="css/color-red.css" type="text/css"  media="all" />
		<link rel="stylesheet" href="css/responsive.css" type="text/css"  media="all" />
	<link href="maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css" rel="stylesheet">
	<link rel="stylesheet" type="text/css" href="rs-plugin/css/settings.css">
	<link rel="stylesheet" type="text/css" href="rs-plugin/css/layers.css">
	<link rel="stylesheet" type="text/css" href="rs-plugin/css/navigation.css">
	<link rel="stylesheet" type="text/css" href="css/owl.carousel.css">
	<link rel="stylesheet" type="text/css" href="css/prettyPhoto.css">
	<link href='https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,200,200italic,300,300italic,400italic,600,600italic,700,700italic,900,900italic' rel='stylesheet' type='text/css'>
	<link href="https://fonts.googleapis.com/css?family=Montserrat:400,700" rel="stylesheet"> 
	
    
    	<script type="text/javascript">

function checkform ( form )
{
  
  
  if (form.nome.value == "") {
    alert( "Por favor insira seu nome!" );
    form.nome.focus();
    return false ;
  }
  

  
  if (form.email.value == "") {
    alert( "Por favor insira seu email!" );
    form.email.focus();
    return false ;
  }
  
   if (form.fone.value == "") {
    alert( "Por favor insira seu fone!" );
    form.fone.focus();
    return false ;
  }
  
    if (form.comentarios.value == "") {
    alert( "Por favor insira os comentarios!" );
    form.comentarios.focus();
    return false ;
  }

  return true ;
}

</script>	

<!-- END head -->
</head>

<!-- BEGIN body -->
<body>
	
	
	
	<!-- BEGIN .outer-wrapper -->
	<div class="outer-wrapper">
		
		<!-- BEGIN .header-area-1 -->
		
			
			 <?php include("menu.php"); ?>
		
		<div id="page-header">
			<h1>Fale Conosco</h1>
			<div class="title-block3"></div>
			<p><a href="index.php">Home</a><i class="fa fa-angle-right"></i>Fale Conosco</p>
		</div>
		
		<!-- BEGIN .content-wrapper-outer -->
		<div class="content-wrapper-outer clearfix">
			
			<!-- BEGIN .main-content -->
			<div class="main-content main-content-full">
				
				<!-- BEGIN .clearfix -->
				<div class="clearfix">
					
					<!-- BEGIN .qns-one-half -->
					<div class="qns-one-half">
						
						
                        
	<?php 
if($ph) {
echo'<h3><style="color:red";>';echo $ph ;echo'</h3>';
}else{
																																																																												}
?>
                        
                        
                        
                        
                        <!-- BEGIN .contact-form-1 -->
						<form action="contact.php" id="formulario" class="contact-form-1" method="post" onsubmit="return checkform(this);">
                        
                          

							<label>Nome <span>*</span></label>
							<input type="text" name="nome" value="" />

							<label>Email <span>*</span></label>
							<input type="text" name="email" value="" />
                            
                            	<label>Fone/Whatsapp <span>*</span></label>
							<input type="text" name="fone" placeholder="Ex (00) 99999-9999" value=""/>


							<label>Assunto</label>
                            
                             
                             
							<select style="width: 100%;
	font-size: 16px;
	color: #000000;
	border: #e8e8e8 1px solid;
	margin: 0 0 25px 0;"  name="assunto">
											<option value="Dúvidas">Dúvidas</option>
                                            <option value="Reclamações">Reclamações</option>
                                            <option value="Cotação">Cotação</option>
                                           <option value="Outro">Outro</option>
										</select>

							<label>Mensagem <span>*</span></label>
							<textarea name="comentarios" cols="10" rows="9"></textarea>	

						

    <input type="text" name="nome" id="nome" placeholder="Nome">

    <input type="text" name="email" id="email" placeholder="E-mail">

    <input type="text" name="telefone" id="telefone" placeholder="Telefone"> 

    <input type="text" name="assunto" id="assunto" placeholder="Assunto">

    <input type="text" name="empresa" id="empresa">


                              
                              <input type="hidden" name="submitted" value="TRUE" />
                              
                              <div class="g-recaptcha" data-sitekey="6LeH6ZohAAAAAJEVD_MP7hdboR47_iZinZvmghVX"></div>
                              
                              <input type="submit" class="button4 rounded-button" value="Enviar" onclick="return valida()"/>
                            
                        
						<!-- END .contact-form-1 -->
						</form>
						
					
						<script type="text/javascript">
						    function valida() {
						        if (grecaptcha.getResponse() =="") {
						            alert("Favor marcar a caixa de validação");
						            return false;
						        }
						    }
						</script>
					<!-- END .qns-one-half -->
					</div>
					
					<!-- BEGIN .qns-one-half -->
					<div class="qns-one-half qns-last">
						
						<h4>Entre em contato</h4>
						<div class="title-block7"></div>
					
				
                        
                        
                       <p> Respondemos todas as mensagens em no máximo 15 minutos. Caso queira um retorno imediato, pedimos a gentileza entrar em contato através dos fones abaixo</p>
                        
					
							
						<ul class="contact-details-list">
						 
                                                      	<li class="cdw-phone clearfix">+55(11) 2371-1500 ou +55(11)9.8917-8312
</li>
                                                        <li class="cdw-email clearfix">contact@executivecarsp.com</li>
						</ul>
						
						<h4>Nas Redes</h4>
						<div class="title-block7"></div>
						
						<ul class="social-links clearfix">
						
                        
                        	<li><a href="https://www.facebook.com/ExecutiveCarSP" target="_blank"><i class="fa fa-facebook"></i></a></li>
				
						<li><a href="https://www.linkedin.com/company/executivecarsp" target="_blank"><i class="fa fa-linkedin"></i></a></li>
						<li><a href="https://www.tripadvisor.com.br/Attraction_Review-g303631-d14082182-Reviews-Executive_Car_SP-Sao_Paulo_State_of_Sao_Paulo.html" target="_blank"><i class="fa fa-tripadvisor"></i></a></li>
                            
						</ul>
						
					<!-- END .qns-one-half -->
					</div>
				
				<!-- END .clearfix -->
				</div>
				
		
				
			<!-- END .main-content -->
			</div>
		
		<!-- END .content-wrapper-outer -->
		</div>
		
		       <!-- rodape
================================================== -->

<?php include("rodape.php"); ?>

<!-- rodape
================================================== -->
	
		
	<!-- END .outer-wrapper -->
	</div>
	
	<!-- JavaScript -->
	<script src="ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
	<script src="ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
	<script src="ajax.googleapis.com/ajax/libs/jqueryui/1.11.3/jquery-ui.min.js"></script>
	<script type="text/javascript" src="rs-plugin/js/jquery.themepunch.tools.min838f.js?rev=5.0"></script>
	<script type="text/javascript" src="rs-plugin/js/jquery.themepunch.revolution.min838f.js?rev=5.0"></script>
	<script type="text/javascript" src="js/owl.carousel.min.js"></script>
	<script type="text/javascript" src="js/jquery.prettyPhoto.js"></script>
	
	<!-- Only required for local server -->
	<script type="text/javascript" src="rs-plugin/js/extensions/revolution.extension.video.min.js"></script>
	<script type="text/javascript" src="rs-plugin/js/extensions/revolution.extension.slideanims.min.js"></script>
	<script type="text/javascript" src="rs-plugin/js/extensions/revolution.extension.layeranimation.min.js"></script>
	<script type="text/javascript" src="rs-plugin/js/extensions/revolution.extension.navigation.min.js"></script>
	<!-- Only required for local server -->
	
	<script type="text/javascript" src="js/scripts.js"></script>
	
<!-- END body -->
</body>


</html>