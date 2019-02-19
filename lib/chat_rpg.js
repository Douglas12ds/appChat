var tamanhoDado,
    numeroDado;

exports.jogarDados = function(socket, salaAtual, nomes){
    socket.on('rolarDado', function(dado){
        numeroDado = Math.floor((Math.random() * dado)+ 1);
        if ( numeroDado ) {
            socket.broadcast.to(salaAtual[socket.id]).emit('mensagem', {
                texto: nomes[socket.id] + " rolou um dado d" + dado +
                " e tirou o número " + numeroDado + "."}
            )
            socket.emit('mensagem', {
                texto: "Você rolou um dado d" + dado +
                " e tirou o número " + numeroDado + "."}
            )} else {
            socket.emit('mensagem', {
                texto: "O número de lados deve ser um número inteiro!"
            })
        };
    console.log(nomes[socket.id] + "rolou um dado d" + dado +
    " e tirou o número " + numeroDado + ".");
    });
};