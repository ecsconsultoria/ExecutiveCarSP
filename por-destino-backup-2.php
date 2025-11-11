<? ob_start(); ?>
<? session_start();


$sess_origem = $_SESSION['origem2'];
$sess_destino = $_SESSION['destino'] ;
$sess_hr = $_SESSION['hr2'];
$sess_min = $_SESSION['min2'];
$sess_data = $_SESSION['pickup-date2'];

if($sess_origem == NULL || $sess_destino == NULL )
	{
	  header("Location: recalcular"); 
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
   
   
		
		
		
		$sess_origem = $_SESSION['origem'];
		$sess_destino = $_SESSION['destino'] ;
		$sess_hr = $_SESSION['hr'];
		$sess_min = $_SESSION['min'];
		$sess_data = $_SESSION['pickup-date'];

		
		
		if (isset($_POST['regresso'])) {
			
	    $_SESSION['hr_retorno'] = $_POST['hora_retorno'];
		$_SESSION['min_retorno']= $_POST['min_retorno'];
		$_SESSION['pickup-date_retorno']= $_POST['pickup-date_retorno'];	
			
			
		}
		
		
		
		
		 $_SESSION['nome'] = $_POST['nome'];
	     $_SESSION['snome'] = $_POST['snome'];
		 $_SESSION['fone'] = $_POST['fone'];
		 $_SESSION['email'] = $_POST['email'];
		 $_SESSION['veiculo'] = $_POST['veiculo'];
		 $_SESSION['comentarios'] = $_POST['comentarios'];
	  
	  
		
		
		
		
		if(empty($ph)){
		
		 header('Location: por-destino-2');
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
			<h1>Reserva Online por Destino</h1>
			<div class="title-block3"></div>
			<p><a href="#">Home</a><i class="fa fa-angle-right"></i>Reserva Online por Destino</p>
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
							
							<p class="clearfix"><strong>Tipo:</strong> <span>Reserva Online por Destino</span></p>
							<p class="clearfix"><strong>Origem:</strong> <span><?  echo $sess_origem; ?></span></p>
							<p class="clearfix"><strong>Destino:</strong> <span><?   echo $sess_destino; ?></span></p>
							
						<!-- END .trip-details-wrapper-1 -->
						</div>
						
						<!-- BEGIN .trip-details-wrapper-2 -->
						<div class="trip-details-wrapper-2">
							
							<p><strong>Data:</strong> <?  echo $sess_data; ?></p>
							<p><strong>Hora de Saída:</strong> <?   echo $sess_hr.'-'.$sess_min.'min' ; ?></p>
							<a href="recalcular" class="view-map-button">Recalcular rota</a>
							
						<!-- END .trip-details-wrapper-2 -->
						</div>
						
						<div class="clearboth"></div>
						
						<!-- BEGIN .contact-form-1 -->
						<form action="por-destino" class="contact-form-1" method="post">
                        
                        
      
                            
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
								<div class="qns-one-half">
									
									 	<div class="booking-form-time">
									<label>Horário de Retorno (Hora)</label>
								</div>

								<div class="booking-form-hour">
									<div class="select-wrapper">
										<i class="fa fa-angle-down"></i>
									 	<select name="hora_retorno">
											<option value="12am">12am</option>
											<option value="01am">01am</option>
											<option value="02am">02am</option>
											<option value="03am">03am</option>
											<option value="04am">04am</option>
											<option value="05am">05am</option>
											<option value="06am">06am</option>
											<option value="07am">07am</option>
											<option value="08am">08am</option>
											<option value="09am">09am</option>
											<option value="10am">10am</option>
											<option value="11am">11am</option>
											<option value="12pm">12pm</option>
											<option value="01pm">01pm</option>
											<option value="02pm">02pm</option>
											<option value="03pm">03pm</option>
											<option value="04pm">04pm</option>
											<option value="05pm">05pm</option>
											<option value="06pm">06pm</option>
											<option value="07pm">07pm</option>
											<option value="08pm">08pm</option>
											<option value="09pm">09pm</option>
											<option value="10pm">10pm</option>
											<option value="11pm">11pm</option>
										</select>
									</div>
								</div>
								<!-- END .qns-one-half -->
								</div>
								
								<!-- BEGIN .qns-one-half -->
								<div class="qns-one-half last-col">
									
                                    
                                    	<div class="booking-form-time">
									<label>(Minutos)</label>
								</div>

                                    
                                    <div class="booking-form-min">
									<div class="select-wrapper">
										<i class="fa fa-angle-down"></i>
									 	<select name="min_retorno">
											<option value="00">00</option>
											<option value="15">15</option>
											<option value="30">30</option>
											<option value="45">45</option>
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
                                <div class="select-wrapper">
								<i class="fa fa-angle-down"></i>
                               
                                <select name="motorista">
								<option value="Monolíngue">Monolíngue</option>
                                 <option value="Bilíngue">Bilíngue</option>   
								</select>
                                </div>
                                </div>
                                
                                
                                
                                
                                
                                
                                
                                	<!-- BEGIN .qns-one-half -->
								<div class="qns">
									
									<label>Escolha o Veículo</label>
                                    
                                    
                                    
                     
                                    
                                    
                                    
                                    
                                    
                       <!-- 1 -->
                       <div class="qns-one-half">	
                        <div class="vehicle-section clearfix">
									<p><strong><input type="radio" name="veiculo" value='Sedan Classe Economica'  <?PHP print $fisica; ?> checked="checked"> Sedan Classe Econômica</strong>Toyota Corolla, Nissan Sentra, Renault Fluence ou Similar  </p>
							<ul>
								<li class="vehicle-bag-limit">3</li>
								<li class="vehicle-passenger-limit">3</li>
							</ul>
							 <img src="images/image63.jpg" alt="" />	
                            </div>
                            </div>
							 <!-- 1 -->		
                                
                                
                        <!-- 2 -->	
                            <div class="qns-one-half last-col">	
                        <div class="vehicle-section clearfix">
									<p><strong><input type="radio" name="veiculo" value='Sedan Classe Executiva'  <?PHP print $fisica; ?>> Sedan Classe Executiva</strong>Ford Fusion, Hyundai Azera, Kia Cadenza ou Similar</p>
							<ul>
								<li class="vehicle-bag-limit">3</li>
								<li class="vehicle-passenger-limit">3</li>
							</ul>
							<img src="images/azera-small.jpg"/> <br>
                            </div>
                            </div>
							 <!-- 2 -->		
                             
                             
                             
                                <!-- 3 -->
                                 <div class="qns-one-half">	
                        <div class="vehicle-section clearfix">
									<p><strong><input type="radio" name="veiculo" value='Sedan Classe Premium'  <?PHP print $fisica; ?>> Sedan Classe Premium</strong>Mercedes E Class, Chrysler 300C, Audi A5 ou Similar</p>
							<ul>
								<li class="vehicle-bag-limit">3</li>
								<li class="vehicle-passenger-limit">3</li>
							</ul>
							<img src="images/mercedez-small.jpg"/> <br>
                            </div>
                            </div>
							 <!-- 3 -->	
                             
                             
                                      <!-- 4 -->
                          <div class="qns-one-half last-col">		
                        <div class="vehicle-section clearfix">
									<p><strong><input type="radio" name="veiculo" value='Classe SUV'  <?PHP print $fisica; ?>>Classe SUV</strong>Hyundai Santa Fê, Kia Sorento , Honda CRV ou Similar</p>
							<ul>
								<li class="vehicle-bag-limit">4</li>
								<li class="vehicle-passenger-limit">4</li>
							</ul>
							<img src="images/crv-small.jpg"/> <br>
                            </div>
                            </div>
							 <!-- 4 -->	
                             
                             
                                                <!-- 5 -->
                         <div class="qns-one-half ">	
                        <div class="vehicle-section clearfix">
									<p><strong><input type="radio" name="veiculo" value='Minivan'  <?PHP print $fisica; ?>>Minivan</strong>Mercedes Vito, Kia Carnival, Town Country Chrysler ou Similar</p>
							<ul>
								<li class="vehicle-bag-limit">5</li>
								<li class="vehicle-passenger-limit">6/7</li>
							</ul>
							<img src="images/kia-carnival-small.jpg"/> <br>
                            </div>
                            </div>
							 <!-- 5 -->		
									
								
					  <!-- 6 -->
                       <div class="qns-one-half last-col">		
                        <div class="vehicle-section clearfix">
									<p><strong><input type="radio" name="veiculo" value='Sedan Blindado'  <?PHP print $fisica; ?>> Sedan Blindado</strong>Ford Fusion, Hyundai Azera, Kia Cadenza ou Similar</p>
							<ul>
								<li class="vehicle-bag-limit">3</li>
								<li class="vehicle-passenger-limit">3</li>
							</ul>
							<img src="images/azera-small.jpg"/> <br>
                            </div>
                            </div>
							 <!-- 6 -->
                             
                             
                             
                                                <!-- 7 -->
                      <div class="qns-one-half ">	
                        <div class="vehicle-section clearfix">
									<p><strong><input type="radio" name="veiculo" value='Minivan Blindada'  <?PHP print $fisica; ?>>Minivan Blindada</strong>Mercedes Vito, Kia Carnival, Town Country Chrysler ou Similar</p>
							<ul>
								<li class="vehicle-bag-limit">5</li>
								<li class="vehicle-passenger-limit">6/7</li>
							</ul>
							<img src="images/kia-carnival-small.jpg"/> <br>
                            </div>
                            </div>
							 <!-- 7 -->	
                             
                             
                             
                             
                                    
                                                <!-- 8 -->
                 <div class="qns-one-half last-col">		
                        <div class="vehicle-section clearfix">
									<p><strong><input type="radio" name="veiculo" value='Van de 15 Lugares'  <?PHP print $fisica; ?>>Van de 15 Lugares</strong>Mercedes Sprinter, Renault Master ou Similar<br><br></p>
							<ul>
								<li class="vehicle-bag-limit">15</li>
								<li class="vehicle-passenger-limit">15</li>
							</ul>
							<img src="images/renault-small.jpg"/> <br>
                            </div>
                            </div>
							 <!-- 8 -->	
                             
                             
                             
                                                      <!-- 9 -->
                             <div class="qns-one-half">		
                        <div class="vehicle-section clearfix">
									<p><strong><input type="radio" name="veiculo" value='Van de 19 Lugares'  <?PHP print $fisica; ?>>Van de 19 Lugares &nbsp;&nbsp;</strong>Mercedes Sprinter</p>
							<ul>
								<li class="vehicle-bag-limit">19</li>
								<li class="vehicle-passenger-limit">19</li>
							</ul>
							<img src="images/van-small.jpg"/> <br>
                            </div>
                            </div>
							 <!-- 9 -->	
                             
                             
                                    
                         <!-- 10 -->
              <div class="qns-one-half last-col">		
                        <div class="vehicle-section clearfix">
									<p><strong><input type="radio" name="veiculo" value='Minibus de 24 lugare'  <?PHP print $fisica; ?>>Minibus de 24 lugares</strong>Micro onibus</p>
							<ul>
								<li class="vehicle-bag-limit">24</li>
								<li class="vehicle-passenger-limit">24</li>
							</ul>
							<img src="images/micro-onibus-small.jpg"/> <br>
                            </div>
                            </div>
							 <!-- 10 -->	
                             
                             
                
                
                
                <!-- 11 -->	
                 <div class="qns-one-half ">	
                        <div class="vehicle-section clearfix">
									<p><strong><input type="radio" name="veiculo" value='Helicóptero'  <?PHP print $fisica; ?>>Helicóptero</strong></p>
							<ul>
								<li class="vehicle-bag-limit">5</li>
								<li class="vehicle-passenger-limit">5</li>
							</ul>
							<img src="images/helicoptero-small.jpg"/> <br>
                            </div>
                            </div>
							 <!-- 11 -->				
                                			
                                
                                
                                
                                
                                
                                </div>
                                
                                
                                
                                
                                
							
							<!-- END .clearfix -->
							</div>

							<label>Info Adicional</label>
							<textarea name="comentarios" cols="10" rows="5"></textarea>	

							
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