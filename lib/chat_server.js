var socketio = require('socket.io'),
    chatRPG = require('./chat_rpg'),
    chatUNO = require('./chat_uno'),
    io,
    numVisitante = 1,
    nomes = {},
    nomesUsados = [],
    salaAtual = {};


// Conecta o Sockets.IO ao servidor HTTP e exporta a função.
exports.conectar = function(servidor){
    chatUNO.escolherCarta(7);
    // Registra a conexão.
    io = socketio.listen(servidor);
    //io.set('log level', 1);

    // Define como cada conexão irá ser gerenciada.
    io.sockets.on('connect', function(socket) {
        console.log("Usuário entrou");
        // Quando alguém entrar, um nome será dado. Vide função.
        numVisitante = nomearVisitante(socket, numVisitante, nomes, nomesUsados);
        //Faz com que o novo convidado entre na sala principal.
        entrarNaSala(socket, 'Principal');

        // Nomes explicativos.
        lidarComMensagens(socket, nomes);
        lidarComTentativasDeMudancaDeNome(socket, nomes, nomesUsados);
        lidarEntradaDeSala(socket);
        chatRPG.jogarDados(socket,salaAtual, nomes);

        // Lista salas caso o usuário peça.
        socket.on('rooms', function(){
            socket.emit('salas', io.sockets.manager.rooms);
        });

        // Nome explicativo.
        lidarComVisitanteDesconectado(socket, nomes, nomesUsados);
    });
};

// Nome explicativo.
function nomearVisitante( socket, numVisitante, nomes, nomesUsados) {
    // Dá ao novo convidado um nome.
    var nome = 'Convidado' + numVisitante;
    // Registra o nome no vetor.
    nomes[socket.id] = nome;
    // Avisa ao usuário o seu nome.
    socket.emit('nomeResultante', {
        sucesso : true,
        nome : nome
    });
    // Registra o nome no vetor de nomes usados.
    nomesUsados.push(nome);
    // Incrementa o número de visitas.
    return numVisitante + 1;        
};

// Nome explicativo
function entrarNaSala(socket, sala) {
    // Faz com que o usuário entre na sala em questão.
    socket.join(sala);
    // Recebe que o usuário em questão está em tal sala.
    salaAtual[socket.id] = sala;
    // Avisa ao usuário em questão que ele está em tal sala.
    socket.emit('resultadoEntrada', {sala : sala});
    // Avisa aos outros usuários que tal usuário entrou.
    socket.broadcast.to(sala).emit('mensagem', {
        texto: nomes[socket.id] + ' entrou na sala ' + sala + '.'
    });
    console.log(nomes[socket.id] + ' entrou na sala ' + sala + '.');

    /* Determina quais outros usuários estão na mesma sala.
    *  que o usuário.
    */
   /*
    var usuariosNaSala = nomes;
    console.log(usuariosNaSala);
    // Se outros usuários existem, sumarize quem são.
    if ( usuariosNaSala.length > 1 ) {
       // console.log(nomesUsados[0].id);
        var usuariosNaSalaSumario = 'Usuários conectados na sala: ';
        for ( var indice; indice > usuariosNaSala; indice++ ) {
            var idSocketUsuario = nomesUsados[indice].id;
            
            if ( idSocketUsuario != socket.id ) {
                if (indice > 0 ) {
                    usuariosNaSalaSumario += ', ';
                };
                usuariosNaSalaSumario += nomes[idSocketUsuario];
            };
        };
        usuariosNaSalaSumario += ".";
        console.log(usuariosNaSalaSumario);
        // Envia o sumário de usuários totais na sala para o usuário.
        socket.emit('mensagem', {texto: usuariosNaSalaSumario});  
    };*/
};


// Nome explicativo.
function lidarComTentativasDeMudancaDeNome(socket, nomes, nomesUsados){ 
    // Adiciona um listener para tentativas de mudança de nome.
    socket.on('tentativaNome', function(nome) {
        // Proíbe nomes que começam com "Convidado".
        
        if ( nome.indexOf('Convidado') == 0) {
            socket.emit('nomeResultante', {
                sucesso: false,
                mensagem: 'Nomes não podem começar com "Convidado."'
            });
        } else {
            // Se o nome não existe, ele passará a exitir.
            if ( nomesUsados.indexOf(nome) == -1 ){
                var nomeAnterior = nomes[socket.id];
                var indiceNomeAnterior = nomesUsados.indexOf(nomeAnterior);
                nomesUsados.push(nome);
                nomes[socket.id] = nome;
                // Deleta o nome antigo da lista de nomes.
                delete nomesUsados[indiceNomeAnterior];
                socket.emit('nomeResultante', {
                    sucesso: true,
                    nome: nome
                });
                socket.broadcast.to(salaAtual[socket.id]).emit('mensagem', {
                    texto: nomeAnterior + ' agora é ' + nome + '.'
                });
            } else {
                // Se o nome já estiver sendo usado, avisará ao usuário.
                socket.emit('nomeResultante', {
                    sucesso : false,
                    mensagem: 'Esse nome já está em uso!'
                });
            };
        };
    });
};

// Nome explicativo
function lidarComMensagens(socket){
    // Ao receber uma mensagem, a mesma será enviada para toda a sala.
    socket.on('mensagem', function(mensagem){
        socket.broadcast.to(mensagem.sala).emit('mensagem', {
            autor: nomes[socket.id],
            texto: mensagem.texto
        });
        console.log(nomes[socket.id] + ': ' + mensagem.texto + 
        " na sala " + mensagem.sala + ".");
    });
};

// Nome explicativo
function lidarEntradaDeSala(socket){
    socket.on('entrar', function(sala) {
        var nomeSala = sala.novaSala.split(' ');
        var nomeSalaNovo = nomeSala[0].substring(0,3).toLowerCase();
        if (nomeSalaNovo == "rpg"){
            socket.broadcast.to(salaAtual[socket.id]).emit('mensagem', {
                texto: nomes[socket.id] + ' foi para a sala "' + sala.novaSala + '" jogar RPG.'      
            });
            socket.emit('mensagem', {
                texto: "Bem vindo(a) a uma sala de RPG! Você pode rolar um dado ao clicar no botão lá embaixo"
            });
        };
        socket.leave(salaAtual[socket.id]);
        entrarNaSala(socket, sala.novaSala);
    });
};

// Nome explicativo
function lidarComVisitanteDesconectado(socket) {
    socket.on('disconnect', function() {
        socket.broadcast.to(salaAtual[socket.id]).emit('mensagem', {
            texto: nomes[socket.id] + " desconectou."
        });
        socket.emit('mensagem', {
            texto: "Você foi desconectado."
        });
        var nomeIndice = nomesUsados.indexOf(nomes[socket.id]);
        // Remove o nome da lista de nomes usados
        delete nomesUsados[nomeIndice];
        // Remove o nome do usuário da lista de usuários
        delete nomes[socket.id];
    });
};

//function lidarComUno(socket)

