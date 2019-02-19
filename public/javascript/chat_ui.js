

function divConteudoEscapado(mensagem){
    var msg = $('<div></div>').text(mensagem);
    msg.addClass('usuario');
    return msg;
};

function divConteudoSistema(mensagem){
    var aviso = $('<div></div>').html(mensagem);
    aviso.addClass('sistema');
    return aviso;
}


function processarEntradaUsuario(chatApp, socket, elemento) {
    var mensagem = elemento;
    var mensagemSistema = '';
    var nomeSala = $('#sala').text();
    // Identifica se a mensagem é um comando.
    if (mensagem.charAt(0) == '/') {
        mensagemSistema = chatApp.processarComando(mensagem,nomeSala);
        if ( mensagemSistema ) {
            $('#mensagens').append(divConteudoSistema(mensagemSistema));
            $('#mensagens').scrollTop($('#mensagens').prop('scrollHeight'));
        }
    } else {
        // Se não for, enviará como mensagem.
        chatApp.enviarMensagem(nomeSala, mensagem);
        $('#mensagens').append(divConteudoEscapado(mensagem));
        $('#mensagens').scrollTop($('#mensagens').prop('scrollHeight'));
    };
    
    $('#enviar-mensagem').val('');
};

var socket = io.connect();

$(document).ready(function(){////
    var chatApp = new Chat(socket);
    // Recebe sinal da troca de nome.
    socket.on('nomeResultante', function(resultado){
        var mensagem;
        if (resultado.sucesso) {
            mensagem = "Você agora é " + resultado.nome + ".";
        } else {
            mensagem = resultado.mensagem;
        }
        $('#mensagens').append(divConteudoSistema(mensagem));
        $('#mensagens').scrollTop($('#mensagens').prop('scrollHeight'));
    });

    // Recebe sinal de mudança de sala.
    socket.on('resultadoEntrada', function(resultado){
        $('#sala').text(resultado.sala);
        $('#mensagens').append(divConteudoSistema('Conectado na sala '
        + resultado.sala + "."));
        var nomeSala = resultado.sala.split(' ');
        var nomeSalaNovo = nomeSala[0].substring(0,3).toLowerCase();
        if ( nomeSalaNovo == "rpg") {
            ligarBotaoDado();
        }
        $('#mensagens').scrollTop($('#mensagens').prop('scrollHeight'));
    });
    
    // Recebe mensagens.
    socket.on('mensagem', function(mensagem){
        if ( mensagem.autor ) {
            var novoElemento = $('<div></div>').text(mensagem.texto);
            novoElemento.addClass('outrem');
            var autor = $('<div></div>').text(mensagem.autor);
            autor.addClass('autor');
            novoElemento.prepend(autor);
        } else {
            var novoElemento = $('<div></div>').text(mensagem.texto);
            novoElemento.addClass('sistema');
        }
        
        $('#mensagens').append(novoElemento);
        $('#mensagens').scrollTop($('#mensagens').prop('scrollHeight'));
    });

    // Recebe lista de salas.
    socket.on('salas', function(salas){
        $('#lista-salas').empty();

        for(var sala in salas){
            sala = sala.substring(1, sala.length);
            if ( sala != ''){
                $('#lista-salas').append(divConteudoEscapado(salas));
            };
        };
        
        $('#lista-salas div').click( function(){
            chatApp.processarComando('/entrar ' + $(this).text());
            $('#enviar-mensagem').focus();
        });
    });

    // Atualiza a lista de sala a cada 1 segundo.
    setInterval(function(){
        socket.emit('salas');
    }, 1000);

    $('#enviar-mensagem').focus();

    // Ao apertar Enter, a mensagem será enviada.
    $('#enviar-form').submit(function(){
        if ( $('#enviar-mensagem').val() != ''){
        var enviarMensagemCampo = $('#enviar-mensagem').val();
        processarEntradaUsuario(chatApp, socket, enviarMensagemCampo);
        }
        return false;
    });

    // Ao clicar no botão de Mudar Nome, uma nova área
    // solicitando o nome vai substituir o botão.
    $('#mudarNome').click(function(){
        $('#mudarNome').css('display', 'none');
       $('#mudancaNome').css('display', 'inline')
    });

    // Ao clicar em "Salvar", o nome é alterado, a área 
    // atual desaperece e o botão "Mudar Nome" volta a 
    // tomar lugar.
    $('#salvarNovoNome').click(function(){
        if ( !$('#novoNome').val().length < 1 ){
            var novoNome = $('#novoNome').val();
            var novoNomeFinal = "/nome " + novoNome;
            processarEntradaUsuario(chatApp, socket, novoNomeFinal);
            novoNome = '';
            $('#mudancaNome').css('display', 'none');
            $('#mudarNome').css('display', 'inline');
        };
    });

    // Ao clicar no botão de Mudar de Sala, uma nova área
    // solicitando o nome da sala, substituindo o botão.
    $('#mudarSala').click(function(){
        $('#mudarSala').css('display', 'none');
       $('#mudancaSala').css('display', 'inline')
    });

    // Ao clicar em "Salvar", a área atual desaperece,
    // o nome da sala é alterado e  o botão "Mudar de Sala" 
    // volta a tomar lugar.
    $('#salvarNovaSala').click(function(){
        if ( !$('#novaSala').val().length < 1 ){
            var novaSala = $('#novaSala').val();
            var novaSalaFinal = "/entrar " + novaSala;
            processarEntradaUsuario(chatApp, socket, novaSalaFinal);
            novaSala = '';
            $('#mudancaSala').css('display', 'none');
            $('#mudarSala').css('display', 'inline');
        };
    });

    
    
    function ligarBotaoDado() {
        $('#jogarDado').css('display', 'inline');
        $('#jogarDado').click(function(){
            $('#jogarDado').css('display', 'none');
            $('#quantosLados').css('display', 'inline')
        });
    
        $('#jogarODado').click(function(){
            var numeroLados = $('#numeroLados').val();
            if ( numeroLados != "") {
                var numeroLadosFinal = "/dado " + numeroLados;
            } else {
                numeroLadosFinal = "/dado 6";
            }
            processarEntradaUsuario(chatApp, socket, numeroLadosFinal);
            numeroLados = '';
            $('#quantosLados').css('display', 'none');
            $('#jogarDado').css('display', 'inline');
        });
    }

    //function jogarUNO(){
        $('#mao-uno>img.unoCarta').click( function(){            
            if ( !($(this).hasClass('selecionada')) ) {
                $('#mao-uno>img.unoCarta').each( function(){
                    
                    $(this).removeClass('selecionada');
                })
                $(this).addClass('selecionada');
            } else {
                $(this).removeClass('selecionada');
            }
        })
    //}
});