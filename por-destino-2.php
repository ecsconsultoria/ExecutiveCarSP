<? ob_start(); ?>
<? session_start();


$sess_origem = $_SESSION['origem2'];
$sess_destino = $_SESSION['destino'] ;
$sess_hr = $_SESSION['hr2'];
$sess_data = $_SESSION['pickup-date2'];


if($sess_origem == NULL || $sess_destino == NULL )
	{
	  header("Location: recalcular.php"); 
	}




$sess_hr_retorno = $_SESSION['hr_retorno'];
$sess_data_retorno = $_SESSION['pickup-date_retorno'];


$sess_nome = $_SESSION['nome'];
$sess_snome = $_SESSION['snome'] ;
$sess_fone = $_SESSION['fone'] ;
$sess_email = $_SESSION['email'] ;

$sess_motorista = $_SESSION['motorista'] ;

$sess_veiculo = $_SESSION['veiculo'] ;
$sess_tipo_veiculo = $_SESSION['tipo_veiculo'] ;



$sess_comentarios = $_SESSION['comentarios'] ;



// Check if the form has been submitted.
if (isset($_POST['submitted'])) {
	
if (!empty($_SESSION['hr_retorno'])) {	
		

$sess_origem = $_REQUEST['sess_origem'];
$sess_destino = $_REQUEST['sess_destino'];
$sess_hr = $_REQUEST['sess_hr'];
$sess_min = $_REQUEST['sess_min'];
$sess_data = $_REQUEST['sess_data'];
$sess_nome = $_REQUEST['sess_nome'];
$sess_snome = $_REQUEST['sess_snome'] ;
$sess_fone = $_REQUEST['sess_fone'] ;
$sess_email = $_REQUEST['sess_email'] ;

$sess_motorista =$_REQUEST['sess_motorista'] ;
$sess_veiculo =$_REQUEST['sess_veiculo'] ;
$sess_tipo_veiculo =$_REQUEST['sess_tipo_veiculo'] ;

$sess_hr_retorno = $_REQUEST['sess_hr_retorno'];
$sess_min_retorno = $_REQUEST['sess_min_retorno'];
$sess_data_retorno = $_REQUEST['sess_data_retorno'];


$nome_completo= $sess_nome.' '.$sess_snome;


$sess_comentarios = $_REQUEST['sess_comentarios'] ;

////////////////////////////////////////////email 1

// Definindo os cabeçalhos do e-mail
$headers = "Content-type:text/html; charset=iso-8859-1";
 
$para = "contact@executivecarsp.com";

//Incluindo os campos nome e email no corpo da mensagem.
$mensagem = "

<h3>Detalhes da viagem e veículo de escolha:</h3>

<b>- Nome:</b> ".$sess_nome.'&nbsp;'.$sess_snome."<br>
<b>- Fone:</b> ".$sess_fone."<br>
<b>- Email:</b> ".$sess_email."<br>

<b>- Motorista:</b> ".$sess_motorista."<br>
<b>- Modelo de Veículo:</b> ".$sess_tipo_veiculo."<br>
<b>- Veículo:</b> ".$sess_veiculo."<br>

<b>- Data de Ida:</b> ".$sess_data."<br>
<b>- Horário de Ida:</b> ".$sess_hr."<br>
<b>- Origem: </b>".$sess_origem."<br>
<b>- Destino:</b> ".$sess_destino."<br><br>

<h3>Dados do Retorno:</h3>


<b>- Data Retorno:</b> ".$sess_data_retorno."<br>
<b>- Horário Retorno:</b> ".$sess_hr_retorno."<br>
<b>- Origem: </b>".$sess_destino."<br>
<b>- Destino Retorno:</b> ".$sess_origem."<br><br>


<b>- Comentarios:</b> ".$sess_comentarios;

//Enviando o email
//mail("$destinatario","Formulario de contato","$msg","de: ".$email.$formato);


$envia = mail($para,utf8_decode("Cotação Transporte Executivo - Transfer"),utf8_decode($mensagem),$headers);


header ("location:mensagem-enviada.php");
////////////////////////////////////////////email 1

}else{

////////////////////////////////////////////email 2

$sess_origem = $_REQUEST['sess_origem'];
$sess_destino = $_REQUEST['sess_destino'];
$sess_hr = $_REQUEST['sess_hr'];
$sess_data = $_REQUEST['sess_data'];
$sess_nome = $_REQUEST['sess_nome'];
$sess_snome = $_REQUEST['sess_snome'] ;
$sess_fone = $_REQUEST['sess_fone'] ;
$sess_email = $_REQUEST['sess_email'] ;
$sess_veiculo =$_REQUEST['sess_veiculo'] ;

$sess_motorista =$_REQUEST['sess_motorista'] ;
$sess_tipo_veiculo =$_REQUEST['sess_tipo_veiculo'] ;


$sess_comentarios = $_REQUEST['sess_comentarios'] ;

$nome_completo= $sess_nome.' '.$sess_snome;

////////////////////////////////////////////email 1

//Setando o restante das variveis para o disparo do email
// Definindo os cabeçalhos do e-mail
$headers = "Content-type:text/html; charset=iso-8859-1";
 
$para = "contact@executivecarsp.com";

$mensagem = "
<h3>Detalhes da viagem e veículo de escolha:</h3>

<b>- Nome:</b> ".$sess_nome.'&nbsp;'.$sess_snome."<br>
<b>- Fone:</b> ".$sess_fone."<br>
<b>- Email:</b> ".$sess_email."<br>
<b>- Motorista:</b> ".$sess_motorista."<br>
<b>- Modelo de Veículo:</b> ".$sess_tipo_veiculo."<br>
<b>- Veículo:</b> ".$sess_veiculo."<br>

<b>- Data de Saída:</b> ".$sess_data."<br>
<b>- Horário:</b> ".$sess_hr."<br>
<b>- Origem: </b>".$sess_origem."<br>
<b>- Destino:</b> ".$sess_destino."<br><br>

<b>- Comentarios:</b> ".$sess_comentarios;

//Enviando o email
//mail("$destinatario","Formulario de contato","$msg","de: ".$email.$formato);


$envia = mail($para,utf8_decode("Cotação Transporte Executivo - Transfer"),utf8_decode($mensagem),$headers);

header ("location:mensagem-enviada.php");

////////////////////////////////////////////email 2
}
	  



}//submitted

?>
<!DOCTYPE html>
<!--[if lt IE 7]> <html dir="ltr" lang="pt-BR" class="ie6"> <![endif]-->
<!--[if IE 7]>    <html dir="ltr" lang="pt-BR" class="ie7"> <![endif]-->
<!--[if IE 8]>    <html dir="ltr" lang="pt-BR" class="ie8"> <![endif]-->
<!--[if gt IE 8]><!--> <html dir="ltr" lang="pt-BR"> <!--<![endif]-->

<!-- BEGIN head -->

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
	<title>Executive Car SP | Por Destino 2</title>
	<!-- JavaScript (must go in header) -->
	
	<!-- JavaScript (must go in header) -->
	
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
	
	<!-- Favicon -->
	

<!-- END head -->
</head>

<!-- BEGIN body -->
<body>
	
	
	
	<!-- BEGIN .outer-wrapper -->
	<div class="outer-wrapper">
		
	
		
	 <?php include("menu.php"); ?>
         
	
		<div id="page-header">
			<h1>Cotação por Origem x Destino</h1>
			<div class="title-block3"></div>
			<p><a href="#">Home</a><i class="fa fa-angle-right"></i>Cotação por Origem x Destino</p>
		</div>
		
		<!-- BEGIN .content-wrapper-outer -->
		<div class="content-wrapper-outer clearfix">
			
			<!-- BEGIN .main-content -->
			<div class="main-content main-content-full">
				
				<!-- BEGIN .booking-step-wrapper -->
				<div class="booking-step-wrapper clearfix">

					<div class="step-wrapper clearfix">
						<div class="step-icon-wrapper">
							<div class="step-icon">1.</div>
						</div>
						<div class="step-title">Origem, destino, data e hora</div>
					</div>

					<div class="step-wrapper clearfix">
						<div class="step-icon-wrapper">
							<div class="step-icon">2.</div>
						</div>
						<div class="step-title">Veículo e Dados complementares</div>
					</div>

					

					<div class="step-wrapper qns-last clearfix">
						<div class="step-icon-wrapper">
							<div class="step-icon step-icon-current">3.</div>
						</div>
						<div class="step-title">Confirmação</div>
					</div>

					<div class="step-line"></div>

				
				<!-- END .booking-step-wrapper -->
				</div>
				
				<!-- BEGIN .full-booking-wrapper -->
				<div class="full-booking-wrapper full-booking-wrapper-3 clearfix">
					
					
                    <!-- ida -->
                    <h4>Detalhes da viagem e veículo de escolha</h4>
					<div class="title-block7"></div>
                    
                    
                    <!-- BEGIN .contact-form-1 -->
						<form action="por-destino-2.php" class="contact-form-1" method="post">
					
					<!-- BEGIN .clearfix -->
					<div class="clearfix">
						
						<!-- BEGIN .qns-one-half -->
						<div class="qns-one-half">
						
						<p class="clearfix"><strong>Tipo:</strong> <span>Cotação por Origem x Destino</span></p>
							<p class="clearfix"><strong>Origem:</strong> <span><?  echo $sess_origem; ?><input type="hidden" name="sess_origem" value="<? echo $sess_origem; ?>" /></span></p>
							<p class="clearfix"><strong>Destino:</strong> <span><?   echo $sess_destino; ?> <input type="hidden" name="sess_destino" value="<? echo $sess_destino; ?>" /></span></p>
                            
                            
                            <p><strong>Data de Saída:</strong> <?  echo $sess_data; ?><input type="hidden" name="sess_data" value="<? echo $sess_data; ?>" /></p>
							<p><strong>Hora de Saída:</strong> <?   echo $sess_hr; ?>
                            
                            <input type="hidden" name="sess_hr" value="<? echo $sess_hr; ?>" />
                            
                             
                            
                            
                            </p>
                            
                      
						
						<!-- END .qns-one-half -->
						</div>
						
						<!-- BEGIN .qns-one-half -->
						<div class="qns-one-half last-col">
                        
                        
                              
                        
                            
                             <p class="clearfix"><strong>Tipo de Motorista:</strong> <span><?   echo $sess_motorista; ?><input type="hidden" name="sess_motorista" value="<? echo $sess_motorista; ?>" /></span></p>
                           
                           
                                
                         <p class="clearfix"><strong>Tipo de Veículo:</strong> <span><?   echo $sess_tipo_veiculo ; ?><input type="hidden" name="sess_tipo_veiculo" value="<? echo $sess_tipo_veiculo; ?>" /></span></p>
                        
                        
                        
                        
                         <p class="clearfix"><strong>Veículo de escolha:</strong> <span><?   echo $sess_veiculo; ?><input type="hidden" name="sess_veiculo" value="<? echo $sess_veiculo; ?>" /></span></p>
						
							
                          
                          
                          
                          
                          <a href="recalcular.php" class="view-map-button">Recalcular rota</a>
                            
						
						
						<!-- END .qns-one-half -->
						</div>
						
					<!-- END .clearfix -->
					</div>
					
					<hr class="space2" />
                       <!-- ida -->
                       
                       <?php if (isset($_SESSION['hr_retorno'])) { 
					   
					   
					   ?>
                       
                          <!-- volta -->
                    <h4>Detalhes do retorno</h4>
					<div class="title-block7"></div>
					
					<!-- BEGIN .clearfix -->
					<div class="clearfix">
						
						<!-- BEGIN .qns-one-half 1 -->
						<div class="qns-one-half">
						
							<p class="clearfix"><strong>Origem:</strong> <span><?  echo $sess_destino ; ?><input type="hidden" name="sess_origem_retorno" value="<?  echo $sess_destino ; ?>" /></span></p>
							<p class="clearfix"><strong>Destino:</strong> <span><?   echo $sess_origem; ?><input type="hidden" name="sess_destino_retorno" value="<? echo $sess_origem; ?>" /></span></p>
                            
                            <p><strong>Data de Retorno:</strong> <?  echo $sess_data_retorno; ?><input type="hidden" name="sess_data_retorno" value="<? echo $sess_data_retorno; ?>" /></p>
							<p><strong>Hora de Retorno:</strong> <?   echo $sess_hr_retorno ; ?><input type="hidden" name="sess_hr_retorno" value="<? echo $sess_hr_retorno; ?>" />
                            
                          
                            
                            </p>
                            
                           
						
						<!-- END .qns-one-half 1-->
						</div>
						
						<!-- BEGIN .qns-one-half 1-->
						<div class="qns-one-half last-col">
                        
                           <p class="clearfix"><strong>Tipo de Motorista:</strong> <span><?   echo $sess_motorista; ?><input type="hidden" name="sess_motorista" value="<? echo $sess_motorista; ?>" /></span></p>
                           
                           
                                
                         <p class="clearfix"><strong>Tipo de Veículo:</strong> <span><?   echo $sess_tipo_veiculo; ?><input type="hidden" name="sess_tipo_veiculo" value="<? echo $sess_tipo_veiculo; ?>" /></span></p>
                        
                        
                        
                        
                         <p class="clearfix"><strong>Veículo de escolha:</strong> <span><?   echo $sess_veiculo; ?><input type="hidden" name="sess_veiculo" value="<? echo $sess_veiculo; ?>" /></span></p>
                        
                        
						
							
                            
                            <a href="recalcular.php" class="view-map-button">Recalcular rota</a>
                            
						
						
						<!-- END .qns-one-half 1-->
						</div>
						
					<!-- END .clearfix -->
					</div>
					
					<hr class="space2" />
                       <!-- volta -->
                       
                         <?php 
						 }
					   ?>
                    
                    
                    
					
					<h4>Dados de Contato</h4>
					<div class="title-block7"></div>
					
					<!-- BEGIN .clearfix -->
					<div class="clearfix">
						
						<!-- BEGIN .passenger-details-wrapper -->
						<div class="passenger-details-wrapper">
						
							<!-- BEGIN .clearfix -->
							<div class="clearfix">

								<!-- BEGIN .passenger-details-half -->
							

								<!-- BEGIN .passenger-details-half -->
								<div class="passenger-details-half last-col">

									<p class="clearfix"><strong>Nome:</strong> <span><?   echo $sess_nome.'&nbsp;'. $sess_snome ; ?><input type="hidden" name="sess_nome" value="<? echo $sess_nome; ?>" />
                                    <input type="hidden" name="sess_snome" value="<? echo $sess_snome; ?>" />
                                    
                                    
                                    </span></p>
									<p class="clearfix"><strong>Email:</strong> <span><?  echo $sess_email; ?> <input type="hidden" name="sess_email" value="<? echo $sess_email; ?>" /></span></p>
									<p class="clearfix"><strong>Fone:</strong> <span><?   echo $sess_fone; ?><input type="hidden" name="sess_fone" value="<? echo $sess_fone; ?>" /></span></p>
									
								<!-- END .passenger-details-half -->
								</div>

							<!-- END .clearfix -->
							</div>
							
						<!-- END .passenger-details-wrapper -->
						</div>
						
						<!-- BEGIN .passenger-details-wrapper -->
						<div class="passenger-details-wrapper additional-information-wrapper last-col">
						
							<p class="clearfix"><strong>Info Adicional:</strong> <span><?   echo $sess_comentarios; ?><input type="hidden" name="sess_comentarios" value="<? echo $sess_comentarios; ?>" /></span></p>
						
						<!-- END .passenger-details-wrapper -->
						</div>
						
					<!-- END .clearfix -->
					</div>
					
					<div class="total-price-display clearfix">
						
						<p>
                        Confira e <strong>Finalize!</strong></p>
						<input type ="hidden" name="submitted" value="TRUE" />
                        
                         <input type="submit" class="payment-button" value="Enviar" />
               
						
					</div>
                    
                    </form>
					
				<!-- END .full-booking-wrapper -->
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