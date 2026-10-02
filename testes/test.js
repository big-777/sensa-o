const BASE_URL = "http://localhost:3000";

async function testar(nome, url) {
    try {
        const resposta = await fetch(BASE_URL + url);

        if (!resposta.ok) {
            throw new Error(`HTTP ${resposta.status}`);
        }

        const dados = await resposta.json();

        console.log(`✅ ${nome}`);
        console.log("   Resposta:", dados);
        console.log("");

        return true;
    } catch (erro) {
        console.log(`❌ ${nome}`);
        console.log("   Erro:", erro.message);
        console.log("");

        return false;
    }
}

async function executarTestes() {
    console.log("================================");
    console.log("       TESTES DO SENSA-O");
    console.log("================================");
    console.log("");

    let sucesso = 0;
    let falhas = 0;

    if (await testar("API de dados", "/api/dados")) {
        sucesso++;
    } else {
        falhas++;
    }

    if (await testar("API de histórico", "/api/historico")) {
        sucesso++;
    } else {
        falhas++;
    }

    if (await testar("API de histórico 24h", "/api/historico/24h")) {
        sucesso++;
    } else {
        falhas++;
    }

    console.log("================================");
    console.log("RESULTADO");
    console.log("================================");
    console.log(`✅ Testes aprovados: ${sucesso}`);
    console.log(`❌ Testes com erro: ${falhas}`);
    console.log("");

    if (falhas === 0) {
        console.log("🎉 Todos os testes passaram!");
    } else {
        console.log("⚠️ Existem testes com problemas.");
    }
}

executarTestes();