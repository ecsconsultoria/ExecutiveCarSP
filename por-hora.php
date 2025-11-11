<? ob_start(); ?>
<? session_start();


$sess_origem = $_SESSION['origem'];
$sess_duracao = $_SESSION['duracao'] ;
$sess_hr = $_SESSION['hr'];
$sess_data = $_SESSION['pickup-date'];





if($sess_origem == NULL)
	{
	  header("Location: recalcular.php"); 
	}





// Check if the form has been submitted.
if (isset($_POST['submitted'])) {
	
	

	
	
	if (empty($_POST['nome'])) 
    {
		$ph = 'Preencha o Nome !!';
	}
	
	
		if (empty($_POST['snome'])) 
    {
		$ph = 'Preencha o Sobrenome !!';
	}
	
	
	if (empty($_POST['email'])) 
    {
		$ph = 'Preencha o email !!';
	}
	
	if (empty($_POST['fone'])) 
    {
		$ph = 'Preencha o fone ou whatsapp !!';
	}
   
   
   //////////////////////////////////////////////////////////motorista
	
		$selected_motorista = $_POST['motorista'];
		
		if ($selected_motorista == 'Bilingue')
		   {
		$bilingue = 'checked';
		   }
		else if ($selected_motorista == 'Monolingue') {
		
		$monolingue = 'checked';
		   }
		
//////////////////////////////////////////////////////////motorista


 //////////////////////////////////////////////////////////conve/blindado
	
		$selected_tipo_veiculo = $_POST['tipo_veiculo'];
		
		if ($selected_tipo_veiculo == 'Convencional')
		   {
		$convencional = 'checked';
		   }
		else if ($selected_tipo_veiculo == 'Blindado') {
		
		$blindado = 'checked';
		   }
		
//////////////////////////////////////////////////////////conve/blindado
   
		
		
		
$sess_origem = $_SESSION['origem2'];
$sess_destino = $_SESSION['destino'] ;
$sess_hr = $_SESSION['hr2'];
$sess_data = $_SESSION['pickup-date2'];	
	


		
		 $_SESSION['nome'] = $_POST['nome'];
	     $_SESSION['snome'] = $_POST['snome'];
		 $_SESSION['fone'] = $_POST['fone'];
		 $_SESSION['email'] = $_POST['email'];
		 
		 
		 $_SESSION['tipo_veiculo'] = $_POST['tipo_veiculo'];
		 
		 $_SESSION['veiculo'] = $_POST['veiculo'];
		 
		 $_SESSION['motorista'] = $_POST['motorista'];
		 
		 
		 $_SESSION['comentarios'] = $_POST['comentarios'];
	  
	  
		
		
		
		
		if(empty($ph)){
		
		 header('Location: por-hora-2.php');
		 exit();
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
	<title>Executive Car SP | Por Destino</title>
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
	

<script language="JavaScript">
function myFunction() {
  // Get the checkbox
  var checkBox = document.getElementById("myCheck");
  // Get the output text
  var text = document.getElementById("text");

  // If the checkbox is checked, display the output text
  if (checkBox.checked == true){
    text.style.display = "block";
  } else {
    text.style.display = "none";
  }
}
</script>


<!-- END head -->
</head>

<!-- BEGIN body -->
<body>
	
	
	
	<!-- BEGIN .outer-wrapper -->
	<div class="outer-wrapper">
    
    
		 <?php include("menu.php"); ?>
         
	
		<div id="page-header">
			<h1>Cotação por Hora</h1>
			<div class="title-block3"></div>
			<p><a href="#">Home</a><i class="fa fa-angle-right"></i>Cotação por Hora</p>
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
						<div class="step-title">Local de Embarque, data e hora</div>
					</div>

					<div class="step-wrapper clearfix">
						<div class="step-icon-wrapper">
							<div class="step-icon step-icon-current">2.</div>
						</div>
						<div class="step-title">Veículo e Dados complementares</div>
					</div>

					

					<div class="step-wrapper qns-last clearfix">
						<div class="step-icon-wrapper">
							<div class="step-icon">3.</div>
						</div>
						<div class="step-title">Confirmação</div>
					</div>

					<div class="step-line"></div>

				<!-- END .booking-step-wrapper -->
				</div>
				
				<!-- BEGIN .clearfix -->
				<div class="clearfix">
				
					<!-- BEGIN .select-vehicle-wrapper --><!-- BEGIN .trip-details-wrapper -->
					<div class="trip-details-wrapper clearfix">
                    
                    
                          
                    <?php 
if($ph) {
echo'<div class="msg fail"><p>'; echo $ph;  echo'</p></div>';
}else{
																																																																							}
?>
						
						<h4>Detalhes da Cotação/Viagem</h4>
						<div class="title-block7"></div>
					
						<!-- BEGIN .trip-details-wrapper-1 -->
						<div class="trip-details-wrapper-1">
							
							<p class="clearfix"><strong>Tipo:</strong> <span>Cotação por Hora</span></p>
							<p class="clearfix"><strong>Local de Embarque:</strong> <span><?  echo $sess_origem; ?></span></p>
							<p class="clearfix"><strong>Duração:</strong> <span><?   echo $sess_duracao; ?></span></p>
							
						<!-- END .trip-details-wrapper-1 -->
						</div>
						
						<!-- BEGIN .trip-details-wrapper-2 -->
						<div class="trip-details-wrapper-2">
							
							<p><strong>Data:</strong> <?  echo $sess_data; ?></p>
							<p><strong>Hora de Saída:</strong> <?   echo $sess_hr; ?></p>
							<a href="recalcular.php" class="view-map-button">Recalcular rota</a>
							
						<!-- END .trip-details-wrapper-2 -->
						</div>
						
						<div class="clearboth"></div>
						
						<!-- BEGIN .contact-form-1 -->
						<form action="por-hora.php" class="contact-form-1" method="post">
                        
                        

                            
                            
                            
                            <!-- BEGIN .clearfix -->
							<div class="clearfix">
								
								<!-- BEGIN .qns-one-half -->
								<div class="qns-one-half">
									
									<label>Nome</label>
									<input type="text" name="nome" value="<?php if(isset($_POST['nome'])){  echo $_POST['nome'];}?>">
								
								<!-- END .qns-one-half -->
								</div>
								
								<!-- BEGIN .qns-one-half -->
								<div class="qns-one-half last-col">
									
									<label>Sobrenome</label>
									<input type="text" name="snome" value="<?php if(isset($_POST['snome'])){  echo $_POST['snome'];}?>">
								
								<!-- END .qns-one-half -->
								</div>
							
							<!-- END .clearfix -->
							</div>
							
							<!-- BEGIN .clearfix -->
							<div class="clearfix">
								
								<!-- BEGIN .qns-one-half -->
								<div class="qns-one-half">
									
									<label>Email </label>
									<input type="text" name="email" value="<?php if(isset($_POST['email'])){  echo $_POST['email'];}?>">
								
								<!-- END .qns-one-half -->
								</div>
								
								<!-- BEGIN .qns-one-half -->
								<div class="qns-one-half last-col">
									
									<label>Fone/Whatsapp</label>
									<input type="text" name="fone"value="<?php if(isset($_POST['fone'])){  echo $_POST['fone'];}?>">
								
								<!-- END .qns-one-half -->
								</div>
                                
                                
                                <div class="qns">
                                <label>Tipo de Motorista</label>
                                
                                
                                
                                     <!-- monolingue -->
                       <div class="qns-one-half">	
                        <div style="min-height:30px;" class="vehicle-section clearfix">
									<p><strong><input type="radio" name="motorista" value='Monolingue' <?PHP print $monolingue; ?> checked="checked"> Monolingue &nbsp;<img src="images/brazil.png" width="26" height="19" alt=""/></strong> </p>
						
                            </div>
                            </div>
							 <!-- monolingue -->	
                                
                                
                       <!-- bilingue -->
                            <div class="qns-one-half last-col">	
                        <div style="min-height:30px;" class="vehicle-section clearfix">
									<p><strong><input type="radio" name="motorista" value='Bilingue' <?PHP print $bilingue; ?>> Bilingue  &nbsp;<img src="images/us.png" width="25" height="19" alt=""/> <img src="images/es.png" width="23" height="19" alt=""/></strong> </p>
						
                            </div>
                            </div>
							 <!-- bilingue -->	
                             
                                
                                </div>
                                
                                
                                
                                
                                
                                
                                
                                
                                
                                  <div class="qns">
                                <label>Tipo de Veículo</label>
                                
                                
                                
                                   <!-- Convencional -->
                            <div class="qns-one-half ">	
                        <div style="min-height:30px;" class="vehicle-section clearfix">
									<p><strong><input type="radio" name="tipo_veiculo" value='Convencional' <?PHP print $convencional; ?> checked="checked">  Convencional </strong> </p>
						
                            </div>
                            </div>
							 <!-- Convencional-->	
                                
                                
                                
                                
                                
                                     <!-- Blindado -->
                       <div class="qns-one-half last-col">	
                        <div style="min-height:30px;" class="vehicle-section clearfix">
									<p><strong><input type="radio" name="tipo_veiculo" value='Blindado' <?PHP print $blindado; ?>> Blindado </strong> </p>
						
                            </div>
                            </div>
							 <!-- Blindado -->	
                                
                                
                    
                             
                                
                                </div>
                                
                                
                                
                                
                                
                                
                                
                                
                                
                                
                                
                                
                                
                                
                                	<!-- BEGIN .qns-one-half -->
								<div class="qns">
									
									<label>Escolha o Veículo</label>
                                    
                                    
                                    
                     
                                    
                                    
                                    
                                    
                                    
                       <!-- 1 -->
                       <div class="qns-one-half">	
                        <div class="vehicle-section clearfix">
									<p><strong><input type="radio" name="veiculo" value='Sedan Classe Economica'  <?PHP print $fisica; ?> checked="checked"> Sedan Classe Econômica</strong>Toyota Corolla, Nissan Sentra, Renault Fluence ou Similar  </p>
						
                            </div>
                            </div>
							 <!-- 1 -->		
                                
                                
                        <!-- 2 -->	
                            <div class="qns-one-half last-col">	
                        <div class="vehicle-section clearfix">
									<p><strong><input type="radio" name="veiculo" value='Sedan Classe Executiva'  <?PHP print $fisica; ?>> Sedan Classe Executiva</strong>Ford Fusion, Hyundai Azera, Kia Cadenza ou Similar</p>
							
                            </div>
                            </div>
							 <!-- 2 -->		
                             
                             
                             
                                <!-- 3 -->
                                 <div class="qns-one-half">	
                        <div class="vehicle-section clearfix">
									<p><strong><input type="radio" name="veiculo" value='Sedan Classe Premium'  <?PHP print $fisica; ?>> Sedan Classe Premium</strong>Mercedes E Class, Chrysler 300C, Audi A5 ou Similar</p>
							
                            </div>
                            </div>
							 <!-- 3 -->	
                             
                             
                                      <!-- 4 -->
                          <div class="qns-one-half last-col">		
                        <div class="vehicle-section clearfix">
									<p><strong><input type="radio" name="veiculo" value='Classe SUV'  <?PHP print $fisica; ?>>Classe SUV</strong>Hyundai Santa Fê, Kia Sorento , Honda CRV ou Similar</p>
							
                            </div>
                            </div>
							 <!-- 4 -->	
                             
                             
                                                <!-- 5 -->
                         <div class="qns-one-half ">	
                        <div class="vehicle-section clearfix">
									<p><strong><input type="radio" name="veiculo" value='Minivan de 7 Assentos'  <?PHP print $fisica; ?>>Minivan de 7 Assentos</strong>Mercedes Vito, Kia Carnival, Town Country Chrysler ou Similar</p>
							
                            </div>
                            </div>
							 <!-- 5 -->		
									
								
					  <!-- 6 -->
                    
					<!-- 6 -->
                             
                             
                             
                           <!-- 7 -->
                      
							 <!-- 7 -->	
                             
                             
                             
                             
                                    
                                                <!-- 8 -->
                 <div class="qns-one-half last-col">		
                        <div class="vehicle-section clearfix">
									<p><strong><input type="radio" name="veiculo" value='Van de 15 assentos'  <?PHP print $fisica; ?>>Van de 15 assentos</strong>Mercedes Sprinter, Renault Master ou Similar<br><br></p>
							
                            </div>
                            </div>
							 <!-- 8 -->	
                             
                             
                             
                                                      <!-- 9 -->
                             <div class="qns-one-half">		
                        <div class="vehicle-section clearfix">
									<p><strong><input type="radio" name="veiculo" value='Van de 19 assentos'  <?PHP print $fisica; ?>>Van de 19 assentos &nbsp;&nbsp;</strong>Mercedes Sprinter</p>
						
                            </div>
                            </div>
							 <!-- 9 -->	
                             
                             
                                    
                         <!-- 10 -->
              <div class="qns-one-half last-col">		
                        <div class="vehicle-section clearfix">
									<p><strong><input type="radio" name="veiculo" value='Minibus de 24 assentos'  <?PHP print $fisica; ?>>Minibus de 24 assentos</strong>Micro onibus</p>
							
                            </div>
                            </div>
							 <!-- 10 -->	
                             
                             
                
                
                
                <!-- 11 -->	
                 <div class="qns-one-half ">	
                        <div class="vehicle-section clearfix">
									<p><strong><input type="radio" name="veiculo" value='Helicóptero'  <?PHP print $fisica; ?>>Helicóptero</strong>Flexibilidade, luxo e conforto</p>
							
                            </div>
                            </div>
							 <!-- 11 -->				
                                			
                                
                                
                                
                                
                                
                                </div>
                                
                                
                                
                                
                                
							
							<!-- END .clearfix -->
							</div>

							<label>Info Adicional</label>
							<textarea name="comentarios" cols="10" rows="5"><?php if(isset($_POST['comentarios'])){  echo $_POST['comentarios'];}?></textarea>	

							
                               <input type ="hidden" name="submitted" value="TRUE" />
                                
                                <input type="submit" class="button4 rounded-button" value="Confirmar" />
                            
                      

						<!-- END .contact-form-1 -->
						</form>
						
					<!-- END .trip-details-wrapper -->
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