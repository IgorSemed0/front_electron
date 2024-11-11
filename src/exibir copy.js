const axios = require('axios');
const apiUrl = 'http://127.0.0.1:8002/api/grupo2/pontuacao-individual';
const apiUrl2 = 'http://127.0.0.1:8002/api/grupo2/dados-individual';
const apiUrl3 = 'http://127.0.0.1:8002/api/grupo2/dado-individual';
const apiUrl4 = 'http://127.0.0.1:8002/api/grupo2/dados-todos';
const apiUrl5 = 'http://127.0.0.1:8002/api/grupo2/pontuacoes/get-current-round';
const apiUrl6 = 'http://127.0.0.1:8002/api/grupo2/pontuacoes/get-current-challenge';
const apiUrl7 = 'http://127.0.0.1:8002/api/grupo2/pontuacao-por-posicao';
const apiUrlTempo = 'http://127.0.0.1:8002/api/grupo2/pontuacoes/get-current-point';
const apiUrlCompeticao = 'http://127.0.0.1:8002/api/grupo1/competicao'; // URL para competições
const apiUrlJogador = 'http://127.0.0.1:8002/api/grupo1/jogadores'; // URL para jogadores
function formatarPontuacao(pontuacao) {
  return String(pontuacao).padStart(2, '0');
}
let timerInterval;
let timeLeft = 70; // Tempo total em segundos (pode ser ajustado)
let milliseconds = 0; // Milissegundos
let isTimerRunning = false;
const ws = new WebSocket("ws://127.0.0.1:8080");
ws.onopen = () => {
  console.log("Conectado ao WebSocket na exibiçãoa");
};
// Função para carregar todos os datas
async function loadDatas(data3) {
  try {
    if (data3) {
      console.log('tenho');
      console.log('ss3 ' + data3.jogador_nome);

      // Fazendo as requisições
      const response = await axios.get(`${apiUrl}/${data3.challengeId?data3.challengeId:data3}`);
      const response2 = await axios.get(apiUrl2);
      const datas = response.data;     
      // Agrupar os dados por round
      const groupedByRound = datas.reduce((acc, data) => {
        if (!acc[data.round_numero]) {
          acc[data.round_numero] = [];
        }
        acc[data.round_numero].push(data);
        return acc;
      }, {});
      // Selecionando o corpo da tabela
      const datasTableBody = document.querySelector("#datasTable tbody");
      datasTableBody.innerHTML = "";

      // Iterando pelos rounds agrupados
      for (const round in groupedByRound) {
        const roundData = groupedByRound[round];
        let firstRow = true;

        roundData.forEach((data) => {
          const row = document.createElement("tr");
          
          // Se for a primeira linha deste round, adicionar as células com rowspan
          if (firstRow) {
            row.innerHTML = `
              <td scope="row">${data.posicao_nome}</td>          
              <td scope="row" rowspan="${roundData.length}">${data.round_numero}</td>        
              <td scope="row">${data.total_posicao_pontos}</td>     
              <td scope="row" rowspan="${roundData.length}">${data.total_round_pontos}</td>    
            `;
            firstRow = false;
          } else {
            // Para as outras linhas do mesmo round, não adicionar as células de "round_numero" e "PONTOS DO ROUND"
            row.innerHTML = `
              <td scope="row">${data.posicao_nome}</td>          
              <td scope="row">${data.total_posicao_pontos}</td>     
            `;
          }
          datasTableBody.appendChild(row);
        });
      }
      const response3 = await axios.get('http://127.0.0.1:8002/api/grupo2/pontuacoes/get-current-3p-player');   
       const jogador3 = response3.data.player;
       const jogador3Foto = response3.data.foto;
    console.log('nome da pessa '+jogador3Foto)      

      // Atualizando o nome do jogador na exibição
      const jogador = document.querySelector("#jogador");
      const elementoFoto = document.querySelector('#jogadorFoto img');
const fotoSrc = elementoFoto.getAttribute('src');
const arquivo_atual = fotoSrc.split('/').pop();
const arquivo_novo= jogador3Foto.split('/').pop();
console.log('Foto: ' + arquivo_atual+'novo'+arquivo_novo);      
       jogador.innerHTML = `<h2 id="jogador" class="player-name">${jogador3}</h2>`;
      const jogadorFoto = document.querySelector("#jogadorFoto");
      if(arquivo_atual!=arquivo_novo){
        jogadorFoto.innerHTML = `<img  src="http://127.0.0.1:8002/storage/${jogador3Foto}" alt="Lebron James" class="player-image2"></img>`;
      }   
      // Atualizando o cabeçalho da tabela com nome do jogador e pontos totais
      const datasTrBody = document.querySelector("#datasTable thead");
      datasTrBody.innerHTML = `        
        <tr>
          <th class="text-uppercase fs-4" colspan="3"> ${data3.jogador_nome}</th>     
          <td scope="row" class="text-end font-weight-bold fs-4 fw-bold">TOTAL DE PONTOS: ${data3.total_geral_pontos}</td>
        </tr>
        <tr>
          <th scope="col">POSIÇÃO</th>
          <th scope="col">ROUND</th>
          <th scope="col">PONTOS DA POSIÇÃO</th>
          <th scope="col">PONTOS DO ROUND</th>
        </tr>
      `;
    }
  } catch (error) {
    console.error('Erro ao carregar datas:', error);
  }
}
async function loadPlayers(dados, it_round) {
  try {
    // if (dados) {
      console.log('jogadoress3 '+dados); 
      // Fazendo a requisição para obter os dados dos jogadores
      // const response = await axios.get(`${apiUrl4}/${dados.competicaoId?dados.competicaoId:dados}/${it_round}`);
      const response = await axios.get(`${apiUrl4}/${dados.competicaoId?dados.competicaoId:1}/${it_round}`);
      const players = response.data;  // Aqui temos a lista de jogadores
      console.log('sss ' + players);
      // Selecionando o aside onde os jogadores serão exibidos
      const rankingAside = document.querySelector("#ranking");
      rankingAside.innerHTML = "";  // Limpando o conteúdo anterior
      // Iterando pela lista de jogadores para criar os itens de ranking
      players.forEach(player => {
        // Criando o item de ranking com as informações do jogador
        const rankItem = document.createElement("div");
        rankItem.classList.add("rank-item");
        // Adicionando conteúdo ao rank-item
        rankItem.innerHTML = `
          <div class="player-image-wrapper"> 
            <img class="player-image" src="http://127.0.0.1:8002/storage/${player.vc_profile?player.vc_profile:'https://storage.googleapis.com/nbarankings-theringer-com-cms/public/media/ringerbasketballhub/players/NikolaJokic-small.png'} "
              alt="Player">
          </div>
          <p class="jogador-info2">
            ${player.jogador_nome} | 
            <span>
              <span style="font-size: x-large;" class="pontos-wrapper">${player.total_round_pontos}</span>
              <sub class="sub-text">pts</sub>
            </span>
          </p>
        `;
        // Adicionando o item de ranking ao aside
        rankingAside.appendChild(rankItem);
      });
    // }
  } catch (error) {
    console.error('Erro ao carregar os dados dos jogadores:', error);
  }
}
// WebSocket handling
ws.onmessage = async (event) => {
  if (event.data instanceof Blob) {
    const text = await event.data.text();
    const data = JSON.parse(text);
    event.data.text().then((text) => processMessage(text));
    const ChallengeData =await axios.get(`${apiUrl6}`);
         const it_challenge = ChallengeData.data.it_challenge; 
        const roundData = await  axios.get(`${apiUrl5}`);
        const it_round =  roundData.data.it_round;    
    try {
      if(it_challenge){     
        
        const ChallengeData =await axios.get(`${apiUrl6}`);
         const it_challenge = ChallengeData.data.it_challenge; 
        const roundData = await  axios.get(`${apiUrl5}`);
        const it_round =  roundData.data.it_round; 
        const response3 = await axios.get(`${apiUrl3}/${it_challenge}`);
        const data3 = response3.data;        
        console.log('pt233_espaciais', data);
        const datasTrBody = document.querySelector("#datasTable thead");
        datasTrBody.prepend(document.createTextNode(data3));  // Handle the DOM update
        loadDatas(it_challenge);
       await loadPlayers(it_challenge, it_round);
       await updatePositions(it_challenge, it_round);
       
      }
      if (data.it_id_participante) {
        const response3 = await axios.get(`${apiUrl3}/${data.it_id_participante ? data.it_id_participante : text.it_id_participante}`);
        const data3 = response3.data;
        const roundData = await axios.get(`${apiUrl5}`);
        const it_round = roundData.data.it_round;       
        console.log('pt233_espaciais_2', data3+' '+data);
        
        const datasTrBody = document.querySelector("#datasTable thead");
        datasTrBody.prepend(document.createTextNode(data3));  // Handle the DOM update
        loadDatas(data3);
        loadPlayers(data3, it_round);
         updatePositions(data3, it_round);
      }
    } catch (error) {
      console.error('Error fetching data for participant:', error);
    }
  } else {
    try {      
        processMessage(event.data);         
      const response3 = await axios.get(`${apiUrl3}/${data.it_id_participante ? data.it_id_participante : text.it_id_participante}`);
      const data3 = response3.data;
      console.log('opas', data3);
      // Assuming you want to display the new data in the header or body
      const datasTrBody = document.querySelector("#datasTable thead");
      datasTrBody.prepend(document.createTextNode(data3));  // Handle the DOM update
      loadDatas(data3);
      const roundData = await axios.get(`${apiUrl5}`);
        const it_round = roundData.data.it_round;  
      loadPlayers(data3,it_round);
      updatePositions(data3, it_round);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }
};
async function updatePositions(it_challenge, it_round) {
  try {
      // Faz a requisição ao endpoint e obtém os dados
      const response = await axios.get(`${apiUrl7}/${it_challenge}/${it_round}`);
      const data = response.data; // Acessa diretamente os dados retornados
      // Reseta a estrutura existente
      resetCircleContainer();
      // Agrupa as pontuações por posição
      const positionScores = {
          "Canto esquerdo (Corner Left)": [],
          "Ala esquerda (Wing Left)": [],
          "Special 2 points": [],
          "Topo do arco (Top of the Key)": [],
          "Special 3 points": [],
          "Ala direita (Wing Right)": [],
          "Canto direito (Corner Right)": []
      };
      inicializarScore(it_challenge, it_round)
      // Preenche os dados de pontuação nas posições
      data.forEach(item => {
          const posicao = item.posicao_nome;
          const ponto = item.ponto;
          if (positionScores[posicao] !== undefined) {
              positionScores[posicao].push({ id: item.pontuacaoId, ponto }); // Armazena o id junto com a pontuação             
          }
      });     
      // Gera a estrutura HTML para as séries e círculos
      generateCircles(positionScores);
      // Atualiza a cor dos círculos
      updateCircleColors(positionScores);
  } catch (error) {
      console.error('Erro ao buscar dados: ', error);
  }
}
// Função para resetar a estrutura dos círculos
function resetCircleContainer() {
  const container = document.querySelector('.series-container');
  container.innerHTML = ''; // Limpa o conteúdo existente
}
// Função para gerar círculos dinamicamente
function generateCircles2(positionScores) {
  const container = document.querySelector('.series-container');
  for (const [posicao, pontos] of Object.entries(positionScores)) {
      // Cria uma nova série para cada posição
      const seriesDiv = document.createElement('div');
      seriesDiv.classList.add('series');
      // Cria círculos para cada ponto na posição
      pontos.forEach(({ id, ponto }) => {
          const circleDiv = document.createElement('div');
          circleDiv.classList.add('circle', 'player-image-wrapper');
          circleDiv.setAttribute('data-position', posicao);
          circleDiv.id = `circle-${id}`; // ID único usando item.id
          seriesDiv.appendChild(circleDiv); // Adiciona o círculo à série
      });
      container.appendChild(seriesDiv); // Adiciona a série ao contêiner
  }
}
function generateCircles3(positionScores) {
    const container = document.querySelector('.series-container');
    for (const [posicao, pontos] of Object.entries(positionScores)) {
        // Remove parênteses e o texto dentro deles da variável posicao
        const cleanPosition = posicao.replace(/\s*\(.*?\)\s*/g, '');
        // Cria uma nova série para cada posição
        const seriesDiv = document.createElement('div');
        seriesDiv.classList.add('series');
        // Cria o cabeçalho para a série
        const header = document.createElement('div');
        header.classList.add('series-header');
        // Verifica e substitui os textos específicos
        if (cleanPosition === "Special 2 points" || cleanPosition === "Special 3 points") {
            header.textContent = "3 Pts"; // Define o texto como "3 Pts"
        } else {
            header.textContent = `Posição ${cleanPosition}`; // Define o texto padrão do cabeçalho
        }        
        seriesDiv.appendChild(header);
        // Cria o contêiner para as bolas
        const ballsDiv = document.createElement('div');
        ballsDiv.classList.add('series-balls');
        // Cria os círculos para cada ponto na posição
        pontos.forEach(({ id, ponto }) => {
            const circleDiv = document.createElement('div');
            circleDiv.classList.add('circle', 'player-image-wrapper');
            circleDiv.setAttribute('data-position', cleanPosition); // Usa a posição limpa
            circleDiv.id = `circle-${id}`; // ID único usando o item.id
            ballsDiv.appendChild(circleDiv); // Adiciona o círculo ao contêiner de bolas
        });
        seriesDiv.appendChild(ballsDiv); // Adiciona as bolas à série
        container.appendChild(seriesDiv); // Adiciona a série ao contêiner principal
    }
}
function generateCircles(positionScores) {
  const container = document.querySelector('.series-container');
  container.innerHTML = ''; // Limpa o contêiner
  for (const [index, [posicao, pontos]] of Object.entries(Object.entries(positionScores))) {
    const cleanPosition = posicao.replace(/\s*\(.*?\)\s*/g, '');
    // Cria uma nova série e define o atributo data-position
    const seriesDiv = document.createElement('div');
    seriesDiv.classList.add('series');
    seriesDiv.setAttribute('data-position', cleanPosition); // Define data-position
    const header = document.createElement('div');
    header.classList.add('series-header');
    // Verifica se o texto deve ser ajustado
    if (cleanPosition === 'Special 2 points' || cleanPosition === 'Special 3 points') {
      header.textContent = '3 Pts';
    } else {
      header.textContent = `Posição ${cleanPosition}`;
    }
    seriesDiv.appendChild(header);
    const ballsDiv = document.createElement('div');
    ballsDiv.classList.add('series-balls');
    if (pontos.length > 0) {
      pontos.forEach(({ id, ponto }) => {
        const circleDiv = document.createElement('div');
        circleDiv.classList.add('circle', 'player-image-wrapper');
        circleDiv.setAttribute('data-position', cleanPosition);
        circleDiv.id = `circle-${id}`;
        ballsDiv.appendChild(circleDiv);
      });
    } else {
      const numberOfCircles = (index == 2 || index == 4) ? 1 : 5;
      ballsDiv.innerHTML = '';
      for (let i = 0; i < numberOfCircles; i++) {
        const staticCircleDiv = document.createElement('div');
        staticCircleDiv.classList.add('circle', 'player-image-wrapper', 'no-score');
        staticCircleDiv.setAttribute('data-position', cleanPosition);
        staticCircleDiv.id = `circle-static-${index}-${i}`;
        ballsDiv.appendChild(staticCircleDiv);
      }
    }
    seriesDiv.appendChild(ballsDiv);
    container.appendChild(seriesDiv);
  }
}
// Função para atualizar as cores dos círculos
function updateCircleColors(positionScores) {
  for (const [posicao, pontos] of Object.entries(positionScores)) {
      pontos.forEach(({ id, ponto }) => {
          // Encontra o ID do círculo correspondente à posição
          console.log('la ponsicion '+posicao)
          const circleElement = document.getElementById(`circle-${id}`); // Acha o círculo pelo ID      
          if (circleElement) { // Verifica se o círculo existe
            if (ponto > 0) {
                // Remove todas as classes possíveis para evitar conflitos
                circleElement.classList.remove('scored-brown', 'scored-green', 'scored-white', 'no-score');
        
                // Adiciona a classe correta com base no valor de ponto
                if (ponto === 2) {
                    circleElement.classList.add('scored-white');
                } else if (ponto === 3) {
                    circleElement.classList.add('scored-green');
                } else {
                    circleElement.classList.add('scored-brown'); // Default para outros pontos (> 3)
                }
                
                circleElement.style.backgroundColor = ""; // Resetando a cor
            } else if (ponto === 0) {
                // Se o ponto for 0, configura como 'no-score'
                circleElement.classList.remove('scored-brown', 'scored-green', 'scored-white');
                circleElement.classList.add('no-score');
                circleElement.style.backgroundColor = ""; // Resetando a cor
            } else {
                // Para casos de ponto nulo ou indefinido, usa cinza claro
                circleElement.style.backgroundColor = "lightgray";
            }
        }
        
      });
  }
}




async function processMessage(message) {
  console.log('na área' + message.it_id_participante)  
  // const ChallengeData =await axios.get(`${apiUrl6}`);
  //        const it_challenge = ChallengeData.data.it_challenge; 
  //       const roundData =  axios.get(`${apiUrl5}`);
  //       const it_round = await roundData.data.it_round; 
  //        loadDatas(message.it_id_participante,it_round);
        // console.log('na área224s' + it_round)
  // loadPlayers(message.it_id_participante, it_round) 
  try {
    const data = JSON.parse(message);

    console.log('qual accao? ' + data.action)

    

    if (data.action === "addPoints" && isTimerRunning) {
      const scoreElement = document.getElementById("score");
      const currentScore = parseInt(scoreElement.textContent);
      scoreElement.textContent = formatarPontuacao(currentScore + data.points);

      // Animação na pontuação
      scoreElement.classList.add('highlight');
      setTimeout(() => {
        scoreElement.classList.remove('highlight');
      }, 1000);
    } else if (data.action === "pauseTimer") {
      document.getElementById("status").textContent = "Status: Pausado";
      document.getElementById("status").className = "status-paused";
      clearInterval(timerInterval);
      isTimerRunning = false; // Indica que o timer está pausado
    } else if (data.action === "startTimer") {
      document.getElementById("status").textContent = "Status: Ativo";
      document.getElementById("status").className = "status-active";
      isTimerRunning = true;
      startTimer(); // Inicia o timer a partir do tempo que foi parado
    } else if (data.action === "resetTimer") {
      resetTimer();
    }
    
  } catch (error) {
    console.error("Erro ao processar a mensagem WebSocket:", error);
  }
}
function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (timeLeft > 0 || milliseconds > 0) {
      if (milliseconds <= 0) {
        if (timeLeft > 0) {
          timeLeft--;
          milliseconds = 990; // Reinicia milissegundos para 990
        }
      } else {
        milliseconds -= 10; // Diminui 10 milissegundos
      }

      // Atualiza a exibição do timer
      const displayedMilliseconds = Math.floor(milliseconds / 100); // Obtém apenas o primeiro dígito dos milissegundos
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;

      // Monta a string do timer com minutos apenas se diferentes de zero
      const timerText = minutes > 0 ? `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${displayedMilliseconds}` : `${String(seconds).padStart(2, '0')}.${displayedMilliseconds}`;

      document.getElementById("timer").textContent = timerText;
    } else {

      ws.send(JSON.stringify({ action: "parou" }));
      
      clearInterval(timerInterval);
      isTimerRunning = false;
      document.getElementById("status").textContent = "Status: Finalizado";
      document.getElementById("status").className = "status-finished";

      // Toca o som do buzzer
      document.getElementById("buzzerSound").play();
    }
  }, 10); // Atualiza a cada 10 milissegundos
}

async function getTempo() {
  try {
      const timeData = await axios.get(`${apiUrlTempo}`);
      const tm_tempo = timeData.data.tm_tempo;    
      return tm_tempo;
      console.log('tempo2: ' + tm_tempo);
  } catch (error) {
      console.error('Erro ao obter o tempo:', error);
  }
}
async function resetTimer() {
  const tempo= await getTempo()
  console.log('tempo2: ' + tempo);

  clearInterval(timerInterval);
  timeLeft = tempo; // Reinicia o tempo para 70 segundos
  milliseconds = 0; // Zera os milissegundos
  document.getElementById("timer").textContent = `00:00.0`; // Exibe o tempo zerado
  document.getElementById("score").textContent = '00'; // Zera a pontuação ao reiniciar
  isTimerRunning = false; // O timer é reiniciado
}

async function inicializarScore(it_challenge, it_round) {
  // Inicializa um objeto para o score
  let scoreObj = { totalRoundPontos: 0 }; // Por padrão, assume que o valor será 0
  try {
    // Faz a requisição à API
    const response = await axios.get(`${apiUrl7}/${it_challenge}/${it_round}`);
    const data = response.data;

    // Verifica se a resposta trouxe algo
    if (data && data[0] && data[0].total_round_pontos !== undefined) {
      // Atualiza o valor no objeto score se houver dados válidos
      scoreObj.totalRoundPontos = data[0].total_round_pontos;
    }

    // Atualiza o conteúdo do elemento com o valor (seja 0 ou o valor da API)
    const scoreElement = document.getElementById("score");
    scoreElement.textContent =formatarPontuacao(scoreObj.totalRoundPontos) ;
    console.log('Pontuação inicial:', scoreObj.totalRoundPontos);

  } catch (error) {
    console.error("Erro ao buscar pontuação inicial:", error);
  }
}


