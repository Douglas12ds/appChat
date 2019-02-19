var http = require('http'),
    fs = require('fs'),
    path = require('path'),
    mime = require('mime'),
    servidorChat = require('./lib/chat_server.js');
    cache = {};

// Nome auto-explicativo
function enviar404(resposta) {
    resposta.writeHead(404, {'Content-Type' : 'text/plain'});
    resposta.write('Error 404: Recurso Não Encontrado');
    resposta.end();
};

// Nome auto-explicativo
function enviarArquivo(resposta, endArquivo, contArquivo) {
    /* Caso exista o arquivo, o servidor irá mandar uma resposta
    * ao cliente com 200 ( confirmação padronizada do HTTP )   
    * e o arquivo, seu tipo será pego pelo "mime.getType"
    */
    resposta.writeHead(
        200, 
        {'Content-Type' : mime.getType(path.basename(endArquivo))}
        );
    resposta.end(contArquivo);
};

/* Ao invés de enviar o arquivo por meio de upload do sistema
* toda vez que algum cliente solicitar a página, ele irá enviar
* só ao primeiro pedido que solicitar tal arquivo. Quando isso
* acontecer, ele irá automaticamente salvar os dados do arquivo
* numa variável para fácil, ágil e leve consulta, assim enviando
* o arquivo de forma mais rápida para as solicitações subsequentes.
*/
function servidorEstatico(resposta, cache, endAbsoluto){
    if (cache[endAbsoluto]) {
        enviarArquivo(resposta, endAbsoluto, cache[endAbsoluto]);
    } else {
        fs.exists(endAbsoluto, function(existe){
            if (existe){
                fs.readFile(endAbsoluto, function(err, data) {
                    if (err) {
                        enviar404(resposta);
                    } else {
                        cache[endAbsoluto] = data;
                        enviarArquivo(resposta, endAbsoluto, data);
                    };
                });
            } else {
                enviar404(resposta);
            }
        });
    };
};

// Cria o servidor HTTP.
var servidor = http.createServer( function( pedido, resposta){
    var endArquivo = false;
    if (pedido.url == '/'){
        endArquivo = 'public/index.html';
    } else {
        endArquivo = 'public' + pedido.url;
    }
    var endAbsoluto = './' + endArquivo;
    servidorEstatico(resposta, cache, endAbsoluto);
});

// console.log explicativo.
servidor.listen(8125, function() {
    console.log("Servidor aberto na porta 8125");
});

// Conecta com o Sockets.IO.
servidorChat.conectar(servidor);

