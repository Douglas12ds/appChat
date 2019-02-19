var contagemCarta = 0,
    carta = 0,
    posicaoCarta = 0,
    cartas = [],
    numeroCarta = 0,
    corCarta = 0,
    coresCarta = ['vermelho', 'amarelo', 'verde', 'azul'],
    espCarta = ['+4', 'ec'],
    tipoCarta = "",
    qualEsp = "";

exports.escolherCarta = function (numeroVezes) {
    for (contagemCarta = 0; contagemCarta < numeroVezes; contagemCarta++) {
        numeroCarta = Math.floor((Math.random() * 15) + 1);
        console.log("Numero da carta geral:" + numeroCarta);
        if (numeroCarta == 15) {
            qualEsp = espCarta[0];
            tipoCarta = "especial";
        } else if (numeroCarta == 14) {
            qualEsp = espCarta[1];
            tipoCarta = "especial";
        } else {
            tipoCarta = "normal";
            corCarta = Math.floor((Math.random() * 4));
            console.log("Cor da carta:" + coresCarta[corCarta]);
        }
        if (tipoCarta == "normal") {
            cartas[contagemCarta] = {
                posicaoCarta: posicaoCarta++,
                tipoCarta: tipoCarta,
                numeroCarta: numeroCarta,
                corCarta: coresCarta[corCarta],
            }
        } else if (tipoCarta == "especial") {
            cartas[contagemCarta] = {
                posicaoCarta: posicaoCarta++,
                tipoCarta: tipoCarta,
                qualEsp: qualEsp
            }
        }
    }
    console.log(cartas);
};

