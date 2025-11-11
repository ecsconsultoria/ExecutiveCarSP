<?php 
     session_start();
	 $_SESSION = array();
	 session_destroy();
	 
//*if( isset($_SESSION['origem2']) && isset($_SESSION['destino']) )  { 	 
	 
	 $sess_origem = $_SESSION['origem2'];
$sess_destino = $_SESSION['destino'] ;
$sess_hr = $_SESSION['hr2'];
$sess_min = $_SESSION['min2'];
$sess_data = $_SESSION['pickup-date2'];
//* }
	 
     setcookie('origem2', '', time()-300);
	 setcookie('hr2', '', time()-300);
	  setcookie('min2', '', time()-300);
	  setcookie('pickup-date2', '', time()-300);
	 
	 header('Location: index.php');
	 
?>