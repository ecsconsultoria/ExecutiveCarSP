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
	

		
		
		if (isset($_POST['regresso'])) {
			
	    $_SESSION['hr_retorno'] = $_POST['hora_retorno'];
		$_SESSION['pickup-date_retorno']= $_POST['pickup-date_retorno'];	
			
			
		}
		
		
		
		
		 $_SESSION['nome'] = $_POST['nome'];
	     $_SESSION['snome'] = $_POST['snome'];
		 $_SESSION['fone'] = $_POST['fone'];
		 $_SESSION['email'] = $_POST['email'];
		 
		 
		 $_SESSION['tipo_veiculo'] = $_POST['tipo_veiculo'];
		 
		 $_SESSION['veiculo'] = $_POST['veiculo'];
		 
		 $_SESSION['motorista'] = $_POST['motorista'];
		 
		 
		 $_SESSION['comentarios'] = $_POST['comentarios'];
	  
	  
		
		
		
		
		if(empty($ph)){
		
		 header('Location: por-destino-2.php');
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
						<div class="step-title">Origem, Destino, data e hora</div>
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
						
						<h4>Detalhes da viagem</h4>
						<div class="title-block7"></div>
					
						<!-- BEGIN .trip-details-wrapper-1 -->
						<div class="trip-details-wrapper-1">
							
							<p class="clearfix"><strong>Tipo:</strong> <span>Cotação por Origem x Destino</span></p>
							<p class="clearfix"><strong>Origem:</strong> <span><?  echo $sess_origem; ?></span></p>
							<p class="clearfix"><strong>Destino:</strong> <span><?   echo $sess_destino; ?></span></p>
							
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
						<form action="por-destino.php" class="contact-form-1" method="post">
                        
                        
      
                            
                               <!-- 2 -->	
                        <div class="vehicle-section clearfix">
									
                                    
                                  	<p><strong> <input type="checkbox" name="regresso" id="myCheck" onclick="myFunction()"> Adicionar Regresso  (Mesma Rota Inversa)</strong></p>  
                                    
                                    
                                    
                                    
                    
                            </div>
							 <!-- 2 -->	
                             
                             
 <!-- Inicio  ==========================================-->				
         
<div id="text" style="display:none;">

  
                            <!-- BEGIN .clearfix -->
							<div class="clearfix">
								
								<!-- BEGIN .qns-one-half -->
								<div class="qns-one">
									
									 	<div class="booking-form-time">
									<label>Horário de Retorno</label>
								</div>

								<div class="booking-form-hour">
									<div class="select-wrapper">
										<i class="fa fa-angle-down"></i>
									 	<select name="hora_retorno">
                                        
                                        
                                        
											<!-- am -->
                                            
                                            <option value="12:00am">12:00am</option>
											<option value="12:10am">12:10am</option>
											<option value="12:20am">12:20am</option>
											<option value="12:30am">12:30am</option>
											<option value="12:40am">12:40am</option>
											<option value="12:50am">12:50am</option>
											
                                            <option value="1:00am">1:00am</option>
											<option value="1:10am">1:10am</option>
											<option value="1:20am">1:20am</option>
											<option value="1:30am">1:30am</option>
											<option value="1:40am">1:40am</option>
											<option value="1:50am">1:50am</option>
											<option value="2:00am">2:00am</option>
											<option value="2:10am">2:10am</option>
									
										     <option value="2:20am">2:20am</option>
											<option value="2:30am">2:30am</option>
											<option value="2:40am">2:40am</option>
											<option value="2:50am">2:50am</option>
                                            
											<option value="3:00am">3:00am</option>
											<option value="3:10am">3:10am</option>
											<option value="3:20am">3:20am</option>
											<option value="3:30am">3:30am</option>
                                            <option value="3:40am">3:40am</option>
                                            <option value="3:50am">3:50am</option>
                                            
                                            <option value="4:00am">4:00am</option>
											<option value="4:10am">4:10am</option>
                                            <option value="4:20am">4:20am</option>
											<option value="4:30am">4:30am</option>
											<option value="4:40am">4:40am</option>
											<option value="4:50am">4:50am</option>
											
                                            
                                            
                                            
                                                 <option value="5:00am">5:00am</option>
											<option value="5:10am">5:10am</option>
                                            <option value="5:20am">5:20am</option>
											<option value="5:30am">5:30am</option>
											<option value="5:40am">5:40am</option>
											<option value="5:50am">5:50am</option>
											
                                            
                                            
                                                  <option value="6:00am">6:00am</option>
											<option value="6:10am">6:10am</option>
                                            <option value="6:20am">6:20am</option>
											<option value="6:30am">6:30am</option>
											<option value="6:40am">6:40am</option>
											<option value="6:50am">6:50am</option>
											
                                            
                                            
                                            
                                         <option value="7:00am">7:00am</option>
											<option value="7:10am">7:10am</option>
                                            <option value="7:20am">7:20am</option>
											<option value="7:30am">7:30am</option>
											<option value="7:40am">7:40am</option>
											<option value="7:50am">7:50am</option>
											
                                            
                                            
                                            <option value="8:00am">8:00am</option>
											<option value="8:10am">8:10am</option>
                                            <option value="8:20am">8:20am</option>
											<option value="8:30am">8:30am</option>
											<option value="8:40am">8:40am</option>
											<option value="8:50am">8:50am</option>
                                            
											<option value="9:00am">9:00am</option>
											<option value="9:10am">9:10am</option>
											<option value="9:20am">9:20am</option>
											<option value="9:30am">9:30am</option>
                                            <option value="9:40am">9:40am</option>
                                            <option value="9:50am">9:50am</option>
                                            
                                            
                                            <option value="10:00am">10:00am</option>
											<option value="10:10am">10:10am</option>
											<option value="10:20am">10:20am</option>
											<option value="10:30am">10:30am</option>
                                            <option value="10:40am">10:40am</option>
                                            <option value="10:50am">10:50am</option>
                                            
                                            <option value="11:00am">11:00am</option>
											<option value="11:10am">11:10am</option>
											<option value="11:20am">11:20am</option>
											<option value="11:30am">11:30am</option>
                                            <option value="11:40am">11:40am</option>
                                            <option value="11:50am">11:50am</option>
                                              <!-- am -->
                                            
                                            
                                            
                                            <!-- pm -->
                                            
                                            
                                               <option value="12:00pm">12:00pm</option>
											<option value="12:10pm">12:10pm</option>
											<option value="12:20pm">12:20pm</option>
											<option value="12:30pm">12:30pm</option>
											<option value="12:40pm">12:40pm</option>
											<option value="12:50pm">12:50pm</option>
											
                                            <option value="1:00pm">1:00pm</option>
											<option value="1:10pm">1:10pm</option>
											<option value="1:20pm">1:20pm</option>
											<option value="1:30pm">1:30pm</option>
											<option value="1:40pm">1:40pm</option>
											<option value="1:50pm">1:50pm</option>
											
                                            
                                            <option value="2:00pm">2:00pm</option>
											<option value="2:10pm">2:10pm</option>
									
										     <option value="2:20pm">2:20pm</option>
											<option value="2:30pm">2:30pm</option>
											<option value="2:40pm">2:40pm</option>
											<option value="2:50pm">2:50pm</option>
                                            
											<option value="3:00pm">3:00pm</option>
											<option value="3:10pm">3:10pm</option>
											<option value="3:20pm">3:20pm</option>
											<option value="3:30pm">3:30pm</option>
                                            <option value="3:40pm">3:40pm</option>
                                            <option value="3:50pm">3:50pm</option>
                                            
                                            <option value="4:00pm">4:00pm</option>
											<option value="4:10pm">4:10pm</option>
                                            <option value="4:20pm">4:20pm</option>
											<option value="4:30pm">4:30pm</option>
											<option value="4:40pm">4:40pm</option>
											<option value="4:50pm">4:50pm</option>
											
                                            
                                            
                                            
                                                 <option value="5:00pm">5:00pm</option>
											<option value="5:10pm">5:10pm</option>
                                            <option value="5:20pm">5:20pm</option>
											<option value="5:30pm">5:30pm</option>
											<option value="5:40pm">5:40pm</option>
											<option value="5:50pm">5:50pm</option>
											
                                            
                                            
                                             <option value="6:00pm">6:00pm</option>
											<option value="6:10pm">6:10pm</option>
                                            <option value="6:20pm">6:20pm</option>
											<option value="6:30pm">6:30pm</option>
											<option value="6:40pm">6:40pm</option>
											<option value="6:50pm">6:50pm</option>
											
                                            
                                            
                                            
                                         <option value="7:00pm">7:00pm</option>
											<option value="7:10pm">7:10pm</option>
                                            <option value="7:20pm">7:20pm</option>
											<option value="7:30pm">7:30pm</option>
											<option value="7:40pm">7:40pm</option>
											<option value="7:50pm">7:50pm</option>
											
                                            
                                            
                                            <option value="8:00pm">8:00pm</option>
											<option value="8:10pm">8:10pm</option>
                                            <option value="8:20pm">8:20pm</option>
											<option value="8:30pm">8:30pm</option>
											<option value="8:40pm">8:40pm</option>
											<option value="8:50pm">8:50pm</option>
                                            
											<option value="9:00pm">9:00pm</option>
											<option value="9:10pm">9:10pm</option>
											<option value="9:20pm">9:20pm</option>
											<option value="9:30pm">9:30pm</option>
                                            <option value="9:40pm">9:40pm</option>
                                            <option value="9:50pm">9:50pm</option>
                                            
                                            
                                            <option value="10:00pm">10:00pm</option>
											<option value="10:10pm">10:10pm</option>
											<option value="10:20pm">10:20pm</option>
											<option value="10:30pm">10:30pm</option>
                                            <option value="10:40pm">10:40pm</option>
                                            <option value="10:50pm">10:50pm</option>
                                            
                                            <option value="11:00pm">11:00pm</option>
											<option value="11:10pm">11:10pm</option>
											<option value="11:20pm">11:20pm</option>
											<option value="11:30pm">11:30pm</option>
                                            <option value="11:40pm">11:40pm</option>
                                            <option value="11:50pm">11:50pm</option>
                                            
                                            
                                              <!-- pm -->
										</select>
									</div>
								</div>
								<!-- END .qns-one-half -->
								</div>
								
							
                                
                                
                                    <input type="text" name="pickup-date_retorno" class="datepicker" value="" placeholder="Data" />
                                
                                
							
							<!-- END .clearfix -->
							</div>

</div>
 <!-- fim  ==========================================-->	                            
                            
                            
                            
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
									<p><strong><input type="radio" name="veiculo" value='Van de 15 Assentos'  <?PHP print $fisica; ?>>Van de 15 Assentos</strong>Mercedes Sprinter, Renault Master ou Similar<br><br></p>
							
                            </div>
                            </div>
							 <!-- 8 -->	
                             
                             
                             
                                                      <!-- 9 -->
                             <div class="qns-one-half">		
                        <div class="vehicle-section clearfix">
									<p><strong><input type="radio" name="veiculo" value='Van de 19 Assentos'  <?PHP print $fisica; ?>>Van de 19 Assentos &nbsp;&nbsp;</strong>Mercedes Sprinter</p>
						
                            </div>
                            </div>
							 <!-- 9 -->	
                             
                             
                                    
                         <!-- 10 -->
              <div class="qns-one-half last-col">		
                        <div class="vehicle-section clearfix">
									<p><strong><input type="radio" name="veiculo" value='Minibus de 24 Assentos'  <?PHP print $fisica; ?>>Minibus de 24 Assentos</strong>Micro onibus</p>
							
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