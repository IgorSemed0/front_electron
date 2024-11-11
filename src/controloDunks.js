const axios = require('axios');
const ws = new WebSocket("ws://127.0.0.1:8080");

const apiUrl = 'http://127.0.0.1:8002/api/grupo2';
let selectedChallenge = null;
let selectedRound = null;
let isTimerRunning = false;

// Conexão WebSocket
ws.onopen = () => {
    console.log("Connected to WebSocket in dunks control");
};

// Function to send participant data via WebSocket
async function sendChallengeData(challengeId) {
    try {
        await axios.post(`${apiUrl}/dunks/update-dunk-player/${challengeId}`);
        ws.send(JSON.stringify({ 
            action: "updateCurrentPlayer",
            data: {challengeId: challengeId },
            competitionType: "dunks"
        }));
        console.log("Tunnel activated with participant ID: " + challengeId);
    } catch (error) {
        console.error('Error updating current player:', error);
    }
}

// Function to load available challenges (only for dunks)
async function loadChallenges() {
    try {
        const response = await axios.get(`${apiUrl}/challenge`);
        const challenges = response.data.filter(challenge => challenge.it_id_competicao === 2);
        const challengeSelect = document.getElementById('challengeSelect');
        challengeSelect.innerHTML = '<option value="">Select a player</option>';
        for (const challenge of challenges) {
            const jogadorNome = await getJogadorNome(challenge.it_id_jogador);
            const option = document.createElement('option');
            option.value = challenge.id;
            option.textContent = `Player: ${jogadorNome}`;
            challengeSelect.appendChild(option);
        }
        challengeSelect.addEventListener('change', async (e) => {
            selectedChallenge = e.target.value;
            if (selectedChallenge) {
                await sendChallengeData(selectedChallenge);
                await loadDunksForChallenge(selectedChallenge);
                await updateCurrentChallenge(selectedChallenge);
            }
        });
    } catch (error) {
        console.error('Error loading challenges:', error);
    }
}


// Function to get player name
async function getJogadorNome(jogadorId) {
    try {
        const response = await axios.get(`http://127.0.0.1:8002/api/grupo1/jogadores/${jogadorId}`);
        return response.data.vc_name;
    } catch (error) {
        console.error(`Error loading player name ${jogadorId}:`, error);
        return 'Unknown player';
    }
}

// Function to load rounds
async function loadRounds() {
    try {
        const response = await axios.get('http://127.0.0.1:8002/api/grupo1/rounds');
        const rounds = response.data;
        const roundSelect = document.getElementById('roundSelect');
        roundSelect.innerHTML = '<option value="">Select a round</option>';
        rounds.forEach(round => {
            const option = document.createElement('option');
            option.value = round.id;
            option.textContent = `Round ${round.it_numero}`;
            roundSelect.appendChild(option);
        });
        const responses = await axios.get(`${apiUrl}/get-dunk-current-challenge`);       
        const challengeId = responses.data.it_challenge;

        console.log('entrei aqui '+challengeId);
        roundSelect.addEventListener('change', async (e) => {
            selectedRound = e.target.value;
            await updateCurrentRound(selectedRound);            
            // await sendChallengeData(challengeId);
            // await loadDunksForChallenge(challengeId);
            // await updateCurrentChallenge(challengeId);
           
        });
    } catch (error) {
        console.error('Error loading rounds:', error);
    }
}


// Function to load dunks for a specific challenge
async function getDunksForChallenge(challengeId) {
    try {
        const response = await axios.get(`${apiUrl}/dunks?it_id_participante=${challengeId}`);
        return response.data;
    } catch (error) {
        console.error('Error loading dunks:', error);
        return [];
    }
}

async function loadDunksForChallenge(challengeId) {
    try {
        const dunks = await getDunksForChallenge(challengeId);
        updateDunksTable(dunks);
    } catch (error) {
        console.error('Error loading dunks:', error);
    }
}

// Function to update the dunks table
function updateDunksTable(dunks) {
    const tableBody = document.querySelector("#dunksTable tbody");
    tableBody.innerHTML = '';
    dunks.forEach(dunk => {
        const newRow = tableBody.insertRow();
        newRow.innerHTML = `
            <td>${dunk.it_id_round}</td>
            <td>${dunk.vc_dificuldade}</td>
            ${dunk.pontuacoesJuris.map(j => `<td>${j.fl_pontuacao.toFixed(1)}</td>`).join('')}
            <td>${dunk.fl_pontuacao.toFixed(1)}</td>
        `;
    });
}


// Função para registrar um dunk
document.getElementById('dunkBtn').addEventListener('click', async () => {
    if (!selectedChallenge || !selectedRound) {
        alert("Select the player and round.");
        return;
    }

    const pontuacoes = [
        { it_id_juri: 1, fl_pontuacao: parseFloat(document.getElementById('pontuacoesJuri1').value) },
        { it_id_juri: 2, fl_pontuacao: parseFloat(document.getElementById('pontuacoesJuri2').value) },
        { it_id_juri: 3, fl_pontuacao: parseFloat(document.getElementById('pontuacoesJuri3').value) },
        { it_id_juri: 4, fl_pontuacao: parseFloat(document.getElementById('pontuacoesJuri4').value) }
    ];

    const dunk = {
        it_dunk_numero: parseInt(selectedRound),
        it_id_round: parseInt(selectedRound),
        vc_dificuldade: document.getElementById('dunkDificuldade').value,
        it_id_participante: parseInt(selectedChallenge),
        pontuacoes: pontuacoes,
    };

    try {
        const response = await axios.post(`${apiUrl}/dunks`, dunk);
        console.log('Dunk registered:', response.data);
        
        // Update dunks table after registration
        await loadDunksForChallenge(selectedChallenge);
        
        // Send updated data via WebSocket
        ws.send(JSON.stringify({
            action: "addDunk",
            competitionType: "dunks",
            dunk: response.data
        }));

        // Clear difficulty and score fields after registration
        document.getElementById('pontuacoesJuri1').value = '';
        document.getElementById('pontuacoesJuri2').value = '';
        document.getElementById('pontuacoesJuri3').value = '';
        document.getElementById('pontuacoesJuri4').value = '';
    } catch (error) {
        console.error('Error registering dunk:', error);
    }
});

// Function to update the current round
async function updateCurrentRound(selectedRound) {
    try {
        
        await axios.post(`${apiUrl}/dunks/update-dunk-round/${selectedRound}`);
        console.log('Current round updated:', selectedRound);
        ws.send(JSON.stringify({
            action: "updateCurrentRound",
            competitionType: "dunks",
            selectedRound: selectedRound
        }));
    } catch (error) {
        console.error('Error updating current round:', error);
    }
}

// Function to update the current challenge
async function updateCurrentChallenge(challengeId) {
    try {
        await axios.post(`${apiUrl}/dunks/update-dunk-challenge/${challengeId}`);
        console.log('Current challenge updated:', challengeId);
    } catch (error) {
        console.error('Error updating current challenge:', error);
    }
}

// Funções de controle do Timer
document.getElementById('startTimerBtn').addEventListener('click', () => {
    if (selectedChallenge) {
        sendChallengeData(selectedChallenge);
        ws.send(JSON.stringify({
            action: "startTimer",
            competitionType: "dunks"
        }));
        isTimerRunning = true;
        document.getElementById('dunkBtn').disabled = false;
    } else {
        alert("Por favor, selecione um jogador primeiro.");
    }
});

document.getElementById('pauseTimerBtn').addEventListener('click', () => {
    ws.send(JSON.stringify({
        action: "pauseTimer",
        competitionType: "dunks"
    }));
    isTimerRunning = false;
});

document.getElementById('resetTimerBtn').addEventListener('click', () => {
    ws.send(JSON.stringify({
        action: "resetTimer",
        competitionType: "dunks"
    }));
    isTimerRunning = false;
});

// Função para atualizar os dados em tempo real
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.competitionType === "dunks") {
        if (data.action === "updatePlayerDunks") {
            updatePlayerDunks(data.dunks);
        } else if (data.action === "addDunk") {
            updateScore(data);
        } else {
            handleTimerAction(data.action);
        }
    }
};

function handleTimerAction(action) {
    if (action === "startTimer") {
        startTimer();
        isTimerRunning = true;
        document.getElementById("status").textContent = "Status: Ativo";
        document.getElementById("status").className = "status-active";
    } else if (action === "pauseTimer") {
        clearInterval(timerInterval);
        isTimerRunning = false;
        document.getElementById("status").textContent = "Status: Pausado";
        document.getElementById("status").className = "status-paused";
    } else if (action === "resetTimer") {
        resetTimer();
    }
}

function updatePlayerDunks(dunks) {
    const tableBody = document.querySelector("#dunksTable tbody");
    if (!tableBody) {
        console.error('Dunks table body not found');
        return;
    }

    tableBody.innerHTML = ''; // Limpa a tabela antes de atualizar

    dunks.forEach(dunk => {
        const pontuacoes = dunk.pontuacoesJuris || [];
        const media = calculateAverageScore(pontuacoes); // Calcula a média das pontuações

        const newRow = tableBody.insertRow();
        newRow.innerHTML = `
            <td>${dunk.it_id_round || '-'}</td>
            <td>${dunk.vc_dificuldade || '-'}</td>
            <td>${pontuacoes[0]?.fl_pontuacao.toFixed(1) || '-'}</td>
            <td>${pontuacoes[1]?.fl_pontuacao.toFixed(1) || '-'}</td>
            <td>${pontuacoes[2]?.fl_pontuacao.toFixed(1) || '-'}</td>
            <td>${pontuacoes[3]?.fl_pontuacao.toFixed(1) || '-'}</td>
            <td>${media.toFixed(1)}</td>
        `;
    });
}

function calculateAverageScore(pontuacoes) {
    if (!Array.isArray(pontuacoes) || pontuacoes.length === 0) return 0;
    const sum = pontuacoes.reduce((acc, curr) => acc + (parseFloat(curr.fl_pontuacao) || 0), 0);
    return sum / pontuacoes.length;
}

// Função para atualizar o round atual
async function updateCurrentRound(selectedRound) {
    try {
        const response = await axios.get(`${apiUrl}/get-dunk-current-player`);
        const player = response.data.player;
        const playerId = response.data.playerId;
        const it_challenge = response.data.it_challenge;
        await axios.post(`${apiUrl}/dunks/update-dunk-round/${selectedRound}`);
        console.log('Current round updated:', selectedRound);
        ws.send(JSON.stringify({
            action: "updateCurrentRound",
            competitionType: "dunks",
            selectedRound: selectedRound,
            player:player,
            playerId:playerId,
            it_challenge:it_challenge

        }));
    } catch (error) {
        console.error('Error updating current round:', error);
    }
}

// Função para atualizar o challenge atual
async function updateCurrentChallenge(challengeId) {
    try {
        await axios.post(`${apiUrl}/dunks/update-dunk-challenge/${challengeId}`);
        console.log('Challenge atual atualizado:', challengeId);
    } catch (error) {
        console.error('Erro ao atualizar challenge atual:', error);
    }
}


// Inicialização
loadChallenges();
loadRounds();