const axios = require('axios');
const ws = new WebSocket("ws://127.0.0.1:8080");
document.addEventListener('DOMContentLoaded', loadAllPlayers);

let isTimerRunning = false;
let timerInterval;
let timeLeft = 70;
let milliseconds = 0;

let allPlayers = [];

const apiUrl = 'http://127.0.0.1:8002/api/grupo2';
const apiUrlJudgePts = 'http://127.0.0.1:8002/api/grupo2';
const apiUrl2 = 'http://127.0.0.1:8002/api/grupo1';

let selectedRound = null;

// Conexão WebSocket
ws.onopen = () => {
    console.log("Conectado ao WebSocket na exibição de dunks");
    loadJudges();
};

// WebSocket listener
ws.onmessage = async (event) => {
    let data;
    if (event.data instanceof Blob) {
        const text = await event.data.text();
        data = JSON.parse(text);
    } else {
        data = JSON.parse(event.data);
    }

    console.log('pt233_espaciaissd', data);

    const response = await axios.get(`${apiUrl}/get-dunk-current-player`);
        const player = response.data.player;
        const playerId = response.data.playerId;
  

    if (data.competitionType === "dunks") {
        if (data.action === "updatePlayerDunks") {
            await updatePlayerDunks(data.dunks);
        } else if (data.action === "updateCurrentPlayer") {
            await updateCurrentPlayer();
            console.log('pt233_espaciaiss', player+' + '+playerId);
        } else if (data.action === "updateCurrentRound") {
            selectedRound = data.selectedRound;
            await updateRanking(selectedRound);      
            await updatePlayerDunks(data.dunks);      
            console.log('pt233_espaciaiss', player+' + '+playerId);
        } else if (data.action === "addDunk") {
            await updateRanking(selectedRound);
            await updateScoreAndDisplayDunk(data.dunk);
        }
    }
    if(data && data.data && data.data.challengeId){
        console.log('tem challenge'+data.data.challengeId)

        const challengeId = parseInt(data.data.challengeId, 10); // Base 10 para garantir a conversão correta


        await updateScoreAndDisplayDunk(challengeId);
    }else{
        const response = await axios.get(`${apiUrl}/get-dunk-current-player`);
        const player = response.data.player;
        const playerId = response.data.playerId;
        const it_challenge = response.data.it_challenge;
        await updateScoreAndDisplayDunk(it_challenge);
    }
};

async function loadAllPlayers() {
    try {
        const response = await axios.get(`${apiUrl2}/jogadores`);
        allPlayers = response.data;
    } catch (error) {
        console.error('Erro ao carregar todos os jogadores:', error);
    }
}


// Function to update player name, judge scores, and average
function updatePlayerDunks(dunks) {
    if (!dunks || !dunks.length) return;

    const dunk = dunks[dunks.length - 1]; // Get the latest dunk
    updateCurrentPlayer(dunk.player_name);
    updateScoreAndDisplayDunk(dunk);
}

// Função para resetar as pontuações ao mudar de jogador
function resetPlayerScores() {
    // Zerar a pontuação total
    const scoreElement = document.getElementById("score");
    scoreElement.textContent = "00.0";

    // Zerar as pontuações dos jurados
    const judgeElements = document.querySelectorAll(".judge");
    judgeElements.forEach(judgeElement => {
        const judgeName = judgeElement.querySelector(".judge-name");
        const judgeScore = judgeElement.querySelector(".judge-score");

        // Manter o nome do jurado, mas zerar a pontuação
        judgeScore.textContent = "0.0";
    });
}

// Função para atualizar o jogador atual e resetar as pontuações
async function updateCurrentPlayer() {
    try {
        const response = await axios.get(`${apiUrl}/get-dunk-current-player`);
        const playerName = response.data.player;

        // Atualizar o nome do jogador
        document.getElementById("jogador").textContent = playerName || "JOGADOR";

        // Atualizar a imagem do jogador
        updatePlayerImage(playerName);

        // Zerar as pontuações ao selecionar um novo jogador
        resetPlayerScores();

    } catch (error) {
        console.error('Error updating current player:', error);
    }
}

function updatePlayerImage(playerName) {
    const playerImageElement = document.querySelector('.player-image2');
    const player = allPlayers.find(p => p.vc_name === playerName);
    
    if (player && player.vc_foto) {
        playerImageElement.src = player.vc_foto;
        playerImageElement.alt = player.vc_name;
    } else {
        // Se o jogador não for encontrado ou não tiver foto, use a imagem padrão
        playerImageElement.src = "assets/imgs/player6.png";
        playerImageElement.alt = "Jogador";
    }
}


// Adicionar reset na função updatePlayerDunks também
function updatePlayerDunks(dunks) {
    if (!dunks || !dunks.length) return;

    const dunk = dunks[dunks.length - 1]; // Pegar a última dunk registrada

    // Resetar as pontuações antes de atualizar
    resetPlayerScores();

    // Atualizar o jogador atual
    updateCurrentPlayer(dunk.player_name);

    // Atualizar as pontuações e exibir a dunk
    updateScoreAndDisplayDunk(dunk);
}



// Start - Without Judjes Preload
// Function to update player's score and judges immediately after registering a dunk
// Function to update player's score and judges immediately after registering a dunk

async function updateScoreAndDisplayDunk2(dunk) {
    
    if (!dunk) {
        console.error('Dunk data is undefined');
        return;
    }

    const response = await axios.get(`${apiUrl}/dunk-judges-pts/${dunk}`);
        const datas = response.data;

    

    const scoreElement = document.getElementById("score");
    const judgeElements = document.querySelectorAll(".judge");

    // Atualizar a pontuação total da dunk registrada agora
    scoreElement.textContent = dunk.fl_pontuacao ? dunk.fl_pontuacao.toFixed(1) : "N/A";

    // Atualizar os jurados e suas pontuações
    if (dunk.pontuacoes_juris && Array.isArray(dunk.pontuacoes_juris)) {
        for (const pontuacao of dunk.pontuacoes_juris) {
            const judgeElement = document.querySelector(`.judge[data-judge-id="${pontuacao.it_id_juri}"]`);
            if (judgeElement) {
                const judgeScore = judgeElement.querySelector(".judge-score");
                judgeScore.textContent = pontuacao.fl_pontuacao ? pontuacao.fl_pontuacao.toFixed(1) : "0";
            }
        }
    } else {
        console.warn('pontuacoesJuris is undefined or not an array');
    }

    // Atualizar o ranking dos jogadores em tempo real
    if (dunk.it_id_round) {
        await updateRanking(dunk.it_id_round);
    } else {
        console.warn('it_id_round is undefined');
    }
}

async function updateScoreAndDisplayDunk3(dunk) {
    // Verifique se dunk é fornecido

    console.log('dunk é um teste:', dunk);
    if (!dunk) {
        console.error('Dunk data is undefined');
        return;
    }

    // Variável para armazenar dados atualizados
    let dunkData;

    // Se dunk for um número inteiro, faça a requisição de dados
    if (typeof dunk === 'number' && Number.isInteger(dunk)) {
        console.log('dunk é um inteiro:', dunk);

        // Faça a requisição para obter dados de pontuação
        const response = await axios.get(`${apiUrl}/dunk-judges-pts/${dunk}`);
        dunkData = response.data; // Atualize dunkData com os dados recebidos

        if (!dunkData || typeof dunkData !== 'object') {
            console.error('Dados do dunk recebidos não são válidos');
            return;
        }
    } else if (typeof dunk === 'object') {
        // Se dunk já é um objeto, apenas use-o
        dunkData = dunk;
    } 
    // else {
    //     console.error('Dunk deve ser um inteiro ou um objeto válido');
    //     return;
    // }   

    // Se dunkData é um objeto, atualizar os jurados e suas pontuações
    if (typeof dunk === 'object' && dunkData.pontuacoes_juris && Array.isArray(dunkData.pontuacoes_juris)) {
        const scoreElement = document.getElementById("score");   
        scoreElement.textContent = await dunkData.fl_pontuacao ? dunkData.fl_pontuacao.toFixed(1) : "N/A";
        for (const pontuacao of dunkData.pontuacoes_juris) {
            const judgeElement = document.querySelector(`.judge[data-judge-id="${pontuacao.it_id_juri}"]`);
            if (judgeElement) {
                const judgeScore = judgeElement.querySelector(".judge-score");
                judgeScore.textContent = pontuacao.fl_pontuacao ? pontuacao.fl_pontuacao.toFixed(1) : "0";
            } else {
                console.warn(`Elemento do jurado não encontrado para ID: ${pontuacao.it_id_juri}`);
            }
        }
    } else if (typeof dunk === 'number' && Number.isInteger(dunk))      
    {
        

        const scoreElement = document.getElementById("score");   
        scoreElement.textContent =  dunkData.fl_pontuacao ? dunkData.fl_pontuacao.toFixed(1) : "N/A";
        for (const pontuacao of dunkData) {
            console.log('é numero '+pontuacao.fl_pontuacao)
            const judgeElement = document.querySelector(`.judge[data-judge-id="${pontuacao.it_id_juri}"]`);
            if (judgeElement) {
                const judgeScore = judgeElement.querySelector(".judge-score");
                judgeScore.textContent = pontuacao.fl_pontuacao ? pontuacao.fl_pontuacao.toFixed(1) : "0";
            } else {
                console.warn(`Elemento do jurado não encontrado para ID: ${pontuacao.it_id_juri}`);
            }
        }

    }    
    else {
        console.warn('pontuacoes_juris é indefinido ou não é um array');
    }

    // Atualizar o ranking dos jogadores em tempo real
    if (dunkData.it_id_round) {
        await updateRanking(dunkData.it_id_round);
    } else {
        console.warn('it_id_round é indefinido');
    }
}

async function updateScoreAndDisplayDunk(dunk) {
    console.log('dunk é um teste:', dunk);

    if (!dunk) {
        console.error('Dunk data is undefined');
        return;
    }

    let dunkData;

    // Condição: Se 'dunk' é um número inteiro, buscar dados via API
    if (typeof dunk === 'number' ) {
        updateCurrentPlayer()
        console.log('dunk é um inteiro:', dunk);

        try {
            const response = await axios.get(`${apiUrl}/dunk-judges-pts/${dunk}`);
            dunkData = response.data;
        } catch (error) {
            console.error('Erro ao buscar dados do dunk:', error);
            return;
        }

        if (!dunkData || typeof dunkData !== 'object') {
            console.error('Dados do dunk recebidos não são válidos');
            return;
        }
    } else if (typeof dunk === 'object') {
        // Condição: Se 'dunk' é um objeto, usá-lo diretamente
        dunkData = dunk;
    } else {
        console.error('Dunk deve ser um inteiro ou um objeto válido');
        return;
    }

    // Atualizar o score total
    const scoreElement = document.getElementById("score");
   

    const judgesContainer = document.getElementById("judges-container");
    judgesContainer.innerHTML = ''; // Limpar antes de adicionar novos elementos

    // Condição: Se 'pontuacoes_juris' existe e é um array, gerar HTML dinamicamente
    if (dunkData.pontuacoes_juris && Array.isArray(dunkData.pontuacoes_juris)) {

        
        scoreElement.textContent = dunkData.fl_pontuacao ? dunkData.fl_pontuacao.toFixed(1) : "00.0";
        // const scoreValue = dunkData.media_pontuacao ? dunkData.media_pontuacao.toFixed(1) : "00.0";
        // scoreElement.textContent = scoreValue;
        // dunkData.pontuacoes_juris.forEach(pontuacao => {
        for (const pontuacao of dunkData.pontuacoes_juris) {

            const responses = await  axios.get(`${apiUrl}/get-judge-name/${pontuacao.it_id_juri}`);  // ou use o ID real do jurado
        const juri =responses.data.vc_nome
        console.log('e um array ' +JSON.stringify(pontuacao))

        
        console.log('juri ' +juri)
        if(juri){
            console.log('juri ' +juri)
        }

        

            const judgeElement = document.createElement('div');
    judgeElement.classList.add('col-md-6', 'mb-4'); // Adicionando col-md-6 para cada juiz
    judgeElement.setAttribute('data-judge-id', pontuacao.it_id_juri);

    judgeElement.innerHTML = `
        <div class=" bg-warning  card3">
            <h3 class="judge-name">${juri}</h3>
            <div class="judge-score font-weight-bold score-container">
                ${pontuacao.fl_pontuacao ? pontuacao.fl_pontuacao.toFixed(1) : '0'}
            </div>
        </div>
    `;
    document.getElementById('judges-container').appendChild(judgeElement);
        }
    } 
    // Condição: Se 'dunk' é um número inteiro, iterar sobre os dados recebidos
    else if (typeof dunk === 'number' ) {
        console.log('Renderizando jurados a partir de um número inteiross.');


        dunkData.forEach(pontuacao => {
            console.log(`Jurado ${pontuacao.it_id_juri} - Pontuação: ${pontuacao.fl_pontuacao} jurado: ${pontuacao.juri_nome}`);
            // scoreElement.textContent = dunkData.media_pontuacao ? dunkData.media_pontuacao.toFixed(1) : "N/A";
            // const scoreValue = dunkData[0].media_pontuacao ? dunkData[0].media_pontuacao.toFixed(1) : "00.0";

            if (Array.isArray(dunkData) && dunkData.length > 0) {
                // Acessar a media_pontuacao do primeiro elemento
                const mediaPontuacao = dunkData[0].media_pontuacao;
            
                // Converter mediaPontuacao para número usando parseFloat
                const scoreValue = mediaPontuacao !== undefined && mediaPontuacao !== null
                    ? parseFloat(mediaPontuacao).toFixed(1)  // Converte para número e formata
                    : "00.0";  // Valor padrão caso media_pontuacao não esteja definido
            
                scoreElement.textContent = scoreValue;
            } else {
                scoreElement.textContent = "00.0"; // Valor padrão se não houver dados
            }
    // scoreElement.textContent = scoreValue;

    const judgeElement = document.createElement('div');
    judgeElement.classList.add('col-md-6', 'mb-4'); // Adicionando col-md-6 para cada juiz
    judgeElement.setAttribute('data-judge-id', pontuacao.it_id_juri);

    judgeElement.innerHTML = `
        <div class=" bg-warning  card3">
            <h3 class="judge-name">${pontuacao.juri_nome}</h3>
            <div class="judge-score font-weight-bold score-container">
                ${pontuacao.fl_pontuacao ? pontuacao.fl_pontuacao.toFixed(1) : '0'}
            </div>
        </div>
    `;

    document.getElementById('judges-container').appendChild(judgeElement);
        });
    } else {
        console.warn('pontuacoes_juris é indefinido ou não é um array');
    }

    // Atualizar o ranking se o ID do round estiver disponível
    if (dunkData.it_id_round) {
        await updateRanking(dunkData.it_id_round);
    } else {
        console.warn('it_id_round é indefinido');
    }
}





// End - WWithouthi Judjes Preload

// Start - With Judjes Preload
// Quando a página é carregada, carregar os jurados
document.addEventListener("DOMContentLoaded", async () => {
    await loadJudges();  // Carregar jurados assim que a página carregar
});

// Função para carregar e exibir os jurados
// Função para carregar e exibir os jurados
async function loadJudges() {
    const judgeElements = document.querySelectorAll(".judge");

    judgeElements.forEach(async (judgeElement, index) => {
        try {
            // Supondo que os jurados sejam carregados sequencialmente
            const response = await axios.get(`${apiUrl}/get-judge-name/${index + 1}`);  // ou use o ID real do jurado
            const judgeData = response.data;

            const judgeName = judgeElement.querySelector(".judge-name");
            if (judgeData.vc_nome) {
                judgeName.textContent = judgeData.vc_nome;
            } else {
                judgeName.textContent = `Jurado ${index + 1}`;
            }
        } catch (error) {
            console.error('Error fetching judge name:', error);
        }
    });
}


// End - Whith Judjes Preload


// Função para carregar e exibir os jogadores com dunks registradas no round
// dunks.js
async function loadPlayers(roundId) {
    if (!roundId) {
        console.error('roundId não definido');
        return;
    }
    try {
        const response = await axios.get(`${apiUrl}/dunk-players-pts/2/${roundId}`);
        let players = response.data;

        // Mapear os jogadores com suas informações completas
        players = players.map(player => {
            const fullPlayerInfo = allPlayers.find(p => p.vc_name === player.jogador_nome);
            return {
                ...player,
                id: fullPlayerInfo ? fullPlayerInfo.id : null,
                vc_foto: fullPlayerInfo ? fullPlayerInfo.vc_foto : null
            };
        });

        players.sort((a, b) => b.media_pontuacao - a.media_pontuacao);

        const rankingAside = document.querySelector("#ranking");
        rankingAside.innerHTML = ''; // Limpar conteúdo anterior

        for (const player of players) {
            if (player.id) {
                const rankItem = document.createElement("div");
                rankItem.classList.add("rank-item");
                rankItem.innerHTML = `
                    <div class="player-image-wrapper">
                        <img class="player-image" src="${player.vc_foto}" alt="${player.jogador_nome}">
                    </div>
                    <p>${player.jogador_nome} | ${player.media_pontuacao !== undefined && player.media_pontuacao !== null
                    ? parseFloat(player.media_pontuacao).toFixed(1)  // Converte para número e formata
                    : "00.0"} <sub class="sub-text"> pts</sub></p>
                `;
                rankingAside.appendChild(rankItem);
            } else {
                console.warn(`Jogador ${player.jogador_nome} não encontrado na lista completa de jogadores.`);
            }
        }
    } catch (error) {
        console.error('Erro ao carregar jogadores:', error);
    }
}
// Função para atualizar o ranking
async function updateRanking(selectedRound) {
    if (!selectedRound) {
        console.error('selectedRound não definido');
        return;
    }
    await loadPlayers(selectedRound);
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (timeLeft > 0 || milliseconds > 0) {
            if (milliseconds <= 0) {
                if (timeLeft > 0) {
                    timeLeft--;
                    milliseconds = 990;
                }
            } else {
                milliseconds -= 10;
            }
            const displayedMilliseconds = Math.floor(milliseconds / 100);
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            const timerText = minutes > 0 ? `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${displayedMilliseconds}` : `${String(seconds).padStart(2, '0')}.${displayedMilliseconds}`;
            document.getElementById("timer").textContent = timerText;
        } else {
            clearInterval(timerInterval);
            isTimerRunning = false;
            document.getElementById("status").textContent = "Status: Finalizado";
            document.getElementById("status").className = "status-finished";
            document.getElementById("buzzerSound").play();
        }
    }, 10);
}

async function resetTimer() {
    clearInterval(timerInterval);
    timeLeft = 70;
    milliseconds = 0;
    document.getElementById("timer").textContent = `01:10.0`;
    document.getElementById("dunkScore").textContent = '00.0';
    isTimerRunning = false;
    document.getElementById("status").textContent = "Status: Reiniciado";
    document.getElementById("status").className = "status-paused";
    document.querySelector("#dunksTable tbody").innerHTML = "";

    try {
        await axios.post(`${apiUrl}/reset-challenge`);
        updateTotalScore();
    } catch (error) {
        console.error("Error resetting challenge:", error);
    }
}

loadJudges();