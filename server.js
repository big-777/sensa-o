const express = require("express");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();

const PORT = 3000;


const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});



pool.connect()
    .then(client => {
        console.log("PostgreSQL conectado!");
        client.release();
    })
    .catch(error => {
        console.error("Erro ao conectar ao PostgreSQL:");
        console.error(error.message);
    });



app.use(express.json());

app.use(express.static("public"));



const portaArduino = new SerialPort({
    path: "COM9",
    baudRate: 9600
});

const parser = portaArduino.pipe(
    new ReadlineParser({
        delimiter: "\r\n"
    })
);


let dadosAtuais = {
    temperatura: 0,
    umidade: 0,
    luminosidade: 0,
    data_hora: null
};


parser.on("data", async (linha) => {

    console.log("Arduino:", linha);

    const resultado = linha.match(
        /Temperatura:\s*([\d.]+).*Umidade:\s*([\d.]+).*Luminosidade:\s*(\d+)/
    );

    if (!resultado) {
        return;
    }

    const temperatura = parseFloat(resultado[1]);
    const umidade = parseFloat(resultado[2]);
    const luminosidade = parseInt(resultado[3]);

    dadosAtuais = {
        temperatura,
        umidade,
        luminosidade,
        data_hora: new Date()
    };

    try {

        await pool.query(
            `
            INSERT INTO medicoes
            (temperatura, umidade, luminosidade)
            VALUES ($1, $2, $3)
            `,
            [
                temperatura,
                umidade,
                luminosidade
            ]
        );

        console.log("Medição salva no banco!");

    } catch (error) {

        console.error(
            "Erro ao salvar medição:",
            error.message
        );

    }

});


app.get("/api/dados", (req, res) => {

    res.json(dadosAtuais);

});


app.get("/api/historico", async (req, res) => {

    try {

        const resultado = await pool.query(
            `
            SELECT
                id,
                temperatura,
                umidade,
                luminosidade,
                data_hora
            FROM medicoes
            ORDER BY data_hora DESC
            LIMIT 50
            `
        );

        res.json(resultado.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            erro: "Erro ao buscar histórico"
        });

    }

});


app.get("/api/historico/24h", async (req, res) => {

    try {

        const resultado = await pool.query(
            `
            SELECT
                temperatura,
                umidade,
                luminosidade,
                data_hora
            FROM medicoes
            WHERE data_hora >= NOW() - INTERVAL '24 hours'
            ORDER BY data_hora ASC
            `
        );

        res.json(resultado.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            erro: "Erro ao buscar dados"
        });

    }

});


app.listen(PORT, () => {

    console.log("");
    console.log("================================");
    console.log("      SMARTCLASS IoT");
    console.log("================================");
    console.log(`Site: http://localhost:${PORT}`);
    console.log("Arduino: aguardando dados...");
    console.log("================================");
    console.log("");

});