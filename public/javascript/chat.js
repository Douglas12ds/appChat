var Chat = function(socket) {
    this.socket = socket;
};

Chat.prototype.enviarMensagem = function( sala, texto) {
    var mensagem = { 
        sala: sala,
        texto: texto
    };
    this.socket.emit('mensagem', mensagem);
};

Chat.prototype.mudarSala = function(sala) {
    this.socket.emit('entrar', {
        novaSala: sala
    });
};

Chat.prototype.processarComando = function(comando,nomeSala) {
    var palavras = comando.split(' ');
    // Verifica o  comando da primeira palavra.
    var comando = palavras[0].substring(1, palavras[0].length).toLowerCase();
    var nomeDaSala = nomeSala.split(' ');
    var nomeDaSalaNovo = nomeDaSala[0].substring(0,3).toLowerCase();
    var mensagem = false;
    var self = this;
    if ( nomeDaSalaNovo == "rpg" ) {
        switch(comando){
            case 'dado':
                palavras.shift();
                var dado = palavras.join(' ');
                self.socket.emit('rolarDado', dado);
                break;
        };
        return mensagem;
    }
    switch(comando){
        // Lida com mudança/criação de sala.
        case 'entrar':
            palavras.shift();
            var sala = palavras.join(' ');
            self.mudarSala(sala);
            break
        // Lida com tentativa de mudanças de nome;
        case 'nome':
            palavras.shift();
            var nome = palavras.join(' ');
            self.socket.emit('tentativaNome', nome);
            break;
        // Retorna um erro se o comando não foi conhecido;
        case 'dado':
            mensagem = 'Você não pode jogar dados fora de uma sala de RPG';
            break;
        default:
            mensagem = 'Comando desconhecido.';
            break;
    };
    return mensagem;
};