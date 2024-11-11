const axios = require('axios');
const ws = new WebSocket("ws://127.0.0.1:8080");
const apiUrl = 'http://127.0.0.1:8002/api/grupo2/pontuacao-por-posicao';
const apiUrlRound = 'http://127.0.0.1:8002/api/grupo2/pontuacoes/get-current-round';
const apiUrlChallenge = 'http://127.0.0.1:8002/api/grupo2/pontuacoes/get-current-challenge';
const apiUrlUpdatePlayerPoint = 'http://127.0.0.1:8002/api/grupo2/pontuacao/update-point';
const apiUrlDeletePlayerPoint = 'http://127.0.0.1:8002/api/grupo2/pontuacao';

const apiUrlTempo = 'http://127.0.0.1:8002/api/grupo2/pontuacoes/get-current-point';

let selectedChallenge = null;
let selectedRound = null;
let selectedPosicao = null;
let sendChallengeTunel = null;
let isTimerRunning = false; // Variável de controle para o status do timer
document.getElementById('basketBtn').disabled = true;

// Conexão WebSocket
ws.onopen = () => {
  console.log("Conectado ao WebSocket no controle");
};

function sendChallengeData(challengeId) {
  ws.send(JSON.stringify({ it_id_participante: challengeId }));
  console.log("Tunel ativado com participante ID: " + challengeId);
}


async function load_round_postition_pts() {
  try {
    console.log("joves");

    const ChallengeData = await axios.get(`${apiUrlChallenge}`);
    const it_challenge = ChallengeData.data.it_challenge;
    const roundData = await axios.get(`${apiUrlRound}`);
    const it_round = roundData.data.it_round;
    const response = await axios.get(`${apiUrl}/${it_challenge}/${it_round}`);
    const points = response.data;

    const pointsTableBody = document.querySelector("#pointsTable tbody");
    pointsTableBody.innerHTML = "";

    let lastPosicaoNome = null; // Variável para armazenar a última posição exibida

    points.forEach((point) => {
      console.log(point);

      // Verifica se a posição mudou em relação à anterior
      if (lastPosicaoNome && lastPosicaoNome !== point.posicao_nome) {
        // Cria uma linha em branco
        const blankRow = document.createElement("tr");
        blankRow.innerHTML = `<td  colspan="8" style="height: 50px;background:black"></td>`;
        pointsTableBody.appendChild(blankRow);
      }

      // Cria a linha para o ponto atual
      const row = document.createElement("tr");
        // IDs únicos para cada botão
const btnId0 = `update_circles_0_${point.pontuacaoId}`;
const btnId1 = `update_circles_1_${point.pontuacaoId}`;
const btnId2 = `update_circles_2_${point.pontuacaoId}`;
const btnId3 = `update_circles_3_${point.pontuacaoId}`;
const deleteBtnId = `delete_btn_${point.pontuacaoId}`;

row.innerHTML = `
  <td>${point.pontuacaoId}</td>
  <td>${point.jogador_nome}</td>
  <td>${point.round_numero}</td>
  <td>${point.posicao_nome}</td>
  <td>${point.ponto}</td>
  <td>
    <button id="${btnId0}" onclick="edit_point(${point.pontuacaoId}, ${point.roundId}, ${point.posicaoId}, ${point.challengeId}, 0)">0 Ponto</button>
    <button id="${btnId1}" onclick="edit_point(${point.pontuacaoId}, ${point.roundId}, ${point.posicaoId}, ${point.challengeId}, 1)">1 Ponto</button>
    <button id="${btnId2}" onclick="edit_point(${point.pontuacaoId}, ${point.roundId}, ${point.posicaoId}, ${point.challengeId}, 2)">2 Pontos</button>
    <button id="${btnId3}" onclick="edit_point(${point.pontuacaoId}, ${point.roundId}, ${point.posicaoId}, ${point.challengeId}, 3)">3 Pontos</button>
    <button id="${deleteBtnId}" onclick="delete_point(${point.pontuacaoId})">Deletar</button>
  </td>
`;

pointsTableBody.appendChild(row);

// Adiciona eventListener para o botão de atualização de círculos
document.getElementById(btnId0).addEventListener('click', () => {
  ws.send(JSON.stringify({ action: "updated_circle", pontos: 0 }));
});

document.getElementById(btnId1).addEventListener('click', () => {
  ws.send(JSON.stringify({ action: "updated_circle", pontos: 1 }));
});

document.getElementById(btnId2).addEventListener('click', () => {
  ws.send(JSON.stringify({ action: "updated_circle", pontos: 2 }));
});

document.getElementById(btnId3).addEventListener('click', () => {
  ws.send(JSON.stringify({ action: "updated_circle", pontos: 3 }));
});

document.getElementById(deleteBtnId).addEventListener('click', () => {
  ws.send(JSON.stringify({ action: "updated_circle" }));
});

      pointsTableBody.appendChild(row);

      // Atualiza a última posição exibida
      lastPosicaoNome = point.posicao_nome;
    });
  } catch (error) {
    console.error('Erro ao carregar points:', error);
  }
}

document.getElementById('pointForm').addEventListener('keyup', async function (event) {
  event.preventDefault();   
  const tm_tempo = document.getElementById('tm_tempo').value;   
  try {        
      await axios.post('http://127.0.0.1:8002/api/grupo2/pontuacoes/update-or-create-point', {           
          tm_tempo: tm_tempo           
        });             
    loadposicoes();
    clearForm();
  } catch (error) {
    console.error('Erro ao salvar posicao:', error.response ? error.response.data : error.message);
  }
}); 

async function edit_point(pontuacaoId,roundId,posicaoId,challengeId, ponto  ) {
  try {
    const date = new Date();
    const formattedDate = date.toISOString().split('T')[0];   
     const response =await axios.post(`${apiUrlUpdatePlayerPoint}/${pontuacaoId}`, {           
      it_ponto: ponto ,
      it_id_posicao: posicaoId ,
      it_id_round: roundId ,
      it_id_participante: challengeId ,
      dt_registro:formattedDate
    });
    const updated = response.data;
    // if(updated){
     await loadChallenges();
     await loadRounds();
     await loadPosicoes();
    // }   
    console.log('point '+pontuacaoId+' round '+roundId+' position '+posicaoId+' challenge '+challengeId+' pont value '+ponto);
    // document.getElementById('posicaoId').value = posicao.id;    
    // document.getElementById('vc_nome').value = posicao.vc_nome;    
  } catch (error) {
    console.error('Erro ao carregar posicao para edição:', error);
  }
}

async function delete_point(pontuacaoId) {
  try {

    const date = new Date();
    const formattedDate = date.toISOString().split('T')[0];

   
     const response =await axios.delete(`${apiUrlDeletePlayerPoint}/${pontuacaoId}`);
    const updated = response.data;

    // if(updated){

     await loadChallenges();
     await loadRounds();
     await loadPosicoes();
     load_round_postition_pts()

    // }
    

    console.log('point '+pontuacaoId+' round '+roundId+' position '+posicaoId+' challenge '+challengeId+' pont value '+ponto);

    // document.getElementById('posicaoId').value = posicao.id;    
    // document.getElementById('vc_nome').value = posicao.vc_nome;    
  } catch (error) {
    console.error('Erro ao deletera ponto:', error);
  }
}



// Função para carregar os challenges disponíveis
async function loadChallenges() {
  try {
    
    const response = await axios.get('http://127.0.0.1:8002/api/grupo2/challenge');
    //const challenges = response.data;
    const challenges = response.data.filter(challenge => challenge.it_id_competicao === 1); // Filtra apenas desafios de 3 pontos
    // challengeSelect.innerHTML = '<option value="">Selecione um jogador</option>';
    
    const challengeSelect = document.getElementById('challengeSelect');
    challengeSelect.innerHTML = '<option value="">Selecione um jogador</option>';
    for (const challenge of challenges) {
      const jogadorNome = await  getJogadorNome(challenge.it_id_jogador);
      
      const option = document.createElement('option');
      option.value = challenge.id;
      console.log('jogador '+jogadorNome)
      option.textContent = `Jogador: ${jogadorNome} `;
      challengeSelect.appendChild(option);
    }

    // Função para enviar o participante via WebSocket
    sendChallengeTunel = (selectedChallenge) => {
      ws.send(JSON.stringify({ it_id_participante: selectedChallenge }));
      console.log("Tunel ativado com participante ID: " + parseInt(selectedChallenge));
      axios.post(`http://127.0.0.1:8002/api/grupo2/pontuacoes/update-3p-round/${parseInt(selectedRound)}`, {
      
      });

      axios.post(`http://127.0.0.1:8002/api/grupo2/pontuacoes/update-3p-player/${parseInt(selectedChallenge)}`, {
      
      });
      // load_round_postition_pts()
      getTempo();
    };

    sendRoundTunel = (selectedRound) => {
      ws.send(JSON.stringify({ it_id_round: selectedRound }));
      console.log("Tunel ativado com round ID: " + parseInt(selectedRound));

       axios.post(`http://127.0.0.1:8002/api/grupo2/pontuacoes/update-3p-round/${parseInt(selectedRound)}`, {
      
      });

      // load_round_postition_pts()
      getTempo();

     
    };
    

    // Evento ao mudar de challenge
    challengeSelect.addEventListener('change', (e) => {
      selectedChallenge = e.target.value;
      console.log("dev ser esse2 "+ parseInt(selectedChallenge))      
        ws.send(JSON.stringify({ it_id_participante: selectedChallenge }));
        axios.post(`http://127.0.0.1:8002/api/grupo2/pontuacoes/update-3p-challenge/${parseInt(selectedChallenge)}`, {
      
        });
        axios.post(`http://127.0.0.1:8002/api/grupo2/pontuacoes/update-3p-player/${parseInt(selectedChallenge)}`, {
      
        });
        // load_round_postition_pts()
        getTempo();
      
    });

  } catch (error) {
    console.error('Erro ao carregar challenges:', error);
  }
}


// Função para obter o nome do jogador
async function getJogadorNome(jogadorId) {
  try {
    const response = await axios.get(`http://127.0.0.1:8002/api/grupo1/jogadores/${jogadorId}`);
    console.log('joga '+response.data.vc_name)
    return response.data.vc_name;
  } catch (error) {
    console.error(`Erro ao carregar nome do jogador ${jogadorId}:`, error);
    return 'Jogador desconhecido';
  }
}

// Função para carregar os rounds
async function loadRounds() {
  try {
    // load_round_postition_pts()
    getTempo();
    const response = await axios.get('http://127.0.0.1:8002/api/grupo1/rounds');
    const rounds = response.data;

    
    
    const roundSelect = document.getElementById('roundSelect');
    roundSelect.innerHTML = '<option value="">Selecione o Round</option>';
    rounds.forEach(round => {
      const option = document.createElement('option');
      option.value = round.id;
      option.textContent = `Round ${round.it_numero}`;
      roundSelect.appendChild(option);
    });

    // Evento ao mudar de round
    roundSelect.addEventListener('change', (e) => {
      load_round_postition_pts()
      selectedRound = e.target.value;
      sendRoundTunel(selectedRound);

      
  
      // console.log('data novo: ' + JSON.stringify(response2));
    });

  } catch (error) {
    console.error('Erro ao carregar rounds:', error);
  }
}

// Função para carregar as posições
async function loadPosicoes() {
  try {
    
    getTempo();
   
    const response = await axios.get('http://127.0.0.1:8002/api/grupo1/posicoes');
    const posicoes = response.data;


   

    const posicaoSelect = document.getElementById('posicaoSelect');
    posicaoSelect.innerHTML = '<option value="">Selecione a Posição</option>';
    posicoes.forEach(posicao => {
      const option = document.createElement('option');
      option.value = posicao.id;
      option.textContent = posicao.vc_nome;
      posicaoSelect.appendChild(option);
    });

    // Evento ao mudar de posição
    posicaoSelect.addEventListener('change', (e) => {
      //  load_round_postition_pts()
      
      selectedPosicao = e.target.value;
    });

  } catch (error) {
    console.error('Erro ao carregar posições:', error);
  }
}


// Função para adicionar 3 pontos e enviar para o servidor
document.getElementById('basketBtn').addEventListener('click', async () => {
  if (!selectedChallenge || !selectedRound || !selectedPosicao) {
    alert("Por favor, selecione o challenge, o round e a posição.");
    return;
  }

// Dentro da função para adicionar 3 pontos
const pontuacao = {
    it_ponto: 1, // Incremento de 3 pontos
    it_id_round: parseInt(selectedRound),
    it_id_posicao: parseInt(selectedPosicao),
    dt_registro: new Date().toISOString(),
    it_id_participante: parseInt(selectedChallenge) // Convertendo para inteiro
};



  try {
    const response = await axios.post('http://127.0.0.1:8002/api/grupo2/pontuacao', pontuacao);
    console.log('Pontuação registrada:', response.data);
    // Enviar mensagem via WebSocket para exibição
    sendChallengeTunel(selectedChallenge);
    ws.send(JSON.stringify({ action: "addPoints", points: 1 }));
    load_round_postition_pts()
  } catch (error) {
    console.error('Erro ao registrar pontuação:', error);
  }
});

document.getElementById('basketBtn2').addEventListener('click', async () => {
  if (!selectedChallenge || !selectedRound || !selectedPosicao) {
    alert("Por favor, selecione o challenge, o round e a posição.");
    return;
  }

// Dentro da função para adicionar 3 pontos
const pontuacao = {
    it_ponto: 2, // Incremento de 3 pontos
    it_id_round: parseInt(selectedRound),
    it_id_posicao: parseInt(selectedPosicao),
    dt_registro: new Date().toISOString(),
    it_id_participante: parseInt(selectedChallenge) // Convertendo para inteiro
};



  try {
    const response = await axios.post('http://127.0.0.1:8002/api/grupo2/pontuacao', pontuacao);
    console.log('Pontuação registrada:', response.data);
    // Enviar mensagem via WebSocket para exibição
    sendChallengeTunel(selectedChallenge);
    ws.send(JSON.stringify({ action: "addPoints", points: 2 }));
    load_round_postition_pts()
  } catch (error) {
    console.error('Erro ao registrar pontuação:', error);
  }
});
document.getElementById('basketBtn3').addEventListener('click', async () => {
  if (!selectedChallenge || !selectedRound || !selectedPosicao) {
    alert("Por favor, selecione o challenge, o round e a posição.");
    return;
  }

// Dentro da função para adicionar 3 pontos
const pontuacao = {
    it_ponto: 3, // Incremento de 3 pontos
    it_id_round: parseInt(selectedRound),
    it_id_posicao: parseInt(selectedPosicao),
    dt_registro: new Date().toISOString(),
    it_id_participante: parseInt(selectedChallenge) // Convertendo para inteiro
};



  try {
    const response = await axios.post('http://127.0.0.1:8002/api/grupo2/pontuacao', pontuacao);
    console.log('Pontuação registrada:', response.data);
    // Enviar mensagem via WebSocket para exibição
    sendChallengeTunel(selectedChallenge);
    ws.send(JSON.stringify({ action: "addPoints", points: 3 }));
    load_round_postition_pts()
  } catch (error) {
    console.error('Erro ao registrar pontuação:', error);
  }
});

document.getElementById('basketBtnZero').addEventListener('click', async () => {
  if (!selectedChallenge || !selectedRound || !selectedPosicao) {
    alert("Por favor, selecione o challenge, o round e a posição.");
    return;
  }

// Dentro da função para adicionar 3 pontos
const pontuacao = {
    it_ponto: 0, // Incremento de 3 pontos
    it_id_round: parseInt(selectedRound),
    it_id_posicao: parseInt(selectedPosicao),
    dt_registro: new Date().toISOString(),
    it_id_participante: parseInt(selectedChallenge) // Convertendo para inteiro
};



  try {
    const response = await axios.post('http://127.0.0.1:8002/api/grupo2/pontuacao', pontuacao);
    console.log('Pontuação registrada:', response.data);
    // Enviar mensagem via WebSocket para exibição
    sendChallengeTunel(selectedChallenge);
    ws.send(JSON.stringify({ action: "addPoints", points: 0 }));
    load_round_postition_pts()
  } catch (error) {
    console.error('Erro ao registrar pontuação:', error);
  }
});

async function getTempo() {
  try {
      // Faz a requisição para obter o tempo
      const response = await axios.get(`${apiUrlTempo}`);
      
      // Extrai o valor do tempo da resposta
      const tm_tempo = response.data.tm_tempo;
      
      console.log('Tempo atual:', tm_tempo);
      
      // Atualiza o campo input com o valor do tempo
      document.getElementById('tm_tempo').value = tm_tempo;

  } catch (error) {
      console.error('Erro ao buscar o tempo:', error);
  }
}





// Funções de controle do Timer
document.getElementById('startTimerBtn').addEventListener('click', () => {
  if (selectedChallenge) {
    // Usar o túnel para enviar o participante selecionado
    sendChallengeTunel(selectedChallenge);

    // Enviar comando para iniciar o timer
    ws.send(JSON.stringify({ action: "startTimer" }));
    console.log("Iniciando o timer com participante ID: " + selectedChallenge);
    document.getElementById('basketBtn').disabled = false; 
    document.getElementById('basketBtnZero').disabled = false; 
     
  } else {
    alert("Por favor, selecione um challenge primeiro.");
  }
});

document.getElementById('pauseTimerBtn').addEventListener('click', () => {
  ws.send(JSON.stringify({ action: "pauseTimer" }));
  document.getElementById('basketBtn').disabled = true; 
  document.getElementById('basketBtnZero').disabled = true; 
});

document.getElementById('resetTimerBtn').addEventListener('click', () => {
  ws.send(JSON.stringify({ action: "resetTimer" }));
  document.getElementById('basketBtn').disabled = true; 
  document.getElementById('basketBtnZero').disabled = true; 
});

ws.onmessage = async (event) => {
  if (event.data instanceof Blob) {
    const text = await event.data.text();
    const data = JSON.parse(text);   
    try {
      if (data) {        
        document.getElementById('basketBtn').disabled = true; 
        document.getElementById('basketBtnZero').disabled = true;        
      }
    } catch (error) {
      console.error('Error fetching data for participant:', error);
    }
  } else {
    try {     
        
      console.log('opas', data3);   
      
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }
};

// Carregar dados ao iniciar
loadChallenges();
loadRounds();
loadPosicoes();

