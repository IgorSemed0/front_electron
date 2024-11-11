const axios = require('axios');
const apiUrl = 'http://127.0.0.1:8002/api/grupo2/challenge';
const apiUrlCompeticao = 'http://127.0.0.1:8002/api/grupo1/competicao'; // URL para competições
const apiUrlJogador = 'http://127.0.0.1:8002/api/grupo1/jogadores'; // URL para jogadores

// Função para carregar todos os challenges
async function loadChallenges() {
  try {
    const response = await axios.get(apiUrl);
    const challenges = response.data;

    const challengesTableBody = document.querySelector("#challengesTable tbody");
    challengesTableBody.innerHTML = "";

    challenges.forEach((challenge) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${challenge.id}</td>
        <td>${challenge.jogador_nome}</td>
        <td>${challenge.competicao_nome}</td>       
        <td>
          <button onclick="editChallenge(${challenge.id})">Editar</button>
          <button onclick="deleteChallenge(${challenge.id})">Deletar</button>
        </td>
      `;

      challengesTableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Erro ao carregar challenges:', error);
  }
}

// Função para carregar competições
async function loadCompeticoes() {
  try {
    const response = await axios.get(apiUrlCompeticao);
    const competicoes = response.data;

    const competicaoSelect = document.getElementById("idCompeticao");
    competicaoSelect.innerHTML = '<option value="">Selecione uma Competição</option>'; // Limpar opções anteriores

    competicoes.forEach((competicao) => {
      const option = document.createElement("option");
      option.value = competicao.id; // ID da competição
      option.textContent = competicao.vc_name; // Nome da competição
      competicaoSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao carregar competições:', error);
  }
}

// Função para carregar jogadores
async function loadJogadores() {
  try {
    const response = await axios.get(apiUrlJogador);
    const jogadores = response.data;

    const jogadorSelect = document.getElementById("idJogador");
    jogadorSelect.innerHTML = ''; // Limpar opções anteriores

    jogadores.forEach((jogador) => {
      const option = document.createElement("option");
      option.value = jogador.id; // ID do jogador
      option.textContent = jogador.vc_name; // Nome do jogador
      jogadorSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao carregar jogadores:', error);
  }
}

// Função para salvar ou atualizar um challenge
document.getElementById('challengeForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const id = document.getElementById('challengeId').value;
  // const nome = document.getElementById('nome').value; // Nome do challenge
  // const tipo = document.getElementById('tipo').value; // Tipo do challenge
  const idCompeticao = document.getElementById('idCompeticao').value; // ID da competição
  const selectedJogadores = Array.from(document.getElementById('idJogador').selectedOptions).map(option => option.value); // IDs dos jogadores selecionados

  try {
    let challengeId;

    if (id) {
      // Atualizar challenge
      await axios.put(`${apiUrl}/${id}`, { vc_name: nome, vc_tipo_competicao: tipo, it_id_competicao: idCompeticao });
      challengeId = id; // Manter o ID do challenge existente
    } else {
      // Criar novo challenge
      for (const jogadorId of selectedJogadores) {
        // const response = await axios.post(apiUrl, { vc_name: 'USP', vc_tipo_competicao: 'tipo', it_id_competicao: idCompeticao , it_id_jogador: jogadorId});
        const response = await axios.post(apiUrl, {  it_id_competicao: idCompeticao , it_id_jogador: jogadorId});
      challengeId = response.data.id; // Obter o ID do novo challenge criado
      }
      // const response = await axios.post(apiUrl, { vc_name: nome, vc_tipo_competicao: tipo, it_id_competicao: idCompeticao });
      // challengeId = response.data.id; // Obter o ID do novo challenge criado
    }

    // Limpar associações anteriores na tabela challenges_jogadores
    // Isso deve ser removido, pois agora estamos usando a nova controller
    // await axios.delete(`${apiUrl}/${challengeId}/jogadores`);

    // Salvar jogadores associados
    // for (const jogadorId of selectedJogadores) {
    //   await axios.post(`${apiUrl}/${challengeId}/jogadores`, { it_id_jogador: jogadorId });
    // }

    loadChallenges();
    clearForm();
  } catch (error) {
    console.error('Erro ao salvar challenge:', error.response ? error.response.data : error.message);
  }
});

// Função para editar um challenge
async function editChallenge(id) {
  try {
    const response = await axios.get(`${apiUrl}/${id}`);
    const challenge = response.data;

    document.getElementById('challengeId').value = challenge.id;
    // document.getElementById('nome').value = challenge.vc_name;
    // document.getElementById('tipo').value = challenge.tipo;
    document.getElementById('idCompeticao').value = challenge.it_id_competicao; // Preencher select

    // Preencher select de jogadores
    const jogadorSelect = document.getElementById('idJogador');
    for (const option of jogadorSelect.options) {
      option.selected = challenge.it_id_jogadores.includes(option.value); // Selecionar jogadores já atribuídos
    }
  } catch (error) {
    console.error('Erro ao carregar challenge para edição:', error);
  }
}

// Função para deletar um challenge
async function deleteChallenge(id) {
  try {
    await axios.delete(`${apiUrl}/${id}`);
    loadChallenges();
  } catch (error) {
    console.error('Erro ao deletar challenge:', error);
  }
}

// Função para limpar o formulário
function clearForm() {
  document.getElementById('challengeId').value = '';
  // document.getElementById('nome').value = '';
  // document.getElementById('tipo').value = '';
  document.getElementById('idCompeticao').value = ''; // Limpar select

  // Limpar seleção de jogadores
  const jogadorSelect = document.getElementById('idJogador');
  for (const option of jogadorSelect.options) {
    option.selected = false;
  }
}

// Carregar challenges, competições e jogadores ao abrir a página
loadChallenges();
loadCompeticoes();
loadJogadores();
