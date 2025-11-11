<?php
 
// Recebendo os dados passados pela página "form_contato.php"
 
$recebenome = $_POST["nome"];
$recebemail = $_POST["email"];
$recebetel = $_POST["fone"];
$recebeassunto = $_POST["assunto"];
$recebemsg = $_POST["comentarios"];
$C = "Ç";
 
// Definindo os cabeçalhos do e-mail
$headers = "Content-type:text/html; charset=iso-8859-1";
 
// Vamos definir agora o destinatário do email, ou seja, VOCÊ ou SEU CLIENTE
 
$para = "contact@executivecarsp.com";
 
// Definindo o aspecto da mensagem

$mensagem = "<strong>Assunto:";
$mensagem .= "Mensagem - P&aacute;gina Contato - TRANSPORTE EXECUTIVO</strong><br /><br />";
//$mensagem .= "Mensagem - P&aacute;gina Contato - EXECUTIVE CAR SP</strong><br /><br />";
$mensagem .= "<strong>De:</strong>";
$mensagem .= $recebenome.
"<br />";
$mensagem .= "<strong>Email:</strong>";
$mensagem .= $recebemail.
"<br />";
$mensagem .= "<strong>Telefone:</strong>";
$mensagem .= $recebeddd." ".$recebetel.
"<br />";
$mensagem .= "<strong>Assunto:</strong>";
$mensagem .= $recebedtsaida.
"<br />";
$mensagem .= "<strong>Mensagem:</strong>";
$mensagem .= $recebemsg;

 
// Enviando a mensagem para o destinatário
 
$envia = mail($para,"COTACAO - TRANSPORTE EXECUTIVO",$mensagem,$headers);

 
// Envia um e-mail para o remetente, agradecendo a visita no site, e dizendo que em breve o e-mail será respondido.
 
$mensagem2 = "<p>Prezado(a) <strong>" . $recebenome . "</strong>.<br /> 
Seu email foi recebido com sucesso, em breve retornaremos seu contato.<br /><br />
Atenciosamente<br /><br />
______________________________<br />
Depto. Comercial <br />
Executive Car SP<br />
www.executivecarsp.com<br />
</p>";
$mensagem2 .= "<p>Observa&ccedil;&atilde;o - N&atilde;o &eacute; necess&aacute;rio responder esta mensagem.</p>";
 
$envia = mail($recebemail,"ORÇAMENTO - Transporte Executivo - Sua mensagem foi recebida!",$mensagem2,$headers);
header ("location:contato-sucesso");
