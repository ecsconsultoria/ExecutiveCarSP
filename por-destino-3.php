<? ob_start(); ?>
<? session_start();
$sess_origem = $_SESSION['origem2'];
$sess_destino = $_SESSION['destino'] ;
$sess_hr = $_SESSION['hr2'];
$sess_min = $_SESSION['min2'];
$sess_data = $_SESSION['pickup-date2'];



$sess_hr_retorno = $_SESSION['hr_retorno'];
$sess_min_retorno = $_SESSION['min_retorno'];
$sess_data_retorno = $_SESSION['pickup-date_retorno'];


$sess_nome = $_SESSION['nome'];
$sess_snome = $_SESSION['snome'] ;
$sess_fone = $_SESSION['fone'] ;
$sess_email = $_SESSION['email'] ;
$sess_veiculo =$_SESSION['veiculo'] ;
$sess_comentarios = $_SESSION['comentarios'] ;


//Setando o restante das variveis para o disparo do email
$destinatario = "thiagomancini@mancinidesign.com.br";
$formato = "\nContent-type: text/html\n";
//Incluindo os campos nome e email no corpo da mensagem.
$msg = "- Nome: ".$sess_nome.''.$sess_snome."<br>
- Fone: ".$sess_fone."<br>
- Email: ".$sess_email."<br>
- Veículo: ".$sess_veiculo."<br>
- Comentarios: ".$sess_comentarios;

//Enviando o email
//mail("$destinatario","Formulario de contato","$msg","de: ".$email.$formato);


require("phpmailer/class.phpmailer.php");

$mail = new PHPMailer();
$mail->SetLanguage("br");
$mail->IsMail();
$mail->IsHTML(true);
$mail->From = "$email";  //email do remetente
$mail->FromName = "$sess_nome";   //Nome de formatado do remetente
$mail->Host = "mancinidesign.com.br";    //Seu servidor SMTP
$mail->Mailer = "smtp";                 //Usando protocolo SMTP
$mail->AddAddress("$destinatario");     //O destino do email
$mail->Subject = "Formulario de Reserva por Destino"; //Assunto do email
$mail->Body = "$msg";
$mail->SMTPAuth = "true";
$mail->Username = "thiagomancini@mancinidesign.com.br"; // Utilize uma conta valida para seu servidor
$mail->Password = "290880th+!@";
//Utilize a senha do Email-Valido valida

if($mail->Send()){
header('Location: mensagem-enviada');

}?>

