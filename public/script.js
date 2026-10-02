let graficoTemperatura;
let graficoUmidade;
let graficoLuz;


// ==========================================
// CONFIGURAÇÃO DOS GRÁFICOS
// ==========================================

function criarGraficos() {

    const contextoTemperatura =
        document
        .getElementById("graficoTemperatura")
        .getContext("2d");

    const contextoUmidade =
        document
        .getElementById("graficoUmidade")
        .getContext("2d");

    const contextoLuz =
        document
        .getElementById("graficoLuz")
        .getContext("2d");


    graficoTemperatura = new Chart(
        contextoTemperatura,
        {

            type: "line",

            data: {

                labels: [],

                datasets: [{

                    label: "Temperatura (°C)",

                    data: [],

                    tension: 0.3

                }]

            },

            options: {

                responsive: true,

                scales: {

                    y: {

                        beginAtZero: false

                    }

                }

            }

        }
    );


    graficoUmidade = new Chart(
        contextoUmidade,
        {

            type: "line",

            data: {

                labels: [],

                datasets: [{

                    label: "Umidade (%)",

                    data: [],

                    tension: 0.3

                }]

            }

        }
    );


    graficoLuz = new Chart(
        contextoLuz,
        {

            type: "line",

            data: {

                labels: [],

                datasets: [{

                    label: "Luminosidade",

                    data: [],

                    tension: 0.3

                }]

            }

        }
    );

}


// ==========================================
// BUSCAR DADOS ATUAIS
// ==========================================

async function atualizarDados() {

    try {

        const resposta =
            await fetch("/api/dados");

        const dados =
            await resposta.json();


        // Temperatura

        document.getElementById(
            "temperatura"
        ).textContent =
            dados.temperatura.toFixed(1)
            + " °C";


        // Umidade

        document.getElementById(
            "umidade"
        ).textContent =
            dados.umidade.toFixed(0)
            + " %";


        // Luminosidade

        document.getElementById(
            "luminosidade"
        ).textContent =
            dados.luminosidade;


        // Status

        atualizarStatusTemperatura(
            dados.temperatura
        );

        atualizarStatusUmidade(
            dados.umidade
        );

        atualizarStatusLuz(
            dados.luminosidade
        );


        // Hora

        document.getElementById(
            "hora"
        ).textContent =
            new Date()
            .toLocaleTimeString("pt-BR");


        atualizarStatusSala(dados);


        document.getElementById(
            "statusConexao"
        ).textContent =
            "● Arduino conectado";


    } catch (erro) {

        console.error(erro);

        document.getElementById(
            "statusConexao"
        ).textContent =
            "● Sem conexão";

    }

}


// ==========================================
// STATUS TEMPERATURA
// ==========================================

function atualizarStatusTemperatura(valor) {

    const elemento =
        document.getElementById(
            "statusTemperatura"
        );


    if (valor < 18) {

        elemento.textContent =
            "Temperatura baixa";

    }
    else if (valor <= 28) {

        elemento.textContent =
            "Temperatura normal";

    }
    else {

        elemento.textContent =
            "Temperatura alta";

    }

}


// ==========================================
// STATUS UMIDADE
// ==========================================

function atualizarStatusUmidade(valor) {

    const elemento =
        document.getElementById(
            "statusUmidade"
        );


    if (valor < 30) {

        elemento.textContent =
            "Umidade baixa";

    }
    else if (valor <= 70) {

        elemento.textContent =
            "Umidade normal";

    }
    else {

        elemento.textContent =
            "Umidade alta";

    }

}


// ==========================================
// STATUS LUMINOSIDADE
// ==========================================

function atualizarStatusLuz(valor) {

    const elemento =
        document.getElementById(
            "statusLuz"
        );


    if (valor < 300) {

        elemento.textContent =
            "Pouca iluminação";

    }
    else if (valor <= 800) {

        elemento.textContent =
            "Iluminação adequada";

    }
    else {

        elemento.textContent =
            "Muita iluminação";

    }

}


// ==========================================
// STATUS GERAL
// ==========================================

function atualizarStatusSala(dados) {

    const status =
        document.getElementById(
            "statusSala"
        );


    let problemas = [];


    if (dados.temperatura < 18) {

        problemas.push(
            "temperatura baixa"
        );

    }


    if (dados.temperatura > 28) {

        problemas.push(
            "temperatura alta"
        );

    }


    if (dados.umidade < 30) {

        problemas.push(
            "umidade baixa"
        );

    }


    if (dados.umidade > 70) {

        problemas.push(
            "umidade alta"
        );

    }


    if (dados.luminosidade < 300) {

        problemas.push(
            "pouca iluminação"
        );

    }


    if (dados.luminosidade > 800) {

        problemas.push(
            "muita iluminação"
        );

    }


    if (problemas.length === 0) {

        status.textContent =
            "Condições da sala dentro dos parâmetros.";

    }
    else {

        status.textContent =
            "Atenção: "
            + problemas.join(", ")
            + ".";

    }

}


// ==========================================
// BUSCAR HISTÓRICO
// ==========================================

async function atualizarHistorico() {

    try {

        const resposta =
            await fetch("/api/historico");

        const dados =
            await resposta.json();


        // Limpar tabela

        const tabela =
            document.getElementById(
                "tabelaHistorico"
            );

        tabela.innerHTML = "";


        // Preencher tabela

        dados.forEach(medicao => {

            const linha =
                document.createElement("tr");


            const data =
                new Date(
                    medicao.data_hora
                );


            linha.innerHTML = `

                <td>
                    ${data.toLocaleString("pt-BR")}
                </td>

                <td>
                    ${Number(
                        medicao.temperatura
                    ).toFixed(1)} °C
                </td>

                <td>
                    ${Number(
                        medicao.umidade
                    ).toFixed(0)} %
                </td>

                <td>
                    ${medicao.luminosidade}
                </td>

            `;


            tabela.appendChild(linha);

        });


    } catch (erro) {

        console.error(
            "Erro ao carregar histórico:",
            erro
        );

    }

}


// ==========================================
// ATUALIZAR GRÁFICOS
// ==========================================

async function atualizarGraficos() {

    try {

        const resposta =
            await fetch(
                "/api/historico/24h"
            );

        const dados =
            await resposta.json();


        const ultimosDados =
            dados.slice(-30);


        const labels =
            ultimosDados.map(item => {

                const data =
                    new Date(
                        item.data_hora
                    );

                return data.toLocaleTimeString(
                    "pt-BR"
                );

            });


        const temperaturas =
            ultimosDados.map(
                item =>
                    Number(
                        item.temperatura
                    )
            );


        const umidades =
            ultimosDados.map(
                item =>
                    Number(
                        item.umidade
                    )
            );


        const luminosidades =
            ultimosDados.map(
                item =>
                    Number(
                        item.luminosidade
                    )
            );


        // Temperatura

        graficoTemperatura.data.labels =
            labels;

        graficoTemperatura.data.datasets[0]
            .data =
            temperaturas;

        graficoTemperatura.update();


        // Umidade

        graficoUmidade.data.labels =
            labels;

        graficoUmidade.data.datasets[0]
            .data =
            umidades;

        graficoUmidade.update();


        // Luz

        graficoLuz.data.labels =
            labels;

        graficoLuz.data.datasets[0]
            .data =
            luminosidades;

        graficoLuz.update();


    } catch (erro) {

        console.error(
            "Erro nos gráficos:",
            erro
        );

    }

}


// ==========================================
// INICIALIZAÇÃO
// ==========================================

criarGraficos();

atualizarDados();

atualizarHistorico();

atualizarGraficos();


// Atualizar valores a cada segundo

setInterval(
    atualizarDados,
    1000
);


// Atualizar histórico a cada 5 segundos

setInterval(
    atualizarHistorico,
    5000
);


// Atualizar gráficos a cada 5 segundos

setInterval(
    atualizarGraficos,
    5000
);